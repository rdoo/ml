import { Neuron } from './neuron';
import { INNOVATION } from './ml';

export class Synapse {
    origin: Neuron;
    weight: number;
    enabled: boolean = false;
    innovation: number;

    constructor(origin: Neuron) {
        this.origin = origin;
        this.weight = Math.random() * 4 - 2; // TODO: sprawdzic jakie maja byc wagi
        this.innovation = INNOVATION.value++;
    }
}