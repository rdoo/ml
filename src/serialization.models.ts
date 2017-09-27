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