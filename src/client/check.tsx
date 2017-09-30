import { select } from 'd3-selection';
import * as React from 'react';

import { Network } from '../network';
import { Neuron } from '../neuron';
import { NetworkSerialized } from '../serialization.models';
import { Synapse } from '../synapse';
import { CanvasComponent } from './canvas';

export class CheckComponent extends React.Component {
    props: { network: NetworkSerialized, data: any[], onClick: () => void };
    state;

    inputDataSVG: SVGElement;
    outputDataSVG: SVGElement;

    network: Network;

    min: number = 1e6;
    max: number = 0;

    svgHeight: number = 200;

    componentDidMount() {
        if (this.props.data !== undefined) {
            for (const item of this.props.data) {
                if (item.price < this.min) {
                    this.min = item.price;
                } else if (item.price > this.max) {
                    this.max = item.price;
                }
            }
            this.restoreNetwork();
            this.simulate()
            this.draw();
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

    simulate() {
        const data: number[] = [];
        for (const item of this.props.data) {
            this.network.inputs[0].value = item.price;
            this.network.inputs[1].value = item.volume;

            data.push(this.network.evaluate());
        }

        this.miniDraw(data);
    }

    draw() {
        select(this.inputDataSVG).selectAll('*').remove();
        const svg = select(this.inputDataSVG);

        let currentX: number = 0;

        for (const item of this.props.data) {
            svg.append('rect').attr('x', currentX).attr('y', this.getYFromPrice(item.price)).attr('width', 1).attr('height', 1);
            currentX++;
        }
    }

    miniDraw(data: number[]) {
        select(this.outputDataSVG).selectAll('*').remove();
        const svg = select(this.outputDataSVG);

        let currentX: number = 0;
        
        for (const item of this.props.data) {
            svg.append('rect').attr('x', currentX).attr('y', 100 - data[currentX] * 100).attr('width', 1).attr('height', 1);
            currentX++;
        }

        svg.append('line').attr('x1', 0).attr('y1', 25).attr('x2', this.props.data.length).attr('y2', 25)
            .style('stroke', 'green').style('stroke-width', 1);

        svg.append('line').attr('x1', 0).attr('y1', 75).attr('x2', this.props.data.length).attr('y2', 75)
            .style('stroke', 'red').style('stroke-width', 1);
    }

    getYFromPrice(price: number) {
        return (this.max - price) * (this.svgHeight - 1) / (this.max - this.min) + 0.5;
    }

    render() {
        return <div className="overlay" onClick={this.props.onClick}>
            <div className="check-container" onClick={event => event.stopPropagation()}>
                <div className="check-svg-container">
                    <svg ref={node => this.inputDataSVG = node} width={this.props.data.length} height={this.svgHeight}></svg>
                    <hr />
                    <svg ref={node => this.outputDataSVG = node} width={this.props.data.length} height={101}></svg>
                </div>
                <CanvasComponent data={this.props.network}></CanvasComponent>
            </div>
        </div>
    };
}