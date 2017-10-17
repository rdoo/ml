import { Config } from './config';
import { Globals } from './globals';
import { Network } from './network';
import { Neuron } from './neuron';
import { Synapse } from './synapse';

export interface NeuronSerialized {
    id: number;
    value: number; // todo potrzebne tylko dla inputow czy dla wszystkich ze wzgledu na polaczenia wsteczne?
}

export interface SynapseSerialized {
    innovation: number;
    weight: number;
    originId: number;
    targetId: number;
    enabled: boolean;
}

export interface NetworkSerialized {
    inputs: NeuronSerialized[];
    hidden: NeuronSerialized[];
    output: NeuronSerialized;
    synapses: SynapseSerialized[];
    fitness: number;
}

export interface SpeciesSerialized {
    representant: NetworkSerialized;
    networks: NetworkSerialized[];
    averageFitness: number;
    desiredPopulation: number; // todo needed?
}

export interface StateSerialized {
    step: number;
    bestNetwork: NetworkSerialized;
    speciesArray: SpeciesSerialized[];
    globals: Globals
    config: Config
}

export function deserializeNetwork(networkSerialized: NetworkSerialized): Network {
    const inputs: Neuron[] = [];
    
    for (const neuronSerialized of networkSerialized.inputs) {
        const neuron: Neuron = Object.create(Neuron.prototype);
        neuron.calculating = false;
        neuron.synapses = [];
        neuron.id = neuronSerialized.id;
        neuron.value = neuronSerialized.value;

        inputs.push(neuron);
    }

    const hidden: Neuron[] = [];

    for (const neuronSerialized of networkSerialized.hidden) {
        const neuron: Neuron = Object.create(Neuron.prototype);
        neuron.calculating = false;
        neuron.synapses = [];
        neuron.id = neuronSerialized.id;
        neuron.value = neuronSerialized.value;

        hidden.push(neuron);
    }

    const output: Neuron = Object.create(Neuron.prototype);
    output.calculating = false;
    output.synapses = [];
    output.id = networkSerialized.output.id;
    output.value = networkSerialized.output.value;

    for (const synapseSerialized of networkSerialized.synapses) {
        const origin: Neuron = findNeuronWithId(synapseSerialized.originId, inputs, hidden, output);
        const target: Neuron = findNeuronWithId(synapseSerialized.targetId, inputs, hidden, output);
        const synapse: Synapse = Object.create(Synapse.prototype);
        synapse.innovation = synapseSerialized.innovation;
        synapse.weight = synapseSerialized.weight;
        synapse.enabled = synapseSerialized.enabled;
        synapse.origin = origin;

        target.synapses.push(synapse);
    }

    const network: Network = Object.create(Network.prototype);
    network.fitness = networkSerialized.fitness;
    network.inputs = inputs;
    network.hidden = hidden;
    network.output = output;

    return network;
}

function findNeuronWithId(id: number, inputs: Neuron[], hidden: Neuron[], output: Neuron): Neuron {
    for (const neuron of inputs) {
        if (neuron.id === id) {
            return neuron;
        }
    }

    for (const neuron of hidden) {
        if (neuron.id === id) {
            return neuron;
        }
    }

    if (output.id === id) {
        return output;
    }

    throw('NEURON NOT FOUND');
}