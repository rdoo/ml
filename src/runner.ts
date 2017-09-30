import { SpeciesSerialized } from './serialization.models';
import { CONFIG } from './ml';
import { Network } from './network';
import { Species } from './species';

// declare function postMessage(value?: any): any;

export class Runner {
    speciesArray: Species[] = [];
    bestNetwork: Network;

    inputData: { [key: string]: number }[];

    currentStep: number = 0;

    constructor() {
        const representantNetwork: Network = new Network();
        representantNetwork.initBasicNetwork();

        this.bestNetwork = representantNetwork;
        this.bestNetwork.fitness = 0;

        const newSpecies: Species = new Species(representantNetwork);
        newSpecies.networks.push(representantNetwork);
        this.speciesArray.push(newSpecies);

        for (let i = 0; i < CONFIG.networksNumber - 1; i++) {
            const network: Network = new Network();
            network.initBasicNetwork();
            newSpecies.networks.push(network);
        }

        // postMessage([this.currentStep, this.bestNetwork, this.speciesArray]);
        this.printResults();
    }

    printResults() {
        // postMessage([this.currentStep, this.bestNetwork, this.speciesArray]);
        const speciesArray: SpeciesSerialized[] = [];
        for (const species of this.speciesArray) {
            speciesArray.push(species.serialize());
        }
        process.send(JSON.stringify({ step: this.currentStep, bestNetwork: this.bestNetwork.serialize(), speciesArray: speciesArray }));
    }

    run() {
        let sumOfAverageFitnesses: number = 0;

        for (let species of this.speciesArray) {
            species.averageFitness = 0; // TODO sprawdzic czy to nie jest gdzies indziej zerowane
            for (let network of species.networks) {
                network.fitness = 500; // TODO sprawdzic czy to nie jest gdzies indziej zerowane
                let priceBought: number = 0;
                for (const data of this.inputData) {
                    /*
                    network.inputs[0].value = data.i1;
                    network.inputs[1].value = data.i2;
                    const errorValue: number = Math.abs(network.evaluate() - data.o);
                    network.fitness += errorValue;
                    species.averageFitness += errorValue;
                    */
                    network.inputs[0].value = data.price;
                    network.inputs[1].value = data.volume;
                    const evaluate: number = network.evaluate();

                    if (evaluate > 0.75 && priceBought === 0) {
                        priceBought = data.price;
                    } else if (evaluate < 0.25 && priceBought !== 0) {
                        const balance: number = ((data.price - priceBought) / priceBought) * 100; // dzwignia 100
                        network.fitness += balance;
                        priceBought = 0;
                    }
                }
                species.averageFitness += network.fitness;
            }
            species.averageFitness = species.averageFitness / species.networks.length;
            sumOfAverageFitnesses += species.averageFitness;
        }

        /*
        // TODO srednia fitnessu liczymy przed ubojem czy po?

        let sumaCzastek: number = 0; // do przemyslenia i to powaznie

        for (let species of this.speciesArray) {
            species.desiredPopulation = sumOfAverageFitnesses / species.averageFitness;
            sumaCzastek += species.desiredPopulation;
        }

        const maxNewNetworks: number = CONFIG.networksNumber - this.speciesArray.length;
        let sumOfNewNetworks: number = 0;

        for (let species of this.speciesArray) {
            species.desiredPopulation = Math.floor(species.desiredPopulation / sumaCzastek * maxNewNetworks) + 1; // +1 zeby zawsze byl przynajmniej 1 // 1 - zeby im wieksza fitness tym mniejsza pop
            sumOfNewNetworks += species.desiredPopulation;
        }

        this.speciesArray[this.speciesArray.length - 1].desiredPopulation += CONFIG.networksNumber - sumOfNewNetworks; // ostatnio powstalemu species dokladamy pozostajace miejsca

        */

        for (let species of this.speciesArray) {
            species.desiredPopulation = Math.floor((species.averageFitness / sumOfAverageFitnesses) * CONFIG.networksNumber);
        }

        if (this.currentStep % 100 === 0) {
            // postMessage([this.currentStep, this.bestNetwork, this.speciesArray]);
            this.printResults();
            console.log(this.currentStep);
        }

        this.culling();
        
        for (let species of this.speciesArray) {
            if (species.networks[0].fitness > this.bestNetwork.fitness) {
                this.bestNetwork = species.networks[0].deepCopy();
            }
        }

        // TODO wszystkie networks trzeba przeorganizowac w nowe species????
        for (let species of this.speciesArray) {
            let speciesInitialLength: number = species.networks.length;
            while (speciesInitialLength < species.desiredPopulation) {
                const rnd1 = species.networks[Math.floor(Math.random() * species.networks.length)];
                const rnd2 = species.networks[Math.floor(Math.random() * species.networks.length)];

                const newNetwork = this.crossover(rnd1, rnd2);
                // TODO przemyslec czy mutacja ma zachodzic w tym miejscu
                // TODO przemyslec czy mutowac maja tylko sieci z crossoveru
                newNetwork.mutate();

                let speciesFound: boolean = false;
                for (let species of this.speciesArray) {
                    if (species.inSpecies(newNetwork)) {
                        species.networks.push(newNetwork);
                        speciesFound = true;
                        break;
                    }
                }

                if (!speciesFound) {
                    const newSpecies: Species = new Species(newNetwork);
                    newSpecies.networks.push(newNetwork);
                    this.speciesArray.push(newSpecies);
                }

                speciesInitialLength++;
            }
        }

        this.currentStep++;
    }

    culling() {
        for (let species of this.speciesArray) {
            species.networks.sort((network1, network2) => {
                return network2.fitness - network1.fitness;
            });

            const numberOfGettingCulled: number = Math.floor(species.networks.length * CONFIG.cullingPercent);

            species.networks.splice(species.networks.length - numberOfGettingCulled, numberOfGettingCulled);
        }
    }

    crossover(n1: Network, n2: Network): Network {
        let moreFit: Network;
        let lessFit: Network;

        if (n1.fitness >= n2.fitness) {
            moreFit = n1;
            lessFit = n2;
        } else {
            moreFit = n2;
            lessFit = n1;
        }

        const child: Network = new Network();

        for (let neuron of moreFit.inputs) {
            child.inputs.push(neuron.clone());
        }

        for (let neuron of moreFit.hidden) {
            child.hidden.push(neuron.clone());
        }

        child.output = moreFit.output.clone();

        for (let neuron of moreFit.hidden) {
            for (let synapse of neuron.synapses) {
                const synapseBeingResult = lessFit.isSynapseInHiddenWithId(synapse.innovation);
                if (synapseBeingResult.result) {
                    const newOrigin = child.findNeuronWithId(synapse.origin.id);
                    const newHost = child.findNeuronWithId(neuron.id);
                    const newSynapse = synapse.clone(newOrigin);

                    const rnd: number = Math.random();

                    // waga jest randomowa pomiedzy synapse w moreFit i lessFit
                    if (rnd < 0.5) {
                        newSynapse.weight = synapseBeingResult.weight;
                    }

                    newHost.synapses.push(newSynapse);
                } else {
                    const newOrigin = child.findNeuronWithId(synapse.origin.id);
                    const newHost = child.findNeuronWithId(neuron.id);
                    const newSynapse = synapse.clone(newOrigin);
                    newHost.synapses.push(newSynapse);
                }

            }
        }

        for (let synapse of moreFit.output.synapses) {
            const synapseBeingResult = lessFit.isSynapseInOutputWithId(synapse.innovation);
            if (synapseBeingResult.result) {
                const newOrigin = child.findNeuronWithId(synapse.origin.id);
                const newSynapse = synapse.clone(newOrigin);

                const rnd: number = Math.random();

                // waga jest randomowa pomiedzy synapse w moreFit i lessFit
                if (rnd < 0.5) {
                    newSynapse.weight = synapseBeingResult.weight;
                }

                child.output.synapses.push(newSynapse);
            } else {
                const newOrigin = child.findNeuronWithId(synapse.origin.id);
                const newSynapse = synapse.clone(newOrigin);
                child.output.synapses.push(newSynapse);
            }
        }

        //this.testChildNetworkDoubleNeurons(n1, n2, child);
        //this.testChildNetworkNoSynapses(n1, n2, child);

        return child;
    }

    testChildNetworkNoSynapses(n1: Network, n2: Network, child: Network) {
        for (let neuron of child.hidden) {
            if (neuron.synapses.length === 0) {

                let numberOfSynapses = 0;

                for (let neuronx of child.hidden) {
                    for (let synapsex of neuronx.synapses) {
                        if (synapsex.origin.id === neuron.id) {
                            numberOfSynapses++;
                        }
                    }
                }

                for (let synapsex of child.output.synapses) {
                    if (synapsex.origin.id === neuron.id) {
                        numberOfSynapses++;
                    }
                }

                if (numberOfSynapses === 0) {
                    this.testPrintDebug(n1, n2, child);
                    throw('Neuron has 0 synapses!');
                }
            }
        }
    }

    testChildNetworkDoubleNeurons(n1: Network, n2: Network, child: Network) {
        const neuronIds: number[] = [];

        for (const neuron of child.hidden) {
            if (neuronIds.indexOf(neuron.id) === -1) {
                neuronIds.push(neuron.id);
            } else {
                this.testPrintDebug(n1, n2, child);
                throw('Network has multiple neurons with same id!');
            }
        }

    }

    testPrintDebug(n1: Network, n2: Network, child: Network) {
        const species1 = new Species(n1);
        n1.fitness = 1;
        species1.networks.push(n1);

        const species2 = new Species(n2);
        n2.fitness = 1;
        species2.networks.push(n2);

        child.fitness = 0;
        const species3 = new Species(child);
        species3.networks.push(child);

        this.speciesArray = [species1, species2, species3];
        // postMessage([this.currentStep, this.bestNetwork, this.speciesArray]);
    }
}