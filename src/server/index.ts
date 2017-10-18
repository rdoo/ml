import { ChildProcess, fork } from 'child_process';
import { Express } from 'express';
import * as express from 'express';
import { createWriteStream, readFile } from 'fs';
import { createServer, get, Server } from 'http';
import { join } from 'path';
import { Server as webSocketServer } from 'uws';

import { getStringDataFromFile, readFilenamesInDirectory, transformData } from '../data/generator';

const app: Express = express();
app.use('/', express.static(join(__dirname, 'client')));
app.get('/*', (req, res) => res.sendFile(join(__dirname, 'client', 'index.html')));

const server: Server = createServer(app);
const wsServer: webSocketServer = new webSocketServer({ server });

const port: string = process.env.PORT || '8080';

server.listen(port, () => console.log(new Date().toString().split(' ')[4] + ' - Server is listening on port ' + server.address().port));

const inputData: any[] = [];
const inputDataNames: string[] = [];
let outputData: string;
let fileName: string;

// readFilenamesInDirectory('src/data/dump').then(names => {
//     const ticker: string = 'PZU';
//     for (const name of names) {
//         getStringDataFromFile('src/data/dump/' + name).then(data => {
//             const stockData = chooseDataOfStock(data, ticker);
//             saveDataToFile('src/data/' + ticker + '/' + name, stockData);
//         });
//     }
// });

readFilenamesInDirectory('build/data').then(names => {
    for (const name of names) {
        getStringDataFromFile('build/data/' + name).then(data => transformData(data)).then(data => {
            if (data.length !== 0) {
                const desc: string = 'PZU - ' + name.substring(0, name.length - 4); // strip extension
                inputData.push({ desc, data });
                inputDataNames.push(desc);
            }
        });
    }
});

// const xorData: any[] = [];
// for (let i = 0; i < 100; i++) {
//     const XOR = XORArray[Math.floor(Math.random() * XORArray.length)];
//     xorData.push(XOR);
// }
// inputData = JSON.stringify(xorData);

let running: boolean = false;

let ml: ChildProcess = fork('build/ml.js');

ml.on('message', handleMLData);

ml.on('exit', () => {
    console.log('Process got killed');
    if (IS_HEROKU) {
        process.exit(1);
    } else {
        wsServer.broadcast('RU' + JSON.stringify({ running }));
    }
});

wsServer.on('connection', ws => {
    ws.send('RU' + JSON.stringify({ running }));
    if (inputDataNames.length !== 0) {
        ws.send('NA' + JSON.stringify(inputDataNames));
    }
    if (outputData !== undefined) {
        ws.send('ST' + outputData);
    }

    ws.on('message', message => {
        switch (message.substring(0, 2)) {
            case 'ST':
                if (!IS_HEROKU && !ml.connected) {
                    ml = fork('build/ml.js');

                    ml.on('message', handleMLData);
                    ml.on('exit', () => console.log('Process got killed'));
                }
                const parsedMessage: any = JSON.parse(message.substring(2));
                fileName = parsedMessage.options.fileName;
                if (parsedMessage.options.startMode === 'fresh') {
                    parsedMessage.options.inputValue = '';
                    ml.send(JSON.stringify({ configData: parsedMessage, inputData }));
                    running = true;
                    ws.send('RU' + JSON.stringify({ running }));
                } else if (parsedMessage.options.startMode === 'file') {
                    readFile('build/' + fileName, 'utf8', (err, data) => {
                        if (err) {
                            console.error(err);
                        } else {
                            parsedMessage.options.inputValue = data;
                            ml.send(JSON.stringify({ configData: parsedMessage, inputData }));
                            running = true;
                            ws.send('RU' + JSON.stringify({ running }));
                        }
                    });
                } else {
                    ml.send(JSON.stringify({ configData: parsedMessage, inputData }));
                    running = true;
                    ws.send('RU' + JSON.stringify({ running }));
                }
                break;
            case 'SP':
                if (IS_HEROKU) {
                    process.exit(1);
                }
                ml.kill();
                running = false;
                setTimeout(() => ws.send('RU' + JSON.stringify({ running })), 100);
                break;
            case 'DA':
                const name = message.substring(2);
                for (const item of inputData) {
                    if (item.desc === name) {
                        ws.send('IN' + JSON.stringify(item));
                        break;
                    }
                }
                break;
        }
        
    });
});

function handleMLData(data: string) {
    outputData = data;
    console.log('Data received from worker');
    wsServer.broadcast('ST' + data);

    if (fileName) {
        const writer = createWriteStream('build/' + fileName);
        writer.write(data);
    }
}

if (process.env.AUTORUN) {
    setTimeout(() => {
        if (running) {
            return;
        }

        readFile('build/data.txt', 'utf8', (err, data) => {
            if (err) {
                console.error(err);
            } else {
                const parsedMessage: any = { options: { } };
                parsedMessage.options.inputValue = data;
                ml.send(JSON.stringify({ configData: parsedMessage, inputData }));
                running = true;
            }
        });
    }, 30000); // 30 sekund
}

if (process.env.URL) {
    setInterval(() => {
        console.log('Anti-idler');
        get(process.env.url);
    }, 1500000); // 25 minut
}