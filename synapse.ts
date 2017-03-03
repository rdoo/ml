import { Neuron } from './neuron';
import { INNOVATION_GENERATOR } from './ml';

export class Synapse {
    innovation: number;
    origin: Neuron;
    weight: number = Math.random() * 4 - 2; // TODO: sprawdzic jakie maja byc wagi;
    enabled: boolean = false;

    constructor(innovation: number, origin: Neuron) {
        this.innovation = innovation;
        this.origin = origin;
    }

    clone(neuron: Neuron): Synapse {
        const newSynapse: Synapse = new Synapse(this.innovation, neuron);
        newSynapse.weight = this.weight;

        return newSynapse;
    }
}