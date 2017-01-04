import { Neuron } from './neuron';
import { Synapse } from './synapse';
import { Network } from './network';
import { Species } from './species';

export const INNOVATION: any = { value: 1 };

const NUMBER_OF_NETWORKS: number = 10;

let networks: Network[] = [];

const speciesArray: Species[] = [];

for (let i = 0; i < NUMBER_OF_NETWORKS; i++) {
    let network: Network = new Network();
    networks.push(network);
    console.log(network.evaluate());
}

// function addToSpecies(network: Network) {
//     for (let species of speciesArray) {
//         for (let )
//     }
// }