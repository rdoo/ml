import { Neuron } from './neuron';

export class Synapse {
    innovation: number;
    origin: Neuron;
    weight: number = Math.random() * 2 - 1; // TODO: sprawdzic jakie maja byc wagi;
    enabled: boolean = true;

    constructor(innovation: number, origin: Neuron) {
        this.innovation = innovation;
        this.origin = origin;
    }

    clone(neuron: Neuron): Synapse {
        const newSynapse: Synapse = new Synapse(this.innovation, neuron);
        newSynapse.weight = this.weight;
        newSynapse.enabled = this.enabled;

        return newSynapse;
    }
}