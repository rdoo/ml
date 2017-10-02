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
    // const type: string = message.substring(0, 2);

    // switch (type) {
    //     case 'CO':
    //         const parsedMessage: any = JSON.parse(message.substring(2));
    //         CONFIG = JSON.parse(parsedMessage.config);
    //         const inputData: any[] = JSON.parse(parsedMessage.inputData);
    //         console.log(CONFIG);
    //         GLOBALS = new Globals();
        
    //         runner = new Runner();
    //         runner.inputData = inputData;
    //         break;
    //     case 'RU': {
    //         runner.run();
    //     }
    // }


    const parsedMessage: any = JSON.parse(message);
    CONFIG = JSON.parse(parsedMessage.config);
    const inputData: any[] = JSON.parse(parsedMessage.inputData);
    console.log(CONFIG);
    GLOBALS = new Globals();

    runner = new Runner();
    runner.inputData = inputData;

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