import { Synapse } from './synapse';
import { Neuron } from './neuron';

export class Network {
    //neurons: Neuron[] = [];
    inputs: Neuron[] = [];
    hidden: Neuron[] = [];
    output: Neuron;
    //synapses: Synapse[] = []; // TODO uzupelnic tablice lub wymyslic inny sposob
    fitness: number = 0;

    constructor() {

    }

    init() {
        const input: Neuron = new Neuron();
        input.value = 5;

        const s1: Synapse = new Synapse(input);
        const s2: Synapse = new Synapse(input);

        // this.synapses.push(s1);
        // this.synapses.push(s2);

        const n1: Neuron = new Neuron([s1]);
        const n2: Neuron = new Neuron([s2]);

        this.inputs.push(input);
        this.hidden.push(n1);
        this.hidden.push(n2);

        const s3: Synapse = new Synapse(n1);
        const s4: Synapse = new Synapse(n2)

        // this.synapses.push(s3);
        // this.synapses.push(s4);

        this.output = new Neuron([s3, s4]);
    }

    evaluate(): number {
        return this.output.getValue();
    }

    countDisjoint(otherNetwork: Network): number {
        return 0;
    }

    mutate() {
        for (let neuron of this.hidden) {
            for (let synapse of neuron.synapses) {
                const rnd = Math.random();

                if (Math.abs(rnd) < 0.2) {
                    synapse.weight + rnd;
                }
            }
        }

        for (let synapse of this.output.synapses) {
            const rnd = Math.random();

            if (Math.abs(rnd) < 0.2) {
                synapse.weight + rnd;
            }
        }

    }

    sameSpecies(otherNetwork: Network): boolean {
        return false;
    }

    toString() {
        console.log('inputs');
        for (let neuron of this.inputs) {
            console.log('value:', neuron.value);
            for (let synapse of neuron.synapses) {
                console.log('\tweight:', synapse.weight);
            }
        }

        console.log('hidden');
        for (let neuron of this.hidden) {
            console.log('value:', neuron.value);
            for (let synapse of neuron.synapses) {
                console.log('\tweight:', synapse.weight);
            }
        }

        console.log('ouput');
        console.log('value:', this.output.value);
        for (let synapse of this.output.synapses) {
            console.log('\tweight:', synapse.weight);
        }
    }
}