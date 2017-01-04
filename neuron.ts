import { Synapse } from './synapse';

export class Neuron {
    synapses: Synapse[];
    threshold: number;
    value: number = 0;

    constructor(synapses: Synapse[] = [], threshold: number = -10000) { // TODO zmienic threshold
        this.synapses = synapses;
        this.threshold = threshold;
    }

    calc() {
        if (this.synapses.length === 0) {
            return;
        }

        for (let synapse of this.synapses) {
            this.value += synapse.origin.value * synapse.weight;
        }

        if (this.value < this.threshold) {
            this.value = 0;
        }
    }
}