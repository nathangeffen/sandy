import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';
import pkg from 'sqlite3';
import { DEFAULT_POSITION_STRING } from './game.js';


import { createRequire } from "module";
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

// app.set('views', join(__dirname, 'views'));
// app.set('view engine', 'pug');
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

app.get('/analyze/:startPosition', (req, res) => {
        console.log("start analyze custom:", req.params);
        res.render('analyze.html', {
                title: 'Analyze',
                startPosition: req.params.startPosition,
                setupEvents: true
        });
});

app.get('/analyze', (req, res) => {
        console.log("start analyze standard:", req.params);
        res.render('analyze.html', {
                title: 'Analyze',
                startPosition: DEFAULT_POSITION_STRING,
                setupEvents: true
        });
});

app.get('/position', (_, res) => {
        let positionSpecifications: String[] = [];
        db.each("SELECT name FROM position", (_, row: any) => {
                positionSpecifications.push(row.name);
        });
        res.render('position.html', {
                title: 'Setup a position',
                positionSpecifications: positionSpecifications
        });
});


app.post('/saveposition', (req, res) => {
        const positionString = req.body;
        const UNIQUE_CONSTRAINT_FAILED = 19;
        let message = "Position saved!";

        const handleResultFromDatabaseAfterSavePosition = function(error: any) {
                if (error) {
                        if (error.errno === UNIQUE_CONSTRAINT_FAILED) {
                                message = "You have already saved this position.";
                        } else {
                                message = "Failed to save position: " + String(error);
                        }
                }
                res.json({ 'message': message });
        }

        db.run("INSERT INTO position(position_string) VALUES(?)",
                [positionString['positionString']],
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

