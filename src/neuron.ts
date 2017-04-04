import { Synapse } from './synapse';

export class Neuron {
    id: number;
    synapses: Synapse[];
    value: number = 0;
    calculating: boolean = false;

    constructor(id: number, synapses: Synapse[] = []) { // TODO zmienic threshold
        this.id = id;
        this.synapses = synapses;
    }

    clone(): Neuron {
        const newNeuron: Neuron = new Neuron(this.id); // wylaczyc zwiekszanie id
        newNeuron.value = this.value; // konieczne?

        return newNeuron;
    }

    getValue(): number {
        if (this.synapses.length === 0) {
            return this.value; // TODO przemyslec
        }

        if (this.calculating === true) {
            return 1.0 / (1.0 + Math.exp(-4.9 * this.value)); // TODO przemyslec
        }

        this.calculating = true;

        let tempValue: number = 0;

        for (let synapse of this.synapses) {
            if (synapse.enabled) {
                tempValue += synapse.origin.getValue() * synapse.weight;
            }
        }

        this.value = tempValue;

        //return 2.0 / (1.0 + Math.exp(-4.9 * this.value)) - 1.0;
        return 1.0 / (1.0 + Math.exp(-4.9 * this.value));
    }
}