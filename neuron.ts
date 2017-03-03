import { Synapse } from './synapse';
import { NEURON_ID_GENERATOR } from './ml';

export class Neuron {
    id: number;
    synapses: Synapse[];
    threshold: number;
    value: number = 0;

    constructor(synapses: Synapse[] = [], threshold: number = -1000000) { // TODO zmienic threshold
        this.id = NEURON_ID_GENERATOR.value++;
        this.synapses = synapses;
        this.threshold = threshold;
    }

    clone(): Neuron {
        const newNeuron: Neuron = new Neuron(); // wylaczyc zwiekszanie id
        newNeuron.threshold = this.threshold; // konieczne?
        newNeuron.value = this.value; // konieczne?
        newNeuron.id = this.id;

        return newNeuron;
    }

    getValue() {
        if (this.synapses.length === 0) {
            return this.value;
        }

        this.value = 0;

        for (let synapse of this.synapses) {
            this.value += synapse.origin.getValue() * synapse.weight;
        }

        // if (this.value < this.threshold) {
        //     this.value = 0;
        // }

        //return 2.0 / (1.0 + Math.exp(-4.9 * this.value)) - 1.0;
        return 1.0 / (1.0 + Math.exp(-4.9 * this.value));
    }
}