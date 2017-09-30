import * as React from 'react';

import { Config } from '../ml/config';
import { NetworkSerialized, StateSerialized } from '../ml/serialization.models';
import { CanvasComponent } from './canvas';
import { CheckComponent } from './check';

interface AppState {
    mlState: StateSerialized;
    currentlyViewed: number[];
    inputData: any[];
    chosenNetwork: NetworkSerialized;
    running: boolean;
    paused: boolean;
}

export class App extends React.Component {
    ws: WebSocket;

    config: Config = {
        networksNumber: 300,
        cullingPercent: 0.8,
        fitnessThreshold: 100,
        weightMutation: 0.05,
        synapseMutation: 0.05,
        neuronMutation: 0.001,
        c1: 1.5,
        c2: 1.5,
        c3: 0.002,
        sameSpeciesThreshold: 1.0
    };

    state: AppState | undefined;

    ticker: string = 'PZU';
    date: string = '2017-09-08';

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.setState({ paused: false });
        const protocol: string = window.location.protocol === 'http:' ? 'ws://' : 'wss://';
        
        this.ws = new WebSocket(protocol + window.location.host);
        
        this.ws.onmessage = (message) => {
            const newState: any = JSON.parse(message.data);
            if (newState.step !== undefined && !this.state.paused) {
                const currentlyViewed: number[] = newState.speciesArray.map(species => 0);
                this.setState({ mlState: newState, currentlyViewed });
            } else if (newState.running !== undefined) {
                this.setState(newState);
            } else if (newState.length > 0) {
                this.setState({ inputData: newState });
            }
        }
    }

    start() {
        this.ws.send('ST' + JSON.stringify(this.config));
    }

    stop() {
        this.ws.send('SP');
    }

    pause() {
        this.setState({ paused: !this.state.paused });
    }

    // getData() {
    //     this.ws.send('DA' + this.ticker + ':' + this.date);
    // }

    showNetwork(network: NetworkSerialized) {
        this.setState({ chosenNetwork: network });
    }

    hideNetwork() {
        this.setState({ chosenNetwork: undefined });
    }

    setCurrentlyViewed(index: number, value: number) {
        if (Number.isNaN(value)) {
            return;
        }

        if (value >= this.state.mlState.speciesArray[index].networks.length) {
            this.state.currentlyViewed[index] = this.state.mlState.speciesArray[index].networks.length - 1;
        } else if (value < 0) {
            this.state.currentlyViewed[index] = 0;
        } else {
            this.state.currentlyViewed[index] = value;
        }

        this.setState({ currentlyViewed: this.state.currentlyViewed });
    }

    render() {
        return (
            <div>
                <button disabled={this.state && this.state.running} onClick={() => this.start()}>START</button>
                <button disabled={this.state && !this.state.running} onClick={() => this.pause()}>{this.state && this.state.paused ? 'UNPAUSE' : 'PAUSE'}</button>
                <button disabled={this.state && !this.state.running} onClick={() => this.stop()}>STOP</button>
                Networks #: <input disabled={this.state && this.state.running} defaultValue={String(this.config.networksNumber)} onKeyUp={event => this.config.networksNumber = Number((event.target as HTMLInputElement).value)} />
                Culling %: <input disabled={this.state && this.state.running} defaultValue={String(this.config.cullingPercent)} onKeyUp={event => this.config.cullingPercent = Number((event.target as HTMLInputElement).value)} />
                Fitness threshold: <input disabled={this.state && this.state.running} defaultValue={String(this.config.fitnessThreshold)} onKeyUp={event => this.config.fitnessThreshold = Number((event.target as HTMLInputElement).value)} />
                Weight mut: <input disabled={this.state && this.state.running} defaultValue={String(this.config.weightMutation)} onKeyUp={event => this.config.weightMutation = Number((event.target as HTMLInputElement).value)} />
                Synapse mut: <input disabled={this.state && this.state.running} defaultValue={String(this.config.synapseMutation)} onKeyUp={event => this.config.synapseMutation = Number((event.target as HTMLInputElement).value)} />
                Neuron mut: <input disabled={this.state && this.state.running} defaultValue={String(this.config.neuronMutation)} onKeyUp={event => this.config.neuronMutation = Number((event.target as HTMLInputElement).value)} />
                C1: <input disabled={this.state && this.state.running} defaultValue={String(this.config.c1)} onKeyUp={event => this.config.c1 = Number((event.target as HTMLInputElement).value)} />
                C2: <input disabled={this.state && this.state.running} defaultValue={String(this.config.c2)} onKeyUp={event => this.config.c2 = Number((event.target as HTMLInputElement).value)} />
                C3: <input disabled={this.state && this.state.running} defaultValue={String(this.config.c3)} onKeyUp={event => this.config.c3 = Number((event.target as HTMLInputElement).value)} />
                Species threshold: <input disabled={this.state && this.state.running} defaultValue={String(this.config.sameSpeciesThreshold)} onKeyUp={event => this.config.sameSpeciesThreshold = Number((event.target as HTMLInputElement).value)} />
                {/* <div>
                    <button onClick={() => this.getData()}>GET DATA</button>
                </div> */}
                {this.state && this.state.mlState && <div>
                    <div>Current step: {this.state.mlState.step}</div>
                    <div>Species: {this.state.mlState.speciesArray.length} - {this.state.mlState.speciesArray.map((species, i) => <span key={i}> {species.networks.length} </span>)}</div>
                    <div>Best fitness: {this.state.mlState.bestNetwork.fitness}</div>
                    <button onClick={() => this.showNetwork(this.state.mlState.bestNetwork)}>SHOW</button>
                    <CanvasComponent data={this.state.mlState.bestNetwork}></CanvasComponent>
                </div>}
                {this.state && this.state.mlState && this.state.mlState.speciesArray.map((species, i) => {
                    return <div key={i}>
                            <div>
                                Number: <input value={String(this.state.currentlyViewed[i])} onChange={event => this.setCurrentlyViewed(i, Number((event.target as HTMLInputElement).value))}/>
                                <button disabled={this.state.currentlyViewed[i] <= 0} onClick={() => this.setCurrentlyViewed(i, this.state.currentlyViewed[i] - 1)}>PREV</button>
                                <button disabled={this.state.currentlyViewed[i] >= (species.networks.length - 1)} onClick={() => this.setCurrentlyViewed(i, this.state.currentlyViewed[i] + 1)}>NEXT</button>
                                <button onClick={() => this.showNetwork(species.networks[this.state.currentlyViewed[i]])}>SHOW</button>
                                Actual networks: {species.networks.length} Desired: {species.desiredPopulation} Avg fitness: {species.averageFitness} This fitness: {species.networks[this.state.currentlyViewed[i]].fitness}
                            </div>
                            <CanvasComponent data={species.networks[this.state.currentlyViewed[i]]}></CanvasComponent>
                        </div>;
                })}
                { this.state && this.state.chosenNetwork && <CheckComponent network={this.state.chosenNetwork} data={this.state.inputData} onClick={() => this.hideNetwork()}></CheckComponent>}
            </div>
        );
    }
}