import { Neuron } from './neuron';
import { Synapse } from './synapse';
import { Network } from './network';

export const INNOVATION: any = { value: 1 };

const NUMBER_OF_NETWORKS: number = 10;

let networks: Network[] = [];

for (let i = 0; i < NUMBER_OF_NETWORKS; i++) {
    networks.push(new Network());
    console.log(networks[i].evaluate());
}