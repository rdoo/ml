import { Neuron } from './neuron';
import { Synapse } from './synapse';
import { Network } from './network';
import { Species } from './species';

export const INNOVATION_GENERATOR: any = { value: 1 };
export const NEURON_ID_GENERATOR: any = { value: 1 };

let change = 'asdsdddasaaadaadadaaaaaaa'
const NUMBER_OF_NETWORKS: number = 200;
const NUMBER_OF_RUNS: number = 1300;

//const networks: Network[] = [];

const speciesArray: Species[] = [];

let bestNetwork: any = { fitness: 1000000 };

const XORArray = [
    {
        i1: 0,
        i2: 0,
        o: 0
    },
    {
        i1: 0,
        i2: 1,
        o: 1
    },
    {
        i1: 1,
        i2: 0,
        o: 1
    },
    {
        i1: 1,
        i2: 1,
        o: 0
    }
];

// init

const network: Network = new Network();
network.init();

const newSpecies: Species = new Species(network);
newSpecies.networks.push(network);
speciesArray.push(newSpecies);

for (let i = 0; i < NUMBER_OF_NETWORKS - 1; i++) {
    const network: Network = new Network();
    network.init();
    //networks.push(network); // to do usuniecia
    newSpecies.networks.push(network);
}

// main loop
let step: number = 0;
while (bestNetwork.fitness > 0.001) {
    run();

    step++;
    // if (step === 10000) {
    //     break;
    // }
}
// ending
console.log(bestNetwork.toString());
console.log('best network fitness:', bestNetwork.fitness);

for (let XOR of XORArray) {
    console.log(XOR);
    bestNetwork.inputs[0].value = XOR.i1;
    bestNetwork.inputs[1].value = XOR.i2;
    console.log(bestNetwork.evaluate());
}

function run() {
    let sumOfAverageFitnesses: number = 0;

    for (let species of speciesArray) { 
        for (let network of species.networks) {
            for (let XOR of XORArray) {
                network.inputs[0].value = XOR.i1;
                network.inputs[1].value = XOR.i2;
                const val: number = Math.abs(network.evaluate() - XOR.o);
                network.fitness += val;
                species.averageFitness += val;
            }
        }
        species.averageFitness /= species.networks.length;
        //console.log(species.averageFitness);
        //console.log(species.networks.length);
        sumOfAverageFitnesses += species.averageFitness;
    }
    //console.log(sumOfAverageFitnesses);

    // todo srednia fitnessu liczymy przed ubojem czy po?

    const maxNewNetworks: number = NUMBER_OF_NETWORKS - speciesArray.length;
    let sumOfNewNetworks: number = 0;

    for (let species of speciesArray) {
        species.desiredPopulation = Math.floor(species.averageFitness / sumOfAverageFitnesses * maxNewNetworks) + 1; // +1 zeby zawsze byl przynajmniej 1
        sumOfNewNetworks += species.desiredPopulation;
        //console.log('desired populationn', species.desiredPopulation);
    }
    speciesArray[speciesArray.length - 1].desiredPopulation += NUMBER_OF_NETWORKS - sumOfNewNetworks; // ostatnio powstalem species dokladamy pozostajace miejsca

    getCulled();
    
    for (let species of speciesArray) {
        if (species.networks[0].fitness < bestNetwork.fitness) {
            bestNetwork = crossover(species.networks[0], species.networks[0]); // hack do otrzymania kopii network
            bestNetwork.fitness = species.networks[0].fitness;
        }
    }

    console.log(step + ' ' + bestNetwork.fitness);

    console.log(speciesArray.length);
    for (let species of speciesArray) {
        let speciesInitialLength: number = species.networks.length;
        while (speciesInitialLength < species.desiredPopulation) {
            const rnd1 = species.networks[Math.floor(Math.random() * species.networks.length)];
            const rnd2 = species.networks[Math.floor(Math.random() * species.networks.length)];

            const newNetwork = crossover(rnd1, rnd2);
            newNetwork.mutate();

            for (let species of speciesArray) {
                let speciesFound: boolean = false;
                if (species.inSpecies(newNetwork)) {
                    species.networks.push(newNetwork);
                    speciesFound = true;
                    break;
                }

                if (!speciesFound) {
                    const newSpecies: Species = new Species(newNetwork);
                    newSpecies.networks.push(newNetwork);
                    speciesArray.push(newSpecies);
                    break;
                }
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

}

function crossover(n1: Network, n2: Network): Network {
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
    return child;
}

function getCulled() {
    for (let species of speciesArray) {
        species.networks.sort((network1, network2) => {
            return network1.fitness - network2.fitness;
        });

        const numberOfGettingCulled: number = Math.floor(species.networks.length * 0.8);

        species.networks.splice(species.networks.length - numberOfGettingCulled, numberOfGettingCulled);
    }
}