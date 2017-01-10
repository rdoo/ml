import { Synapse } from './synapse';
import { NEURON_ID_GENERATOR } from './ml';

export class Neuron {
    id: number;
    synapses: Synapse[];
    threshold: number;
    value: number = 0;

    constructor(synapses: Synapse[] = [], threshold: number = -10000) { // TODO zmienic threshold
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

        for (let synapse of this.synapses) {
            this.value += synapse.origin.getValue() * synapse.weight;
        }

        if (this.value < this.threshold) {
            this.value = 0;
        }

        return this.value;
    }
}