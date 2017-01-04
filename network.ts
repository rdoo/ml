import { Synapse } from './synapse';
import { Neuron } from './neuron';

export class Network {
    neurons: Neuron[] = [];
    synapses: Synapse[] = []; // TODO uzupelnic tablice lub wymyslic inny sposob
    fitness: number = 0;

    constructor() {
        const input: Neuron = new Neuron();
        input.value = 5;

        const n1: Neuron = new Neuron([new Synapse(input)]);
        const n2: Neuron = new Neuron([new Synapse(input)]);

        this.neurons.push(input);
        this.neurons.push(n1);
        this.neurons.push(n2);
        this.neurons.push(new Neuron([new Synapse(n1), new Synapse(n2)]));
    }

    evaluate(): number {
        for (let neuron of this.neurons) {
            neuron.calc();
        }

        return this.neurons[this.neurons.length - 1].value;
    }

    countDisjoint(otherNetwork: Network): number {
        return 0;
    }

    mutate() {

    }

    sameSpecies(otherNetwork: Network): boolean {
        return false;
    }
}