import { Neuron } from './neuron';
import { Synapse } from './synapse';
import { Network } from './network';
import { Species } from './species';

export const INNOVATION_GENERATOR: any = { value: 1 };
export const NEURON_ID_GENERATOR: any = { value: 1 };

let change = 'asdsdddasaadaadada'
const NUMBER_OF_NETWORKS: number = 200;
const NUMBER_OF_RUNS: number = 1300;

const networks: Network[] = [];

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
for (let i = 0; i < NUMBER_OF_NETWORKS; i++) {
    const network: Network = new Network();
    network.init();
    networks.push(network);
    // segregate to species
}

// main loop
let step: number = 0;
while (bestNetwork.fitness > 0.001) {
    run();

    step++;
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
    for (let network of networks) {
        for (let XOR of XORArray) {
            network.inputs[0].value = XOR.i1;
            network.inputs[1].value = XOR.i2;
            network.fitness += Math.abs(network.evaluate() - XOR.o);
        }
    }

    getCulled();
    
    if (networks[0].fitness < bestNetwork.fitness) {
        bestNetwork = crossover(networks[0], networks[0]); // hack do otrzymania kopii network
        bestNetwork.fitness = networks[0].fitness;
    }

    console.log(step + ' ' + bestNetwork.fitness);

    while (networks.length < NUMBER_OF_NETWORKS) {
        const rnd1 = networks[Math.floor(Math.random() * networks.length)];
        const rnd2 = networks[Math.floor(Math.random() * networks.length)];

        networks.push(crossover(rnd1, rnd2));
    }

    for (let network of networks) {
        network.mutate();
    }

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
    networks.sort((network1, network2) => {
        return network1.fitness - network2.fitness;
    });

    const numberOfGettingCulled: number = Math.floor(networks.length * 0.80);

    networks.splice(networks.length - numberOfGettingCulled, numberOfGettingCulled);
}