import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';

const port = 3000;
const app = express();
const server = createServer(app);
const io = new Server(server);


let __dirname = dirname(fileURLToPath(import.meta.url));
if (__dirname.endsWith('/js')) {
        // __dirname = __dirname.substring(0, __dirname.length - 3);
        __dirname = join(__dirname, '..');
};

app.set('views', join(__dirname, 'views'));
app.set('view engine', 'pug');

app.get('/', (req, res) => {
        res.render('index', { title: 'Home' });
})

app.get('/findopponent', (req, res) => {
        res.render('findopponent', { title: 'Find opponent' });
});

app.get('/play', (req, res) => {
        res.render('play', { title: 'Play' });
});

app.get('/analyze', (req, res) => {
        res.render('analyze', { title: 'Analyze' });
});

app.get('/position', (req, res) => {
        res.render('position', { title: 'Setup a position' });
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
