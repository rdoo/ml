import { StateSerialized } from './serialization.models';
import { Config } from './config';
import { Globals } from './globals';
import { Runner } from './runner';

export let CONFIG: Config;
export let GLOBALS: Globals;

let runner: Runner;

function delayedRunForHeroku() {
    runner.run();
    setTimeout(() => delayedRunForHeroku(), 0);
}

process.on('message', message => {
    const parsedMessage: any = JSON.parse(message);

    runner = new Runner();
    runner.inputData = parsedMessage.inputData;;

    if (parsedMessage.configData.options.inputValue) {
        const stateSerialized: StateSerialized = JSON.parse(parsedMessage.configData.options.inputValue);
        CONFIG = stateSerialized.config;
        GLOBALS = stateSerialized.globals;
        runner.init(stateSerialized);
    } else {
        CONFIG = parsedMessage.configData.config;
        GLOBALS = new Globals();
        runner.initBasic();
    }

    console.log(CONFIG);

    if (IS_HEROKU) {
        delayedRunForHeroku();
    } else {
        while (runner.bestNetwork.fitness < CONFIG.fitnessThreshold) {
            runner.run();
        }

        console.log('Simulation ended')
        runner.printResults();
        process.exit();
    }
});