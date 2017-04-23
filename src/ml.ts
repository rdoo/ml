import { Config } from './config';
import { Globals } from './globals';
import { Runner } from './runner';

export let CONFIG: Config;
export let GLOBALS: Globals;

onmessage = (event) => {
    CONFIG = event.data[0];
    GLOBALS = new Globals();

    const runner: Runner = new Runner();

    while (runner.bestNetwork.fitness > CONFIG.fitnessThreshold) {
        runner.run();
    }

    runner.printResults();
}