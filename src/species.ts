import { Network } from './network';

export class Species {
    representant: Network;
    networks: Network[] = [];
    averageFitness: number = 0;
    desiredPopulation: number = 0;

    constructor(representant: Network) {
        this.representant = representant;
    }

    inSpecies(network: Network) {
        const threshold: number = 1.5;
        const c1: number = 1.5;
        const c2: number = 1.5;
        const c3: number = 0.000000000002;

        let E: number = 0; // number of excess genes
        let D: number = 0; // number of disjoint genes
        let W: number = 0; // average weight differences of matching genes
        let N: number = 0; // number of genes in larger genome

        // looking for highest innovation number in representant:
        let highestInnovation1: number = 0;
        let numberOfSynapses1: number = 0;

        for (let neuron1 of this.representant.hidden) {
            for (let synapse1 of neuron1.synapses) {
                if (synapse1.innovation > highestInnovation1) {
                    highestInnovation1 = synapse1.innovation;
                    numberOfSynapses1++;
                }
            }
        }

        for (let synapse1 of this.representant.output.synapses) {
            if (synapse1.innovation > highestInnovation1) {
                highestInnovation1 = synapse1.innovation;
                numberOfSynapses1++;
            }
        }

        // looking for highest innovation number in other network:
        let highestInnovation2: number = 0;
        let numberOfSynapses2: number = 0;

        for (let neuron2 of network.hidden) {
            for (let synapse2 of neuron2.synapses) {
                if (synapse2.innovation > highestInnovation2) {
                    highestInnovation2 = synapse2.innovation;
                    numberOfSynapses2++;
                }
            }
        }

        for (let synapse2 of network.output.synapses) {
            if (synapse2.innovation > highestInnovation2) {
                highestInnovation2 = synapse2.innovation;
                numberOfSynapses2++;
            }
        }

        // mniejsza z najwiekszych innovation (geny excess to te ktore so poza zasiegiem jednej z sieci czyli wieksze niz ta liczba)
        const lowestHighestInnovation = Math.min(highestInnovation1, highestInnovation2);

        N = Math.max(numberOfSynapses1, numberOfSynapses2);

        let matchingSynapses: number = 0;

        for (let neuron1 of this.representant.hidden) {
            for (let synapse1 of neuron1.synapses) {
                let matchingSynapseFound: boolean = false;
                for (let neuron2 of network.hidden) {
                    for (let synapse2 of neuron2.synapses) {
                        if (synapse1.innovation === synapse2.innovation) {
                            matchingSynapseFound = true;
                            matchingSynapses++;
                            W += Math.abs(synapse1.weight - synapse2.weight);
                            // TODO break
                        }
                    }
                }

                if (!matchingSynapseFound) {
                    if (synapse1.innovation > lowestHighestInnovation) {
                        E++;
                    } else {
                        D++;
                    }
                }
            }
        }

        for (let synapse1 of this.representant.output.synapses) {
            let matchingSynapseFound: boolean = false;
            for (let synapse2 of network.output.synapses) {
                if (synapse1.innovation === synapse2.innovation) {
                    matchingSynapseFound = true;
                    matchingSynapses++;
                    W += Math.abs(synapse1.weight - synapse2.weight);
                    break;
                }
            }

            if (!matchingSynapseFound) {
                if (synapse1.innovation > lowestHighestInnovation) {
                    E++;
                } else {
                    D++;
                }
            }
        }

        // teraz to samo ale w druga strone

        for (let neuron2 of network.hidden) {
            for (let synapse2 of neuron2.synapses) {
                let matchingSynapseFound: boolean = false;
                for (let neuron1 of this.representant.hidden) {
                    for (let synapse1 of neuron1.synapses) {
                        if (synapse1.innovation === synapse2.innovation) {
                            matchingSynapseFound = true;
                            // TODO break
                        }
                    }
                }

                if (!matchingSynapseFound) {
                    if (synapse2.innovation > lowestHighestInnovation) {
                        E++;
                    } else {
                        D++;
                    }
                }
            }
        }

        for (let synapse2 of network.output.synapses) {
            let matchingSynapseFound: boolean = false;
            for (let synapse1 of this.representant.output.synapses) {
                if (synapse1.innovation === synapse2.innovation) {
                    matchingSynapseFound = true;
                    break;
                }
            }

            if (!matchingSynapseFound) {
                if (synapse2.innovation > lowestHighestInnovation) {
                    E++;
                } else {
                    D++;
                }
            }
        }

        // ostateczne obliczenia
        W = 1.0 * W / matchingSynapses; // not sure of int in javascript

        const difference: number = (c1 * E + c2 * D) / N + c3 * W;

        if (difference < threshold) {
            return true;
        } else {
            return false;
        }
    }
}