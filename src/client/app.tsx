import * as React from 'react';

import { Config } from '../config';
import { NetworkSerialized, StateSerialized } from '../serialization.models';
import { CanvasComponent } from './canvas';

export class App extends React.Component {
    ws: WebSocket;

    config: Config = {
        networksNumber: 300,
        cullingPercent: 0.8,
        fitnessThreshold: 0.0001,
        weightMutation: 0.05,
        synapseMutation: 0.05,
        neuronMutation: 0.001,
        c1: 1.5,
        c2: 1.5,
        c3: 0.002,
        sameSpeciesThreshold: 1.0
    };

    state: StateSerialized = { step: 0, bestNetwork: ({ } as NetworkSerialized), speciesArray: [] };

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const protocol: string = window.location.protocol === 'http:' ? 'ws://' : 'wss://';
        
        this.ws = new WebSocket(protocol + window.location.host);
        
        this.ws.onmessage = (message) => {
            this.setState(JSON.parse(message.data));
        }
    }

    start() {
        this.ws.send('ST' + JSON.stringify(this.config));
    }

    stop() {
        this.ws.send('SP');
    }

    render() {
        return (
            <div>
                <button onClick={() => this.start()}>START</button>
                <button onClick={() => this.stop()}>STOP</button>
                Networks #: <input defaultValue={String(this.config.networksNumber)} onKeyUp={event => this.config.networksNumber = Number((event.target as HTMLInputElement).value)} />
                Culling %: <input defaultValue={String(this.config.cullingPercent)} onKeyUp={event => this.config.cullingPercent = Number((event.target as HTMLInputElement).value)} />
                Fitness threshold: <input defaultValue={String(this.config.fitnessThreshold)} onKeyUp={event => this.config.fitnessThreshold = Number((event.target as HTMLInputElement).value)} />
                Weight mut: <input defaultValue={String(this.config.weightMutation)} onKeyUp={event => this.config.weightMutation = Number((event.target as HTMLInputElement).value)} />
                Synapse mut: <input defaultValue={String(this.config.synapseMutation)} onKeyUp={event => this.config.synapseMutation = Number((event.target as HTMLInputElement).value)} />
                Neuron mut: <input defaultValue={String(this.config.neuronMutation)} onKeyUp={event => this.config.neuronMutation = Number((event.target as HTMLInputElement).value)} />
                C1: <input defaultValue={String(this.config.c1)} onKeyUp={event => this.config.c1 = Number((event.target as HTMLInputElement).value)} />
                C2: <input defaultValue={String(this.config.c2)} onKeyUp={event => this.config.c2 = Number((event.target as HTMLInputElement).value)} />
                C3: <input defaultValue={String(this.config.c3)} onKeyUp={event => this.config.c3 = Number((event.target as HTMLInputElement).value)} />
                Species threshold: <input defaultValue={String(this.config.sameSpeciesThreshold)} onKeyUp={event => this.config.sameSpeciesThreshold = Number((event.target as HTMLInputElement).value)} />
                <div>Current step: {this.state.step}</div>
                <div>Species: {this.state.speciesArray.length}</div>
                <div>Best fitness: {this.state.bestNetwork.fitness || 'none'}</div>
                <CanvasComponent data={this.state.bestNetwork}></CanvasComponent>
                {this.state.speciesArray.map((species, i) => {
                    return <div key={i}>
                            <div>Actual networks: {species.networks.length} Desired: {species.desiredPopulation} Avg fitness: {species.averageFitness} This fitness: {species.networks[0].fitness}</div>
                            <CanvasComponent data={species.networks[0]}></CanvasComponent>
                        </div>;
                })}
            </div>
        );
    }
}