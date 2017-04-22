import { Neuron } from './neuron';
import { Synapse } from './synapse';
import { Network } from './network';
import { Species } from './species';
import { XORArray } from './xor';

declare function postMessage(value?: any): any;

export const INNOVATION_GENERATOR: any = { value: 1 };
export const NEURON_ID_GENERATOR: any = { value: 1 };

onmessage = (event) => {
    const runner: Runner = new Runner();
    runner.init();

    while (runner.bestNetwork.fitness > 0.0001) {
        runner.run();
    }

    runner.printResults();
}

export class Runner {

NUMBER_OF_NETWORKS: number = 300;

speciesArray: Species[] = [];
bestNetwork: Network;

step: number = 0;

init() {
    const network: Network = new Network();
    network.init();

    this.bestNetwork = this.crossover(network, network);
    this.bestNetwork.fitness = 10000;

    const newSpecies: Species = new Species(network);
    newSpecies.networks.push(network);
    this.speciesArray.push(newSpecies);

    for (let i = 0; i < this.NUMBER_OF_NETWORKS - 1; i++) {
        const network: Network = new Network();
        network.init();
        newSpecies.networks.push(network);
    }

    postMessage([this.step, this.bestNetwork, this.speciesArray]);
}

// let step: number = 0;
// while (bestNetwork.fitness > 0.0001) {
//     setTimeout(() => run(), 0);

//     step++;
//     // if (step === 20000) {
//     //     break;
//     // }
// }

printResults() {
    // for (let species of this.speciesArray) {
    //     console.log(species.networks[0].toString());
    //     console.log('ilosc', species.networks.length);
    // }

    // console.log(this.bestNetwork.toString());
    // console.log('best network fitness:', this.bestNetwork.fitness);
    // for (let XOR of XORArray) {
    //     console.log(XOR);
    //     this.bestNetwork.inputs[0].value = XOR.i1;
    //     this.bestNetwork.inputs[1].value = XOR.i2;
    //     console.log(this.bestNetwork.evaluate());
    // }

    postMessage([this.step, this.bestNetwork, this.speciesArray]);
}

run() {
    let sumOfAverageFitnesses: number = 0;

    for (let species of this.speciesArray) {
        species.averageFitness = 0; // TODO sprawdzic czy to nie jest gdzies indziej zerowane
        for (let network of species.networks) {
            network.fitness = 0; // TODO sprawdzic czy to nie jest gdzies indziej zerowane
            for (let i = 0; i < 100; i++) {
                const XOR = XORArray[Math.floor(Math.random() * XORArray.length)];
                //for (let XOR of XORArray.concat(XORArray)) { // tu powinien byc random?
                    network.inputs[0].value = XOR.i1;
                    network.inputs[1].value = XOR.i2;
                    const val: number = Math.abs(network.evaluate() - XOR.o);
                    network.fitness += val;
                    species.averageFitness += val;
                //}
            }
        }
        species.averageFitness = species.averageFitness / species.networks.length;
        //console.log(species.averageFitness);
        //console.log(species.networks.length);
        sumOfAverageFitnesses += species.averageFitness;
    }
    //console.log(sumOfAverageFitnesses);

    // todo srednia fitnessu liczymy przed ubojem czy po?

    let sumaCzastek: number = 0; // do przemyslenia i to powaznie

    for (let species of this.speciesArray) {
        species.desiredPopulation = sumOfAverageFitnesses / species.averageFitness;
        sumaCzastek += species.desiredPopulation;
    }

    const maxNewNetworks: number = this.NUMBER_OF_NETWORKS - this.speciesArray.length;
    let sumOfNewNetworks: number = 0;

    for (let species of this.speciesArray) {
        species.desiredPopulation = Math.floor(species.desiredPopulation / sumaCzastek * maxNewNetworks) + 1; // +1 zeby zawsze byl przynajmniej 1 // 1 - zeby im wieksza fitness tym mniejsza pop
        sumOfNewNetworks += species.desiredPopulation;
        //console.log('desired populationn', species.desiredPopulation);
    }
    //if (this.NUMBER_OF_NETWORKS - sumOfNewNetworks > 0)
    this.speciesArray[this.speciesArray.length - 1].desiredPopulation += this.NUMBER_OF_NETWORKS - sumOfNewNetworks; // ostatnio powstalemu species dokladamy pozostajace miejsca

    this.getCulled();
    
    for (let species of this.speciesArray) {
        if (species.networks[0].fitness < this.bestNetwork.fitness) {
            this.bestNetwork = this.crossover(species.networks[0], species.networks[0]); // hack do otrzymania kopii network
            this.bestNetwork.fitness = species.networks[0].fitness;
        }
    }

    //console.log(this.step + ' ' + this.bestNetwork.fitness);
    if (this.step % 50 === 0) {
        postMessage([this.step, this.bestNetwork, this.speciesArray]);
    }
    //console.log(this.speciesArray.length);
    // TODO wszystkie networks trzeba przeorganizowac w nowe species????
    for (let species of this.speciesArray) {
        let speciesInitialLength: number = species.networks.length;
        while (speciesInitialLength < species.desiredPopulation) {
            const rnd1 = species.networks[Math.floor(Math.random() * species.networks.length)];
            const rnd2 = species.networks[Math.floor(Math.random() * species.networks.length)];

            const newNetwork = this.crossover2(rnd1, rnd2);
            newNetwork.mutate();

            let speciesFound: boolean = false;
            for (let species of this.speciesArray) {
                if (species.inSpecies(newNetwork)) {
                    species.networks.push(newNetwork);
                    speciesFound = true;
                    break;
                }
            }

            if (!speciesFound) {
                const newSpecies: Species = new Species(newNetwork);
                newSpecies.networks.push(newNetwork);
                this.speciesArray.push(newSpecies);
            }

            //networks.push();

            speciesInitialLength++;
        }
    }

    // segregacja do species

    // todo mutowac maja tylko sieci z crossoveru???
    // for (let species of speciesArray) {
    //     for (let network of species.networks) {
    //         network.mutate();
    //     }
    // }
    this.step++;
}

crossover(n1: Network, n2: Network): Network {
    const child: Network = new Network();

    for (let neuron of n1.inputs) { // moze kopiowac od tego bardziej fit?
        child.inputs.push(neuron.clone());
    }

    for (let neuron of n1.hidden) {
        child.hidden.push(neuron.clone());
    }

    child.output = n1.output.clone();

    for (let neuron1 of n1.hidden) {
        for (let synapse1 of neuron1.synapses) {
            loop: for (let neuron2 of n2.hidden) { // IIFE zamiast labelki??
                for (let synapse2 of neuron2.synapses) {
                    if (synapse1.innovation === synapse2.innovation) {
                        const rnd: number = Math.random();

                        if (rnd < 0.5) {
                            for (let neuron of child.inputs) {
                                if (neuron.id === synapse1.origin.id) {
                                    const newSynapse: Synapse = synapse1.clone(neuron);

                                    for (let parentNeuron of child.hidden) {
                                        if (parentNeuron.id === neuron1.id) {
                                            parentNeuron.synapses.push(newSynapse);
                                            break loop;
                                        }
                                    }

                                    if (child.output.id === neuron1.id) {
                                        child.output.synapses.push(newSynapse);
                                        break loop;
                                    }
                                }
                            }

                            for (let neuron of child.hidden) {
                                if (neuron.id === synapse1.origin.id) {
                                    const newSynapse: Synapse = synapse1.clone(neuron);

                                    for (let parentNeuron of child.hidden) {
                                        if (parentNeuron.id === neuron1.id) {
                                            parentNeuron.synapses.push(newSynapse);
                                            break loop;
                                        }
                                    }

                                    if (child.output.id === neuron1.id) {
                                        child.output.synapses.push(newSynapse);
                                        break loop;
                                    }
                                }
                            }

                            if (child.output.id === synapse1.origin.id) { // przypadek rekurencyjnego od outputu do hidden
                                const newSynapse: Synapse = synapse1.clone(child.output);

                                for (let parentNeuron of child.hidden) {
                                    if (parentNeuron.id === neuron1.id) {
                                        parentNeuron.synapses.push(newSynapse);
                                        break loop;
                                    }
                                }
                            }
                        } else {
                            for (let neuron of child.inputs) {
                                if (neuron.id === synapse2.origin.id) {
                                    const newSynapse: Synapse = synapse2.clone(neuron);

                                    for (let parentNeuron of child.hidden) {
                                        if (parentNeuron.id === neuron2.id) {
                                            parentNeuron.synapses.push(newSynapse);
                                            break loop;
                                        }
                                    }

                                    if (child.output.id === neuron2.id) {
                                        child.output.synapses.push(newSynapse);
                                        break loop;
                                    }
                                }
                            }

                            for (let neuron of child.hidden) {
                                if (neuron.id === synapse2.origin.id) {
                                    const newSynapse: Synapse = synapse2.clone(neuron);

                                    for (let parentNeuron of child.hidden) {
                                        if (parentNeuron.id === neuron2.id) {
                                            parentNeuron.synapses.push(newSynapse);
                                            break loop;
                                        }
                                    }

                                    if (child.output.id === neuron2.id) {
                                        child.output.synapses.push(newSynapse);
                                        break loop;
                                    }
                                }
                            }

                            if (child.output.id === synapse2.origin.id) { // przypadek rekurencyjnego od outputu do hidden
                                const newSynapse: Synapse = synapse2.clone(child.output);

                                for (let parentNeuron of child.hidden) {
                                    if (parentNeuron.id === neuron2.id) {
                                        parentNeuron.synapses.push(newSynapse);
                                        break loop;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    for (let synapse1 of n1.output.synapses) {
        loop: for (let synapse2 of n2.output.synapses) {
            if (synapse1.innovation === synapse2.innovation) {
                const rnd: number = Math.random();

                if (rnd < 0.5) {
                    for (let neuron of child.inputs) {
                        if (neuron.id === synapse1.origin.id) {
                            const newSynapse: Synapse = synapse1.clone(neuron);
                            child.output.synapses.push(newSynapse);
                            break loop;
                        }
                    }
                    for (let neuron of child.hidden) {
                        if (neuron.id === synapse1.origin.id) {
                            const newSynapse: Synapse = synapse1.clone(neuron);
                            child.output.synapses.push(newSynapse);
                            break loop;
                        }
                    }
                } else {
                    for (let neuron of child.inputs) {
                        if (neuron.id === synapse2.origin.id) {
                            const newSynapse: Synapse = synapse2.clone(neuron);
                            child.output.synapses.push(newSynapse);
                            break loop;
                        }
                    }
                    for (let neuron of child.hidden) {
                        if (neuron.id === synapse2.origin.id) {
                            const newSynapse: Synapse = synapse2.clone(neuron);
                            child.output.synapses.push(newSynapse);
                            break loop;
                        }
                    }
                }
            }
        }
    }

    // for (let synapse1 of n1.synapses) {
    //     for (let synapse2 of n2.synapses) {
    //         if (synapse1.innovation === synapse2.innovation) {
    //             const rnd: number = Math.random();


    //         }
    //     }
    // }

// todo to ponizej to test crossoveru
    for (let neuron of child.hidden) {
        if (neuron.synapses.length === 0) {

            let numberOfSynapses = 0;

            for (let neuronx of child.hidden) {
                for (let synapsex of neuronx.synapses) {
                    if (synapsex.origin.id === neuron.id) {
                        numberOfSynapses++;
                    }
                }
            }

            for (let synapsex of child.output.synapses) {
                if (synapsex.origin.id === neuron.id) {
                    numberOfSynapses++;
                }
            }

            if (numberOfSynapses === 0) {


                const species1 = new Species(n1);
                n1.fitness = 1;
                species1.networks.push(n1);

                const species2 = new Species(n2);
                n2.fitness = 1;
                species2.networks.push(n2);

                child.fitness = 0;
                const species3 = new Species(child);
                species3.networks.push(child);

                this.speciesArray = [species1, species2, species3];
                postMessage([this.step, this.bestNetwork, this.speciesArray]);
                console.log('elo');
                break;
            }
        }
    }


    return child;
}

getCulled() {
    for (let species of this.speciesArray) {
        species.networks.sort((network1, network2) => {
            return network1.fitness - network2.fitness;
        });

        const numberOfGettingCulled: number = Math.floor(species.networks.length * 0.8);

        species.networks.splice(species.networks.length - numberOfGettingCulled, numberOfGettingCulled);
    }
}

crossover2(n1: Network, n2: Network): Network {
    let moreFit: Network;
    let lessFit: Network;

    if (n1.fitness >= n2.fitness) {
        moreFit = n1;
        lessFit = n2;
    } else {
        moreFit = n2;
        lessFit = n1;
    }

    const child: Network = new Network();

    for (let neuron of moreFit.inputs) {
        child.inputs.push(neuron.clone());
    }

    for (let neuron of moreFit.hidden) {
        child.hidden.push(neuron.clone());
    }

    child.output = moreFit.output.clone();

    for (let neuron of moreFit.hidden) {
        for (let synapse of neuron.synapses) {
            const synapseBeingResult = lessFit.isSynapseInHiddenWithId(synapse.innovation);
            if (synapseBeingResult.result) {
                const newOrigin = child.findNeuronWithId(synapse.origin.id);
                const newHost = child.findNeuronWithId(neuron.id);
                const newSynapse = synapse.clone(newOrigin);

                const rnd: number = Math.random();

                // waga jest randomowa pomiedzy synapse w moreFit i lessFit
                if (rnd < 0.5) {
                    newSynapse.weight = synapseBeingResult.weight;
                }

                newHost.synapses.push(newSynapse);
            } else {
                const newOrigin = child.findNeuronWithId(synapse.origin.id);
                const newHost = child.findNeuronWithId(neuron.id);
                const newSynapse = synapse.clone(newOrigin);
                newHost.synapses.push(newSynapse);
            }

        }
    }

        for (let synapse of moreFit.output.synapses) {
            const synapseBeingResult = lessFit.isSynapseInHiddenWithId(synapse.innovation);
            if (synapseBeingResult.result) {
                const newOrigin = child.findNeuronWithId(synapse.origin.id);
                const newHost = child.findNeuronWithId(moreFit.output.id);
                const newSynapse = synapse.clone(newOrigin);

                const rnd: number = Math.random();

                // waga jest randomowa pomiedzy synapse w moreFit i lessFit
                if (rnd < 0.5) {
                    newSynapse.weight = synapseBeingResult.weight;
                }

                newHost.synapses.push(newSynapse);
            } else {
                const newOrigin = child.findNeuronWithId(synapse.origin.id);
                const newHost = child.findNeuronWithId(moreFit.output.id);
                const newSynapse = synapse.clone(newOrigin);
                newHost.synapses.push(newSynapse);
            }

        }


// todo to ponizej to test crossoveru
    for (let neuron of child.hidden) {
        if (neuron.synapses.length === 0) {

            let numberOfSynapses = 0;

            for (let neuronx of child.hidden) {
                for (let synapsex of neuronx.synapses) {
                    if (synapsex.origin.id === neuron.id) {
                        numberOfSynapses++;
                    }
                }
            }

            for (let synapsex of child.output.synapses) {
                if (synapsex.origin.id === neuron.id) {
                    numberOfSynapses++;
                }
            }

            if (numberOfSynapses === 0) {


                const species1 = new Species(n1);
                n1.fitness = 1;
                species1.networks.push(n1);

                const species2 = new Species(n2);
                n2.fitness = 1;
                species2.networks.push(n2);

                child.fitness = 0;
                const species3 = new Species(child);
                species3.networks.push(child);

                this.speciesArray = [species1, species2, species3];
                postMessage([this.step, this.bestNetwork, this.speciesArray]);
                console.log('elo');
                break;
            }
        }
    }

    return child;
}

}