import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';
import Database from 'better-sqlite3';
import { DEFAULT_POSITION_STRING } from './game.js';
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const nunjucks = require('nunjucks');
const port = Number(process.env.PORT || 0);
const database = process.env.DB;
const app = express();
const server = createServer(app);
const io = new Server(server);
const db = new Database(database);
let __dirname = dirname(fileURLToPath(import.meta.url));
if (__dirname.endsWith('/js')) {
    __dirname = join(__dirname, '..');
}
;
app.use(express.json());
nunjucks.configure(join(__dirname, 'views'), {
    autoescape: true,
    express: app
});
app.get('/', (_, res) => {
    res.render('index.html', { title: 'Home' });
});
app.get('/findopponent', (_, res) => {
    res.render('findopponent.html', { title: 'Find opponent' });
});
app.get('/play', (req, res) => {
    console.log("Executing play", req.query);
    const gameUXState = (req.query.side === 'S') ? 1 /* GameUXState.WaitingUser */ : 2 /* GameUXState.WaitingOtherPlayer */;
    const game = dbGetGame(Number(req.query.game));
    const side = (req.query.side === 'S') ? 'South' : 'North';
    console.log("Side:", game.side);
    res.render('play.html', {
        startPosition: game.specification,
        gameUXState: gameUXState,
        south: game.south,
        north: game.north,
        thisSide: side,
        gameId: game.rowid
    });
});
app.get('/analyze', (req, res) => {
    res.render('analyze.html', {
        startPosition: (req.query.position) ? req.query.position : DEFAULT_POSITION_STRING
    });
});
app.get('/position', (_, res) => {
    let positionSpecifications = [];
    res.render('position.html', {
        title: 'Setup a position',
        positionSpecifications: positionSpecifications
    });
});
app.get('/loadpositions', (_, res) => {
    const rows = db.prepare("SELECT name, specification FROM position").all();
    res.json(rows);
});
app.post('/saveposition', (req, res) => {
    const specification = req.body['specification'];
    const hashSpecification = function () {
        let hashAddress = 0;
        for (let counter = 0; counter < specification.length; counter++) {
            hashAddress = specification.charCodeAt(specification[counter]) +
                (hashAddress << 6) + (hashAddress << 16) - hashAddress;
        }
        return hashAddress;
    };
    const generateUniqueName = function () {
        const millisecondsSince20241117 = Number(new Date()) - 1731801600000;
        const hash = hashSpecification();
        return `${millisecondsSince20241117}-${hash}`;
    };
    const uniqueName = generateUniqueName();
    let message;
    try {
        dbCreatePosition(uniqueName, specification);
        message = `Position saved: ${uniqueName}`;
    }
    catch (error) {
        message = `An error occurred: ${error}`;
    }
    res.json({ 'message': message });
});
app.get('/getposition', (req, res) => {
});
app.use(express.static(__dirname));
export const dbCreatePosition = function (name, specification) {
    db.prepare("INSERT INTO position(name, specification) VALUES(?,?)").
        run(name, specification);
};
export const dbClearPool = function () {
    db.prepare("DELETE FROM gamesearch").run();
};
export const dbPlaceInPool = function (poolEntry) {
    let positionId = 1;
    if (poolEntry.name !== "DEFAULT") {
        const row = db.prepare("SELECT rowid FROM position WHERE name = ?").
            get(poolEntry.name);
        console.log("entry, row", poolEntry, row);
        positionId = row.rowid;
    }
    db.prepare("INSERT INTO gamesearch (session, position_id) VALUES(?, ?)").
        run(poolEntry.session, positionId);
};
export const dbRemoveFromPool = function (session) {
    db.prepare("DELETE FROM gamesearch WHERE session = ?").
        run(session);
};
const handlePoolEntry = function (poolEntry) {
    if (poolEntry.gameRequested === true) {
        dbRemoveFromPool(poolEntry.session);
        dbPlaceInPool(poolEntry);
    }
    else {
        dbRemoveFromPool(poolEntry.session);
    }
};
export const dbGetPoolEntries = function () {
    const rows = db.prepare(`
                SELECT A.session, B.name
                FROM gameSearch A, position B
                WHERE A.position_id = B.rowid
                        AND A.created > datetime('now','-3 minute')`)
        .all();
    return rows;
};
export const dbGetPoolEntryForSession = function (session) {
    const row = db.prepare(`
                SELECT  A.session, A.position_id, B.specification
                FROM    gamesearch A, position B
                WHERE   A.session = ? AND
                        B.rowid = A.position_id AND
                        A.created > datetime('now','-3 minute')`).
        get(session);
    return row;
};
export const dbCreateGame = function (gameDetails) {
    const result = structuredClone(gameDetails);
    db.prepare(`
                INSERT INTO game (south, north, start_position_id)
                VALUES(?, ?, ?)
                `).
        run(gameDetails.south, gameDetails.north, gameDetails.positionId);
    const id = db.prepare("SELECT last_insert_rowid()").get();
    result.id = id['last_insert_rowid()'];
    result.south += String(gameDetails.id);
    result.north += String(gameDetails.id);
    db.prepare(`
                UPDATE game
                SET south = ?, north = ?
                WHERE rowid = ?
                `).
        run(result.south, result.north, result.id);
    return result;
};
export const dbGetGame = function (id) {
    const row = db.prepare(`
                        SELECT  A.rowid, A.south, A.north, B.name, B.specification
                        FROM    game A, position B
                        WHERE   A.rowid = ? AND
                                B.rowid = A.start_position_id
                `).get(id);
    return row;
};
io.on('connection', (socket) => {
    console.log('a user connected', io.engine.clientsCount, io.of('/').sockets.size, socket.id);
    socket.on('placePool', (entry) => {
        let entries;
        (async () => {
            handlePoolEntry(entry);
            entries = dbGetPoolEntries();
        })().then(() => {
            io.emit('placePool', entries);
        });
    });
    socket.on('chooseopponent', (players) => {
        const row = dbGetPoolEntryForSession(players[1]);
        if (!row)
            return;
        dbRemoveFromPool(players[0]);
        dbRemoveFromPool(players[1]);
        let gameDetails = {
            id: 0,
            name: row.name,
            positionId: row.position_id,
            specification: row.specification,
            side: "S",
            south: "g-",
            north: "g-"
        };
        gameDetails = dbCreateGame(gameDetails);
        io.emit(players[0], gameDetails);
        gameDetails.side = "N";
        io.emit(players[1], gameDetails);
    });
    socket.on("game", (transmitMove) => {
        console.log(transmitMove);
        io.emit(`g-${transmitMove.gameId}`, transmitMove);
    });
    socket.on('disconnect', () => {
        const poolEntry = {
            session: socket.id,
            name: "DEFAULT",
            gameRequested: false
        };
        (async () => dbRemoveFromPool(poolEntry.session))()
            .then(() => {
            console.log('user disconnected', io.engine.clientsCount, io.of('/').sockets.size, socket.id);
        });
    });
});
setInterval(() => {
    (async () => {
        db.prepare("DELETE FROM gamesearch WHERE created <= datetime('now','-5 minute')").run();
    })().then(() => {
        io.emit('placePool', dbGetPoolEntries());
    });
}, 10000);
if (port !== 0) {
    server.listen(port, () => {
        console.log(`server running at http://localhost:${port}`);
    });
}
