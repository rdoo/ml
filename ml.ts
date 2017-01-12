import { Neuron } from './neuron';
import { Synapse } from './synapse';
import { Network } from './network';
import { Species } from './species';

export const INNOVATION: any = { value: 1 };
export const NEURON_ID_GENERATOR: any = { value: 1 };

const NUMBER_OF_NETWORKS: number = 50;
const NUMBER_OF_RUNS: number = 10;

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
for (let u = 0; u < NUMBER_OF_RUNS; u++) {
    if (u === NUMBER_OF_RUNS - 1) {
        run(true);
    } else {
        run(false);
    }
}

console.log(bestNetwork.toString());
console.log(bestNetwork.fitness);

for (let w = 0; w < 10; w++) {
    const ele = getElement();
    console.log(ele);
    networks[0].inputs[0].value = ele.i1;
    networks[0].inputs[1].value = ele.i2;
    console.log(bestNetwork.evaluate());
}

function getElement() {
    const array = [
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

    return array[Math.floor(Math.random() * array.length)];
}

function run(notMutate: boolean) {
    for (let i = 0; i < 1e4; i++) {
        //console.log(i);
        for (let network of networks) {
            const el = getElement();
            network.inputs[0].value = el.i1;
            network.inputs[1].value = el.i2;
            const ev = network.evaluate();
            const abs = Math.abs(ev - el.o);
            network.fitness += abs;
        }
    }
    console.log('po');
    for (let network of networks) {
        console.log(network.fitness);
    }

    getCulled();
    console.log('culled');
    for (let network of networks) {
        console.log(network.fitness);
    }

    if (networks[0].fitness < bestNetwork.fitness) {
        bestNetwork = networks[0];
    }

    if (notMutate) {
        return;
    }

    for (let network of networks) {
        network.fitness = 0;
    }

    const lengthh: number = networks.length;
    for (let i = 0; i < lengthh; i++) {
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

    const numberOfGettingCulled: number = Math.floor(networks.length / 2.);

    networks.splice(numberOfGettingCulled, numberOfGettingCulled);
}