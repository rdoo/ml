import { Synapse } from './synapse';
import { Neuron } from './neuron';

export class Globals {
    currentNeuronId: number = 0;
    currentSynapseId: number = 0;
    synapseMutations: SynapseMutation[] = [];
    neuronMutations: NeuronMutation[] = [];
}

export interface SynapseMutation {
    synapseId: number; // id stworzonej synapsy
    originId: number; // id neuronu od jakiego synapsa sie zaczyna
    targetId: number // id neuronu do jakiego synapsa dochodzi
}

export interface NeuronMutation {
    neuronId: number; // id stworzonego neuronu
    synapseId: number; // id synapsy na jakim byl tworzony neuron
    newSynapse1Id: number; // id nowo tworzonej synapsy 1
    newSynapse2Id: number; // id nowo tworzonej synapsy 2
}

export interface SynapseWithTarget {
    synapse: Synapse;
    target: Neuron;
}