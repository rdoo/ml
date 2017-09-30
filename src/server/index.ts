import { ChildProcess, fork } from 'child_process';
import { Express } from 'express';
import * as express from 'express';
import { createServer, Server } from 'http';
import { join } from 'path';
import { Server as webSocketServer } from 'uws';

import { getStringDataFromFile, transformData } from '../data/generator';
import { XORArray } from '../data/xor';

const app: Express = express();
app.use('/', express.static(join(__dirname, 'client')));
app.get('/*', (req, res) => res.sendFile(join(__dirname, 'client', 'index.html')));

const server: Server = createServer(app);
const wsServer: webSocketServer = new webSocketServer({ server });

const port: string = process.env.PORT || '8080';

server.listen(port, () => console.log(new Date().toString().split(' ')[4] + ' - Server is listening on port ' + server.address().port));



let ml: ChildProcess;

let inputData: string;
let outputData: string;

getStringDataFromFile().then(data => transformData(data)).then(data => {
    inputData = JSON.stringify(data);
});

// const xorData: any[] = [];
// for (let i = 0; i < 100; i++) {
//     const XOR = XORArray[Math.floor(Math.random() * XORArray.length)];
//     xorData.push(XOR);
// }
// inputData = JSON.stringify(xorData);

wsServer.on('connection', ws => {

    ws.send(JSON.stringify({ running: !!(ml && ml.connected) }));
    if (inputData !== undefined) {
        ws.send(inputData);
    }
    if (outputData !== undefined) {
        ws.send(outputData);
    }

    if (ml !== undefined) {
        ml.on('message', message => {
            ws.send(message);
        });
    }

    ws.on('message', message => {
        switch (message.substring(0, 2)) {
            case 'ST':
                ml = fork('build/ml.js');
                ml.send(JSON.stringify({ config: message.substring(2), inputData }));
                ml.on('message', message => {
                    outputData = message;
                    ws.send(message);
                });
                ml.on('exit', () => console.log('Process got killed'));
                ws.send(JSON.stringify({ running: !!(ml && ml.connected) }));
                break;
            case 'SP':
                ml.kill();
                setTimeout(() => ws.send(JSON.stringify({ running: !!(ml && ml.connected) })), 100);
                break;
            // case 'DA':
            //     const [ticker, date] = message.substring(2).split(':');
            //     getStringDataFromFile().then(data => transformData(data)).then(data => {
            //         inputData = JSON.stringify(data);
            //         ws.send(inputData);
            //     });
            //     break;
        }
        
    });
});