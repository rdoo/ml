import * as React from 'react';

import { Config } from '../config';
import { NetworkSerialized, StateSerialized } from '../serialization.models';
import { CanvasComponent } from './canvas';
import { CheckComponent } from './check';

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
    currentlyViewed: number[];

    inputData: any[];
    chosenNetwork: NetworkSerialized;
    networkShown: boolean = false;

    ticker: string = 'PZU';
    date: string = '2017-09-08';

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const protocol: string = window.location.protocol === 'http:' ? 'ws://' : 'wss://';
        
        this.ws = new WebSocket(protocol + window.location.host);
        
        this.ws.onmessage = (message) => {
            const newState: any = JSON.parse(message.data);
            if (newState.step !== undefined) {
                this.currentlyViewed = newState.speciesArray.map(species => 0);
                this.setState(newState);
            } else {
                this.inputData = newState;
                console.log(this.inputData);
            }
        }
    }

    start() {
        this.ws.send('ST' + JSON.stringify(this.config));
    }

    stop() {
        this.ws.send('SP');
    }

    getData() {
        this.ws.send('DA' + this.ticker + ':' + this.date);
    }

    showNetwork(network: NetworkSerialized) {
        this.networkShown = true;
        this.chosenNetwork = network;
        this.forceUpdate();
    }

    hideNetwork() {
        this.networkShown = false;
        this.forceUpdate();
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
                <div>
                    <button onClick={() => this.getData()}>GET DATA</button>
                </div>
                {this.state.bestNetwork.fitness && <div>
                    <div>Current step: {this.state.step}</div>
                    <div>Species: {this.state.speciesArray.length}</div>
                    <div>Best fitness: {this.state.bestNetwork.fitness}</div>
                    <button onClick={() => this.showNetwork(this.state.bestNetwork)}>SHOW</button>
                    <CanvasComponent data={this.state.bestNetwork}></CanvasComponent>
                </div>}
                {this.state.speciesArray.map((species, i) => {
                    return <div key={i}>
                            <div>
                                Number: {this.currentlyViewed[i]}
                                <input defaultValue={String(this.currentlyViewed[i])} onInput={event => { this.currentlyViewed[i] = Number((event.target as HTMLInputElement).value); this.forceUpdate(); }}/>
                                <button disabled={this.currentlyViewed[i] <= 0} onClick={() => { this.currentlyViewed[i]--; this.forceUpdate(); }}>PREV</button>
                                <button disabled={this.currentlyViewed[i] >= (species.networks.length - 1)} onClick={() => { this.currentlyViewed[i]++; this.forceUpdate(); }}>NEXT</button>
                                <button onClick={() => this.showNetwork(species.networks[this.currentlyViewed[i]])}>SHOW</button>
                                Actual networks: {species.networks.length} Desired: {species.desiredPopulation} Avg fitness: {species.averageFitness} This fitness: {species.networks[this.currentlyViewed[i]].fitness}
                            </div>
                            <CanvasComponent data={species.networks[this.currentlyViewed[i]]}></CanvasComponent>
                        </div>;
                })}
                { this.networkShown && <CheckComponent network={this.chosenNetwork} data={this.inputData} onClick={() => this.hideNetwork()}></CheckComponent>}
            </div>
        );
    }
}