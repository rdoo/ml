import { Config } from './config';
import { Globals } from './globals';
import { Runner } from './runner';
import { XORArray } from './data/xor';
import { Network } from './network';

export let CONFIG: Config;
export let GLOBALS: Globals;

const inputData: any[] = [];
for (let i = 0; i < 100; i++) {
    const XOR = XORArray[Math.floor(Math.random() * XORArray.length)];
    inputData.push(XOR);
}

process.on('message', message => {
    CONFIG = JSON.parse(message);
    console.log(CONFIG);
    GLOBALS = new Globals();

    const runner: Runner = new Runner();
    runner.inputData = inputData;

    while (runner.bestNetwork.fitness > CONFIG.fitnessThreshold) {
        runner.run();
    }

    runner.printResults();
});