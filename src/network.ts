import { Synapse } from './synapse';
import { Neuron } from './neuron';

import { INNOVATION_GENERATOR, NEURON_ID_GENERATOR } from './ml';

const synapseMutations: any[] = [];
const neuronMutations: any[] = [];

export class Network {
    inputs: Neuron[] = [];
    hidden: Neuron[] = [];
    output: Neuron;

    fitness: number = 0;

    init() {
        INNOVATION_GENERATOR.value = 0;
        NEURON_ID_GENERATOR.value = 0;

        const input1: Neuron = new Neuron(NEURON_ID_GENERATOR.value++);
        const input2: Neuron = new Neuron(NEURON_ID_GENERATOR.value++);
        const bias: Neuron = new Neuron(NEURON_ID_GENERATOR.value++);
        bias.value = 1;

        this.inputs.push(input1);
        this.inputs.push(input2);
        this.inputs.push(bias);

        const synapse: Synapse = new Synapse(INNOVATION_GENERATOR.value++, input1);
        this.output = new Neuron(NEURON_ID_GENERATOR.value++, [synapse]);
    }

    evaluate(): number {
        const value: number = this.output.getValue();

        this.output.calculating = false;

        for (let neuron of this.hidden) {
            neuron.calculating = false;
        }

        return value;
    }

    // TODO uniform pertrub if rnd < 0.9 then synapse.weight +- random.uniform(-3, 3)
    mutate() {
        // mutacja wag
        for (let neuron of this.hidden) {
            for (let synapse of neuron.synapses) {
                const rnd = Math.random();

                if (rnd < 0.05) {
                    synapse.weight = Math.random() * 20 - 10;
                }
            }
        }

        for (let synapse of this.output.synapses) {
            const rnd = Math.random();

            if (rnd < 0.05) {
                synapse.weight = Math.random() * 20 - 10;
            }
        }

        // mutacja dodatkowych synaps
        let rnd = Math.random();
        if (rnd < 0.05) {
            let mutationDone: boolean = false;
            
            const index1 = Math.floor(Math.random() * (this.hidden.length + 1 + 2 + 1)); // origin +1 output +2 input +1 bias// TODO refactor
            const index2 = Math.floor(Math.random() * (this.hidden.length + 1)); // do synapses; +1 output

            let neuron1: Neuron;
            let neuron2: Neuron;

            if (index1 === this.hidden.length + 3) {
                neuron1 = this.output;
            } else if (index1 < 3) {
                neuron1 = this.inputs[index1];
            } else {
                neuron1 = this.hidden[index1 - 3];
            }

            if (index2 === this.hidden.length) {
                neuron2 = this.output;
            } else {
                neuron2 = this.hidden[index2];
            }

            // szuka czy juz nie istnieje to polaczenie i wtedy je enabluje lub disabluje
            for (let synapse of neuron2.synapses) {
                if (synapse.origin.id === neuron1.id) {
                    if (synapse.enabled) {
                        synapse.enabled = false;
                    } else {
                        synapse.enabled = true;
                    }
                    mutationDone = true;
                    break;
                }
            }

            // szuka czy tego typu mutacja nie byla juz wykonana wczesniej i ja duplikuje
            if (!mutationDone) {
                for (const muta of synapseMutations) {
                    if (muta.origin === neuron1.id && muta.target === neuron2.id) {
                        const newSynapse = new Synapse(muta.innovation, neuron1);
                        neuron2.synapses.push(newSynapse);
                        mutationDone = true;
                        break;
                    }
                }
            }

            // tworzy calkowicie nowa mutacje
            if (!mutationDone) {
                const newSynapse = new Synapse(INNOVATION_GENERATOR.value++, neuron1);
                neuron2.synapses.push(newSynapse);
                synapseMutations.push({ origin: newSynapse.origin.id, target: neuron2.id, innovation: newSynapse.innovation });
            }      
        }

        // to do mutacja dodatkowego neuronu
        rnd = Math.random();
        if (rnd < 0.001) {
            const synapses: any[] = [];
            // TODO co jesli synapse jest disabled???
            for (let neuron of this.hidden) {
                for (let synapse of neuron.synapses) {
                    synapses.push({ synapse: synapse, target: neuron });
                }
            }

            for (let synapse of this.output.synapses) {
                synapses.push({ synapse: synapse, target: this.output });
            }

            const chosenSynapse = synapses[Math.floor(Math.random() * synapses.length)];
            chosenSynapse.synapse.enabled = false;

            for (const muta of neuronMutations) {
                if (muta.synapseId === chosenSynapse.synapse.innovation) {
                    const newSynapse1: Synapse = new Synapse(muta.newSynapse1Id, chosenSynapse.synapse.origin);
                    const newNeuron: Neuron = new Neuron(muta.neuronId, [newSynapse1]);
                    this.hidden.push(newNeuron);

                    const newSynapse2: Synapse = new Synapse(muta.newSynapse2Id, newNeuron);

                    chosenSynapse.target.synapses.push(newSynapse2);

                    return;
                }
            }

            const newSynapse1: Synapse = new Synapse(INNOVATION_GENERATOR.value++, chosenSynapse.synapse.origin);
            const newNeuron: Neuron = new Neuron(NEURON_ID_GENERATOR.value++, [newSynapse1]);
            this.hidden.push(newNeuron);

            const newSynapse2: Synapse = new Synapse(INNOVATION_GENERATOR.value++, newNeuron);

            chosenSynapse.target.synapses.push(newSynapse2);

            neuronMutations.push({ neuronId: newNeuron.id, synapseId: chosenSynapse.synapse.innovation, newSynapse1Id: newSynapse1.innovation, newSynapse2Id: newSynapse2.innovation });
        }

    }

    isSynapseInHiddenWithId(id: number) {
        for (const neuron of this.hidden) {
            for (const synapse of neuron.synapses) {
                if (synapse.innovation === id) {
                    return { result: true, weight: synapse.weight };
                }
            }
        }

        return { result: false, weight: 0 };
    }

    findNeuronWithId(id: number) {
        if (this.output.id === id) {
            return this.output;
        }

        for (const neuron of this.inputs) {
            if (neuron.id === id) {
                return neuron;
            }
        }

        for (const neuron of this.hidden) {
            if (neuron.id === id) {
                return neuron;
            }
        }

        throw('Neuron not found!');
    }

    deepCopy(): Network {
        const networkCopy: Network = new Network();

        for (let neuron of this.inputs) {
            networkCopy.inputs.push(neuron.clone());
        }

        for (let neuron of this.hidden) {
            networkCopy.hidden.push(neuron.clone());
        }

        networkCopy.output = this.output.clone();

        for (let neuron of this.hidden) {
            for (const synapse of neuron.synapses) {
                const newOrigin = networkCopy.findNeuronWithId(synapse.origin.id);
                const newHost = networkCopy.findNeuronWithId(neuron.id);
                const newSynapse = synapse.clone(newOrigin);
                newHost.synapses.push(newSynapse);
            }
        }

        for (const synapse of this.output.synapses) {
            const newOrigin = networkCopy.findNeuronWithId(synapse.origin.id);
            const newSynapse = synapse.clone(newOrigin);
            networkCopy.output.synapses.push(newSynapse);
        }

        networkCopy.fitness = this.fitness;

        return networkCopy;
    }

    toString() {
        console.log('inputs:');
        for (let neuron of this.inputs) {
            console.log('value:', neuron.value);
            for (let synapse of neuron.synapses) {
                console.log('\tweight:', synapse.weight);
            }
        }

        console.log('hidden:');
        for (let neuron of this.hidden) {
            console.log('value:', neuron.value);
            for (let synapse of neuron.synapses) {
                console.log('\tweight:', synapse.weight);
            }
        }

        console.log('ouput:');
        console.log('value:', this.output.value);
        for (let synapse of this.output.synapses) {
            console.log('\tweight:', synapse.weight);
        }
    }
}