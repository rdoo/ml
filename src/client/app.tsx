import * as React from 'react';

import { Config, Options } from '../ml/config';
import { NetworkSerialized, StateSerialized } from '../ml/serialization.models';
import { CanvasComponent } from './canvas';
import { CheckComponent } from './check';
import { OptionsComponent } from './options';

interface InputData {
    [key: string]: any[];
}

interface AppState {
    mlState?: StateSerialized;
    currentlyViewed?: number[];
    inputData?: InputData;
    chosenNetwork?: NetworkSerialized;
    running: boolean;
    paused: boolean;
    optionsOpened: boolean;
}

export class App extends React.Component {
    ws: WebSocket;

    config: Config = {
        networksNumber: 300,
        cullingPercent: 0.8,
        fitnessThreshold: 1000,
        weightMutation: 0.05,
        synapseMutation: 0.05,
        neuronMutation: 0.01,
        c1: 1.5,
        c2: 1.5,
        c3: 0.002,
        sameSpeciesThreshold: 1.0
    };

    options: Options = {
        startMode: 'fresh',
        fileName: 'data.txt',
        inputValue: ''
    };

    state: AppState = { running: false, paused: false, optionsOpened: false };

    componentDidMount() {
        const protocol: string = window.location.protocol === 'http:' ? 'ws://' : 'wss://';
        
        this.ws = new WebSocket(protocol + window.location.host);
        
        this.ws.onmessage = (message) => {
            const type: string = message.data.substring(0, 2);
            const receivedData: any = JSON.parse(message.data.substring(2));
            switch (type) {
                case 'ST': // ml state
                    if (!this.state.paused) {
                        const currentlyViewed: number[] = receivedData.speciesArray.map(species => 0);
                        this.config = receivedData.config;
                        this.setState({ mlState: receivedData, currentlyViewed });
                    }
                    break;
                case 'RU': // is running
                    this.setState(receivedData);
                    break;
                case 'NA': // input data names
                    const inputData: { [key: string]: any[] } = { };
                    for (const name of receivedData) {
                        inputData[name] = null;
                    }
                    this.setState({ inputData });
                    break;
                case 'IN': // input data
                    this.state.inputData[receivedData.desc] = receivedData.data;
                    this.setState({ inputData: this.state.inputData });
                    break;
                default:
                    throw 'Unknown type of received data';
            }
        }
    }

    start() {
        this.ws.send('ST' + JSON.stringify({ options: this.options, config: this.config }));
    }

    stop() {
        this.ws.send('SP');
    }

    sendRequestForData(dataName: string) {
        this.ws.send('DA' + dataName);
    }

    pause() {
        this.setState({ paused: !this.state.paused });
    }

    openCheckComponent(network: NetworkSerialized) {
        this.setState({ chosenNetwork: network });
    }

    hideCheckComponent() {
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

    copyObjectAsString(object: any) {
        const input: HTMLInputElement = document.createElement('input');
        input.style.display = 'hidden';
        input.value = JSON.stringify(object);
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
    }

    render() {
        return (
            <div>
                {this.state.optionsOpened && <OptionsComponent running={this.state.running} config={this.config} options={this.options} onStart={() => this.start()} onStop={() => this.stop()} onHideOptionsComponent={() => this.setState({ optionsOpened: false })} onCopyState={() => this.copyObjectAsString(this.state.mlState)}></OptionsComponent>}
                <button disabled={this.state.running} onClick={() => this.start()}>START</button>
                <button disabled={!this.state.running} onClick={() => this.pause()}>{this.state.paused ? 'UNPAUSE' : 'PAUSE'}</button>
                <button disabled={!this.state.running} onClick={() => this.stop()}>STOP</button>
                <button onClick={() => this.setState({ optionsOpened: true })}>OPTIONS</button>
                {this.state.mlState && <div>
                    <div>Current step: {this.state.mlState.step}</div>
                    <div>Species: {this.state.mlState.speciesArray.length} ({this.state.mlState.speciesArray.reduce((a, b) => a + b.networks.length, 0)})</div>
                    {this.state.mlState.speciesArray.map((species, i) => <div key={i}>{i} - {species.networks.length} - {species.desiredPopulation} - {species.averageFitness} - {species.networks[0].fitness}</div>)}
                    <button onClick={() => this.openCheckComponent(this.state.mlState.bestNetwork)}>SHOW</button>
                    <button onClick={() => this.copyObjectAsString(this.state.mlState.bestNetwork)}>COPY</button>
                    <span>Best fitness: {this.state.mlState.bestNetwork.fitness}</span>
                    <CanvasComponent network={this.state.mlState.bestNetwork}></CanvasComponent>
                </div>}
                {this.state.mlState && this.state.mlState.speciesArray.map((species, i) => {
                    return <div key={i}>
                            <div>
                                <span>#{i} - </span>
                                <input value={String(this.state.currentlyViewed[i])} onChange={event => this.setCurrentlyViewed(i, Number((event.target as HTMLInputElement).value))}/>
                                <button disabled={this.state.currentlyViewed[i] <= 0} onClick={() => this.setCurrentlyViewed(i, this.state.currentlyViewed[i] - 1)}>PREV</button>
                                <button disabled={this.state.currentlyViewed[i] >= (species.networks.length - 1)} onClick={() => this.setCurrentlyViewed(i, this.state.currentlyViewed[i] + 1)}>NEXT</button>
                                <button onClick={() => this.openCheckComponent(species.networks[this.state.currentlyViewed[i]])}>SHOW</button>
                                <button onClick={() => this.copyObjectAsString(species.networks[this.state.currentlyViewed[i]])}>COPY</button>
                                Actual networks: {species.networks.length} Desired: {species.desiredPopulation} Avg fitness: {species.averageFitness} This fitness: {species.networks[this.state.currentlyViewed[i]].fitness}
                            </div>
                            <CanvasComponent network={species.networks[this.state.currentlyViewed[i]]}></CanvasComponent>
                        </div>;
                })}
                {this.state.chosenNetwork && <CheckComponent network={this.state.chosenNetwork} inputData={this.state.inputData} onHideCheckComponent={() => this.hideCheckComponent()} onSendRequestForData={name => this.sendRequestForData(name)}></CheckComponent>}
            </div>
        );
    }
}