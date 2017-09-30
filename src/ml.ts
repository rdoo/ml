import { Config } from './config';
import { Globals } from './globals';
import { Runner } from './runner';

export let CONFIG: Config;
export let GLOBALS: Globals;


process.on('message', message => {
    const parsedMessage: any = JSON.parse(message);
    CONFIG = JSON.parse(parsedMessage.config);
    const inputData: any[] = JSON.parse(parsedMessage.inputData);
    console.log(CONFIG);
    GLOBALS = new Globals();

    const runner: Runner = new Runner();
    runner.inputData = inputData;

    while (runner.bestNetwork.fitness > CONFIG.fitnessThreshold) {
        runner.run();
    }

    runner.printResults();
});