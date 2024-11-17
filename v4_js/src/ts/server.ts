import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';
import pkg from 'sqlite3';
import { DEFAULT_POSITION_STRING } from './game.js';


import { createRequire } from "module";
import { spec } from 'node:test/reporters';
const require = createRequire(import.meta.url);
const nunjucks = require('nunjucks');

const { Database } = pkg;

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

app.get('/play', (_, res) => {
        res.render('play.html', { title: 'Play' });
});

app.get('/analyze', (req, res) => {
        console.log("query position", req.query.position);
        res.render('analyze.html', {
                title: 'Analyze',
                startPosition: (req.query.position) ? req.query.position : DEFAULT_POSITION_STRING,
                setupEvents: true,
                flip: true,
                draw: false,
                resign: false,
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
        let positionSpecifications: String[] = [];
        db.each("SELECT name, specification FROM position",
                (_: Error, row: any) => {
                        positionSpecifications.push(row);
                }, () => {
                        res.json(positionSpecifications);
                });
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

        const handleResultFromDatabaseAfterSavePosition = function(error: any) {
                let message = `Position saved: ${uniqueName}`;
                const UNIQUE_CONSTRAINT_FAILED = 19;
                if (error) {
                        if (error.errno === UNIQUE_CONSTRAINT_FAILED) {
                                message = "You have already saved this position.";
                        } else {
                                message = `Failed to save position: ${String(error)}`;
                        }
                }
                res.json({ 'message': message });
        }

        db.run("INSERT INTO position(name, specification) VALUES(?,?)",
                [uniqueName, specification],
                handleResultFromDatabaseAfterSavePosition,
        );

});

app.get('/getposition', (req, res) => {

});

app.use(express.static(__dirname));

io.on('connection', (socket) => {
        console.log(
                'a user connected',
                io.engine.clientsCount,
                io.of('/').sockets.size,
                socket.id,
        );

        socket.on('chat message', (msg) => {
                console.log('message: ' + msg);
                io.emit('chat message', msg);
        });

        socket.on('disconnect', () => {
                console.log(
                        'user disconnected',
                        io.engine.clientsCount,
                        io.of('/').sockets.size,
                        socket.id,
                );
        });
});

server.listen(port, () => {
        console.log(`server running at http://localhost:${port}`);
});

