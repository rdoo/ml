import { Network } from './network';

export class Species {
    representant: Network;
    networks: Network[] = [];

    constructor(representant: Network) {
        this.representant = representant;
    }
}