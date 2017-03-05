import { Synapse } from './synapse';
import { Neuron } from './neuron';

import { INNOVATION_GENERATOR, NEURON_ID_GENERATOR } from './ml';

export class Network {
    //neurons: Neuron[] = [];
    inputs: Neuron[] = [];
    hidden: Neuron[] = [];
    output: Neuron;
    //synapses: Synapse[] = []; // TODO uzupelnic tablice lub wymyslic inny sposob
    fitness: number = 0;

    constructor() { }

    init() {
        INNOVATION_GENERATOR.value = 0;
        NEURON_ID_GENERATOR.value = 0;

        const input1: Neuron = new Neuron(NEURON_ID_GENERATOR.value++);
        input1.value = 5;

        const input2: Neuron = new Neuron(NEURON_ID_GENERATOR.value++);
        input2.value = 5;

        const bias: Neuron = new Neuron(NEURON_ID_GENERATOR.value++);
        bias.value = 1;

        const s1: Synapse = new Synapse(INNOVATION_GENERATOR.value++, input1);
        const s2: Synapse = new Synapse(INNOVATION_GENERATOR.value++, input1);
        const s3: Synapse = new Synapse(INNOVATION_GENERATOR.value++, input2);
        const s4: Synapse = new Synapse(INNOVATION_GENERATOR.value++, input2);

        // this.synapses.push(s1);
        // this.synapses.push(s2);

        const b1: Synapse = new Synapse(INNOVATION_GENERATOR.value++, bias);
        const b2: Synapse = new Synapse(INNOVATION_GENERATOR.value++, bias);

        const n1: Neuron = new Neuron(NEURON_ID_GENERATOR.value++, [s1, s3, b1]);
        //const n2: Neuron = new Neuron([s2]);

        this.inputs.push(input1);
        this.inputs.push(input2);
        this.inputs.push(bias);

        this.hidden.push(n1);

        const s5: Synapse = new Synapse(INNOVATION_GENERATOR.value++, n1);

        // this.synapses.push(s3);
        // this.synapses.push(s4);

        this.output = new Neuron(NEURON_ID_GENERATOR.value++, [s2, s4, s5, b2]);
    }

    evaluate(): number {
        return this.output.getValue();
    }

    countDisjoint(otherNetwork: Network): number {
        return 0;
    }

    mutate() {
        // mutacja wag
        for (let neuron of this.hidden) {
            for (let synapse of neuron.synapses) {
                const rnd = Math.random();

                if (rnd < 0.05) {
                    synapse.weight = Math.random() * 20 - 10;
                }
            }
        }

        for (let synapse of this.output.synapses) {
            const rnd = Math.random();

            if (rnd < 0.05) {
                synapse.weight = Math.random() * 20 - 10;
            }
        }

        // mutacja dodatkowych synaps
        const rnd = Math.random();
        if (rnd < 0.05) {
            let mutationDone: boolean = false;
            do {
                const index1 = Math.floor(Math.random() * this.hidden.length + 1);
                const index2 = Math.floor(Math.random() * this.hidden.length + 1);
                // to do obliczenia czy wybrane neurony nie maja juz takiej synapsy a jesli maja i jest didable to enable
                mutationDone = true;
            } while (!mutationDone);
        }

        // to do mutacja dodatkowego neuronu

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

    // copy() {
    //     const copyNetwork: Network = new Network();

    //     for (let neuron of this.inputs) { // moze kopiowac od tego bardziej fit?
    //         copyNetwork.inputs.push(neuron.clone());
    //     }

    //     for (let neuron of this.hidden) {
    //         copyNetwork.hidden.push(neuron.clone());
    //     }

    //     copyNetwork.output = this.output.clone();
    // }
}