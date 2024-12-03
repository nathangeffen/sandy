import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { Server } from 'socket.io';
import Database from 'better-sqlite3';
import { DEFAULT_POSITION_STRING } from './game.js';
import { PoolEntry, GameDetails } from "./common.js";

import { createRequire } from "module";
// import { spec } from 'node:test/reporters';
// import { Specification } from './components/specification.js';
const require = createRequire(import.meta.url);
const nunjucks = require('nunjucks');


const port = 3000;
const app = express();
const server = createServer(app);
const io = new Server(server);
const db = new Database('sakev.db');


let __dirname = dirname(fileURLToPath(import.meta.url));
if (__dirname.endsWith('/js')) {
        __dirname = join(__dirname, '..');
};

app.use(express.json());

nunjucks.configure(join(__dirname, 'views'), {
        autoescape: true,
        express: app
});

app.get('/', (_, res) => {
        res.render('index.html', { title: 'Home' });
})

app.get('/findopponent', (_, res) => {
        res.render('findopponent.html', { title: 'Find opponent' });
});

app.get('/play', (req, res) => {
        res.render('play.html', {
                startPosition: (req.query.position) ? req.query.position : DEFAULT_POSITION_STRING,
                southPlayerID: "XXX",
                northPlayerID: "YYY"
        });
});

app.get('/analyze', (req, res) => {
        res.render('analyze.html', {
                startPosition: (req.query.position) ? req.query.position : DEFAULT_POSITION_STRING
        });
});

app.get('/position', (_, res) => {
        let positionSpecifications: String[] = [];
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

        const hashSpecification = function() {
                let hashAddress = 0;
                for (let counter = 0; counter < specification.length; counter++) {
                        hashAddress = specification.charCodeAt(specification[counter]) +
                                (hashAddress << 6) + (hashAddress << 16) - hashAddress;
                }
                return hashAddress;
        }

        const generateUniqueName = function() {
                const millisecondsSince20241117 = Number(new Date()) - 1731801600000;
                const hash = hashSpecification();
                return `${millisecondsSince20241117}-${hash}`;
        }

        const uniqueName = generateUniqueName();

        let message: string;
        try {
                db.prepare("INSERT INTO position(name, specification) VALUES(?,?)").
                        run(uniqueName, specification);

                message = `Position saved: ${uniqueName}`;
        } catch (error: any) {
                message = `An error occurred: ${error}`;
        }
        res.json({ 'message': message });
});

app.get('/getposition', (req, res) => {


});

app.use(express.static(__dirname));

const placeInPool = function(poolEntry: PoolEntry) {
        let positionId = 1;
        if (poolEntry.name !== "DEFAULT") {
                const row: any = db.prepare(
                        "SELECT rowid FROM position WHERE name = ? AND user_id = 0").
                        get(poolEntry.name);
                positionId = row.rowid;
        }
        db.prepare("INSERT INTO gamesearch (session, position_id) VALUES(?, ?)").
                run(poolEntry.session, positionId);
}

const removeFromPool = function(poolEntry: PoolEntry) {
        db.prepare("DELETE FROM gamesearch WHERE session = ?").
                run(poolEntry.session);
}

const handlePoolEntry = function(poolEntry: PoolEntry) {
        if (poolEntry.gameRequested === true) {
                removeFromPool(poolEntry);
                placeInPool(poolEntry);
        } else {
                removeFromPool(poolEntry);
        }
}

const getPoolEntries = function() {
        const rows: any = db.prepare(
                "SELECT A.session, B.name FROM gameSearch A, position B WHERE A.position_id = B.rowid AND A.created > datetime('now','-3 minute')")
                .all();
        return rows;
}

io.on('connection', (socket) => {
        console.log(
                'a user connected',
                io.engine.clientsCount,
                io.of('/').sockets.size,
                socket.id,
        );

        socket.on('placePool', (msg) => {
                let entries: any;
                (async () => {
                        handlePoolEntry(msg);
                        entries = getPoolEntries();
                })().then(() => {
                        io.emit('placePool', entries);
                });
        });

        socket.on('chooseopponent', (players: string[]) => {
                console.log("Players", players);
                const row: any = db.prepare("SELECT  A.session, B.name, B.specification FROM gamesearch A, position B WHERE A.session = ? AND A.position_id = B.rowid AND A.created > datetime('now','-3 minute')").get(players[1]);
                if (!row) return;
                const gameDetailsChooser: GameDetails = {
                        action: "startgame",
                        name: row.name,
                        specification: row.specification,
                        opponent: players[1],
                        south: players[0]
                };
                io.emit(players[0], gameDetailsChooser);
                const gameDetailsChosen: GameDetails = {
                        ...gameDetailsChooser,
                        opponent: players[0]
                }
                io.emit(players[1], gameDetailsChosen);
        });

        socket.on('disconnect', () => {
                const poolEntry: PoolEntry = {
                        session: socket.id,
                        name: "DEFAULT",
                        gameRequested: false
                };
                (async () =>
                        removeFromPool(poolEntry))()
                        .then(() => {
                                console.log(
                                        'user disconnected',
                                        io.engine.clientsCount,
                                        io.of('/').sockets.size,
                                        socket.id,
                                )
                        });
        });
});

setInterval(() => {
        (async () => {
                db.prepare("DELETE FROM gamesearch WHERE created <= datetime('now','-5 minute')").run();
        })().then(() => {
                io.emit('placePool', getPoolEntries());
        });
}, 10000);

server.listen(port, () => {
        console.log(`server running at http://localhost:${port}`);
});

