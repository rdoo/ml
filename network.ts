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
        const input1: Neuron = new Neuron();
        input1.value = 5;

        const input2: Neuron = new Neuron();
        input2.value = 5;

        const bias: Neuron = new Neuron();
        bias.value = 1;

        const s1: Synapse = new Synapse(input1);
        const s2: Synapse = new Synapse(input1);
        const s3: Synapse = new Synapse(input2);
        const s4: Synapse = new Synapse(input2);

        // this.synapses.push(s1);
        // this.synapses.push(s2);

        const b1: Synapse = new Synapse(bias);
        const b2: Synapse = new Synapse(bias);

        const n1: Neuron = new Neuron([s1, s3, b1]);
        //const n2: Neuron = new Neuron([s2]);

        this.inputs.push(input1);
        this.inputs.push(input2);
        this.inputs.push(bias);

        this.hidden.push(n1);

        const s5: Synapse = new Synapse(n1);

        // this.synapses.push(s3);
        // this.synapses.push(s4);

        this.output = new Neuron([s2, s4, s5, b2]);
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

                if (Math.abs(rnd) < 0.1) {
                    synapse.weight = Math.random() * 36 - 18;
                }
            }
        }

        for (let synapse of this.output.synapses) {
            const rnd = Math.random();

            if (Math.abs(rnd) < 0.1) {
                synapse.weight = Math.random() * 36 - 18;
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