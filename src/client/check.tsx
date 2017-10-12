import { select } from 'd3-selection';
import * as React from 'react';

import { Network } from '../ml/network';
import { Neuron } from '../ml/neuron';
import { NetworkSerialized } from '../ml/serialization.models';
import { Synapse } from '../ml/synapse';
import { CanvasComponent } from './canvas';

interface InputData {
    [key: string]: any[];
}

interface CheckProps {
    network: NetworkSerialized;
    inputData: InputData;
    onHideCheckComponent: () => void;
    onSendRequestForData: (name: string) => void;
}

interface CheckState {
    resultText: string;
    resultBalance: number;
    currentDataName: string;
    currentData: any[];
}

export class CheckComponent extends React.Component {
    props: CheckProps;
    state: CheckState = { resultText: '', resultBalance: 0, currentDataName: '', currentData: null };

    firstDataName: string;
    lastDataName: string;

    inputDataSVG: SVGElement;
    outputDataSVG: SVGElement;

    network: Network;

    min: number;
    max: number;

    svgHeight: number = 200;

    componentDidMount() {
        // console.log('mount');
        const nameArray: string[] = Object.keys(this.props.inputData);
        this.firstDataName = nameArray[0];
        this.lastDataName = nameArray[nameArray.length - 1];
        this.setState({ currentDataName: this.firstDataName, currentData: this.props.inputData[this.firstDataName] });
        this.restoreNetwork();
    }

    componentWillUpdate(nextProps: CheckProps, nextState: CheckState) {
        // console.log('update');
        const data: any[] = this.props.inputData[nextState.currentDataName];

        if (!data) {
            this.props.onSendRequestForData(nextState.currentDataName); // request po brakujace dane
        } else if (nextState.currentDataName !== this.state.currentDataName) {
            this.initDraws(data);
        }
    }

    componentWillReceiveProps(props) {
        // console.log('props');
        const newData: any[] = this.props.inputData[this.state.currentDataName];
        if (newData !== this.state.currentData) {
            this.setState({ currentData: newData });
            this.initDraws(newData);
        }
    }

    initDraws(data: any[]) {
        if (data && data.length > 0) {
            // console.log('drawuje', this.state.currentDataName);
            this.min = 1e6;
            this.max = -1e6;
            for (const item of data) {
                if (item.value < this.min) {
                    this.min = item.value;
                } else if (item.value > this.max) {
                    this.max = item.value;
                }
            }
            this.drawStockPlot(data);
            this.simulate(data);
        }
    }

    restoreNetwork() {
        const inputs: Neuron[] = [];

        for (const neuronSerialized of this.props.network.inputs) {
            const neuron: Neuron = Object.create(Neuron.prototype);
            neuron.calculating = false;
            neuron.synapses = [];
            neuron.id = neuronSerialized.id;
            neuron.value = neuronSerialized.value;

            inputs.push(neuron);
        }

        const hidden: Neuron[] = [];

        for (const neuronSerialized of this.props.network.hidden) {
            const neuron: Neuron = Object.create(Neuron.prototype);
            neuron.calculating = false;
            neuron.synapses = [];
            neuron.id = neuronSerialized.id;
            neuron.value = neuronSerialized.value;

            hidden.push(neuron);
        }

        const output: Neuron = Object.create(Neuron.prototype);
        output.calculating = false;
        output.synapses = [];
        output.id = this.props.network.output.id;
        output.value = this.props.network.output.value;

        for (const synapseSerialized of this.props.network.synapses) {
            const origin: Neuron = this.findNeuronWithId(synapseSerialized.originId, inputs, hidden, output);
            const target: Neuron = this.findNeuronWithId(synapseSerialized.targetId, inputs, hidden, output);
            const synapse: Synapse = { innovation: synapseSerialized.innovation, weight: synapseSerialized.weight, enabled: synapseSerialized.enabled, origin, clone: null };
            target.synapses.push(synapse);
        }

        this.network = Object.create(Network.prototype);
        this.network.fitness = this.props.network.fitness;
        this.network.inputs = inputs;
        this.network.hidden = hidden;
        this.network.output = output;
    }

    findNeuronWithId(id: number, inputs: Neuron[], hidden: Neuron[], output: Neuron): Neuron {
        for (const neuron of inputs) {
            if (neuron.id === id) {
                return neuron;
            }
        }

        for (const neuron of hidden) {
            if (neuron.id === id) {
                return neuron;
            }
        }

        if (output.id === id) {
            return output;
        }

        throw('NEURON NOT FOUND');
    }

    drawStockPlot(data: any[]) {
        select(this.inputDataSVG).selectAll('*').remove();
        const svg = select(this.inputDataSVG);

        let currentX: number = 0;

        for (const item of data) {
            svg.append('rect').attr('x', currentX).attr('y', this.getYFromPrice(item.value)).attr('width', 1).attr('height', 1);
            currentX++;
        }
    }

    simulate(data: any[]) {
        const evalData: number[] = [];
        let priceBought: number = undefined;
        const svg = select(this.inputDataSVG);
        let currentX: number = 0;
        let resultText: string = '';
        let resultBalance: number = 0;
        for (const item of data) {
            this.network.inputs[0].value = item.value;
            this.network.inputs[1].value = item.volume;

            const evaluate: number = this.network.evaluate();

            evalData.push(evaluate);

            if (evaluate > 0.90 && priceBought === undefined) {
                priceBought = item.value;
                resultText += 'B: ' + (item.value / 100).toFixed(2) + ' ';
                svg.append('rect').attr('x', currentX - 3).attr('y', this.getYFromPrice(item.value) - 3).attr('width', 7).attr('height', 7).style('fill', 'green');
            } else if (evaluate < 0.10 && priceBought !== undefined) {
                const balance: number = (item.value - priceBought - 38) / 100;
                priceBought = undefined;
                resultText += 'S: ' + (item.value / 100).toFixed(2) + ' (' + balance.toFixed(2) + ') ';
                resultBalance += balance;
                svg.append('rect').attr('x', currentX - 3).attr('y', this.getYFromPrice(item.value) - 3).attr('width', 7).attr('height', 7).style('fill', 'red');
            }

            currentX++;
        }

        this.setState({ resultText, resultBalance });

        this.drawEvaluatedData(evalData);
    }

    drawEvaluatedData(evalData: number[]) {
        select(this.outputDataSVG).selectAll('*').remove();
        const svg = select(this.outputDataSVG);

        let currentX: number = 0;
        
        for (const item of evalData) {
            svg.append('rect').attr('x', currentX).attr('y', 100 - item * 100).attr('width', 1).attr('height', 1);
            currentX++;
        }

        svg.append('line').attr('x1', 0).attr('y1', 10).attr('x2', evalData.length).attr('y2', 10)
            .style('stroke', 'green').style('stroke-width', 1);

        svg.append('line').attr('x1', 0).attr('y1', 90).attr('x2', evalData.length).attr('y2', 90)
            .style('stroke', 'red').style('stroke-width', 1);
    }

    getYFromPrice(price: number) {
        return (this.max - price) * (this.svgHeight - 1) / (this.max - this.min) + 0.5;
    }

    changeCurrentData(dataName: string) {
        // console.log('zmieniam des na', desc);
        this.setState({ currentDataName: dataName, currentData: this.props.inputData[dataName] });
    }

    findPrevDataName(dataName: string) {
        const nameArray: string[] = Object.keys(this.props.inputData);

        for (let i = nameArray.length - 1; i >= 0; i--) {
            if (nameArray[i] === dataName) {
                return nameArray[--i];
            }
        }
    }

    findNextDataName(dataName: string) {
        const nameArray: string[] = Object.keys(this.props.inputData);

        for (let i = 0; i < nameArray.length; i++) {
            if (nameArray[i] === dataName) {
                return nameArray[++i];
            }
        }
    }

    render() {
        return <div className="overlay" onClick={this.props.onHideCheckComponent}>
            <div className="check-container" onClick={event => event.stopPropagation()}>
                <span>Fitness: {this.props.network.fitness}</span>
                <button disabled={this.state.currentDataName === this.firstDataName} onClick={() => this.changeCurrentData(this.findPrevDataName(this.state.currentDataName))}>PREV</button>
                <select value={this.state.currentDataName} onChange={event => this.changeCurrentData(event.target.value)}>
                    {Object.keys(this.props.inputData).map((item, i) => <option key={i}>{item}</option>)}
                </select>
                <button disabled={this.state.currentDataName === this.lastDataName} onClick={() => this.changeCurrentData(this.findNextDataName(this.state.currentDataName))}>NEXT</button>
                <span>Balance: {this.state.resultBalance.toFixed(2) + '%'}</span>
                <div className="check-svg-container">
                    <svg ref={node => this.inputDataSVG = node} width={(this.state.currentData && this.state.currentData.length) || 2000} height={this.svgHeight}></svg>
                    <hr />
                    <svg ref={node => this.outputDataSVG = node} width={(this.state.currentData && this.state.currentData.length) || 2000} height={101}></svg>
                </div>
                <div>{this.state.resultText}</div>
                <CanvasComponent network={this.props.network}></CanvasComponent>
            </div>
        </div>
    };
}