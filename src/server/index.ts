import { ChildProcess, fork } from 'child_process';
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

let ml: ChildProcess;

wsServer.on('connection', ws => {

    // ws.send('hello');

    if (ml !== undefined) {
        ml.on('message', message => {
            ws.send(message);
        });
    }

    ws.on('message', message => {
        switch (message.substring(0, 2)) {
            case 'ST':
                ml = fork('build/worker.js');
                ml.send(message.substring(2));
                ml.on('message', message => {
                    ws.send(message);
                });
                ml.on('exit', () => console.log('Process got killed'));
                break;
            case 'SP':
                ml.kill();
                break;
        }
        
    });
});