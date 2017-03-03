import { Neuron } from './neuron';
import { Synapse } from './synapse';
import { Network } from './network';
import { Species } from './species';

export const INNOVATION: any = { value: 1 };
export const NEURON_ID_GENERATOR: any = { value: 1 };

let change = 'asdsdddasdaaaaassdsaad';

const NUMBER_OF_NETWORKS: number = 200;
const NUMBER_OF_RUNS: number = 1300;

let networks: Network[] = [];

const speciesArray: Species[] = [];

let bestNetwork: any = { fitness: 1000000 };

for (let i = 0; i < NUMBER_OF_NETWORKS; i++) {
    const network: Network = new Network();
    INNOVATION.value = 1;
    NEURON_ID_GENERATOR.value = 1;
    network.init();
    networks.push(network);
    //console.log(network.evaluate());
    //console.log(network.toString());
}
let u = 0;
while (bestNetwork.fitness > 0.0001) {
    if (u === NUMBER_OF_RUNS - 1) {
        run(u, true);
    } else {
        run(u, false);
    }

    u++;
}

console.log(bestNetwork.toString());
console.log('best network fitness:', bestNetwork.fitness);

const possibilitiesArray = [
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

for (let w = 0; w < possibilitiesArray.length; w++) {
    console.log(possibilitiesArray[w]);
    bestNetwork.inputs[0].value = possibilitiesArray[w].i1;
    bestNetwork.inputs[1].value = possibilitiesArray[w].i2;
    console.log(bestNetwork.evaluate());
}

function run(step: number, notMutate: boolean) {

const possibilitiesArray = [
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


    for (let network of networks) {
        for (let uu = 0; uu < possibilitiesArray.length; uu++) {
            const el = possibilitiesArray[uu];
            network.inputs[0].value = el.i1;
            network.inputs[1].value = el.i2;
            const ev = network.evaluate();
            const abs = Math.abs(ev - el.o);
            network.fitness += abs;
        }
    }
    // console.log('po');
    // for (let network of networks) {
    //     console.log(network.fitness);
    // }

    getCulled();
    console.log('culled ' + step + ' ' + bestNetwork.fitness);
    // for (let network of networks) {
    //     console.log(network.fitness);
    // }
    console.log(networks[0].fitness);

    if (networks[0].fitness < bestNetwork.fitness) {
        bestNetwork = crossover(networks[0], networks[0]);
        bestNetwork.fitness = networks[0].fitness;
    }

    if (notMutate) {
        return;
    }

    for (let network of networks) {
        network.fitness = 0;
    }

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

    const numberOfGettingCulled: number = Math.floor(networks.length * 0.95);

    networks.splice(networks.length - numberOfGettingCulled, numberOfGettingCulled);
}