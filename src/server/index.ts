import { Express } from 'express';
import * as express from 'express';
import { createServer, Server } from 'http';
import { join } from 'path';
import { Server as webSocketServer } from 'uws';

const app: Express = express();
app.use('/', express.static(join(__dirname, 'client')));
app.get('/*', (req, res) => res.sendFile(join(__dirname, 'client', 'index.html')));

const server: Server = createServer(app);
const wsServer: webSocketServer = new webSocketServer({ server });

const port: string = process.env.PORT || '8080';

server.listen(port, () => console.log(new Date().toString().split(' ')[4] + ' - Server is listening on port ' + server.address().port));

wsServer.on('connection', ws => {
    ws.send('hello');

    ws.on('message', message => {
        console.log(message);
    });
});