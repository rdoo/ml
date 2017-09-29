import { select } from 'd3-selection';
import * as React from 'react';

import { NetworkSerialized, NeuronSerialized, SynapseSerialized } from '../serialization.models';

const X_MULTIPLIER: number = 300;
const Y_MULTIPLIER: number = 100;
const X_OFFSET: number = 50;
const Y_OFFSET: number = 25;

const EVEN_Y_OFFSET: number = 25;

export class CanvasComponent extends React.Component {
    node: SVGElement;
    props: { data: NetworkSerialized };
    state = { clicked: false };


    constructor(props) {
        super(props);
        this.draw = this.draw.bind(this);
    }

    componentDidMount() {
        if (this.props.data.inputs !== undefined) {
            this.draw();
        }
    }

    componentDidUpdate() {
        this.draw();
    }

    draw() {
        select(this.node).selectAll('*').remove();
        const svg = select(this.node);

        svg.append('rect').attr('width', '100%') .attr('height', '100%').attr('fill', '#F9F9FF');
    
        let layerNumber: number = 0;
        let currentNodeInLayer: number = 0;

        const calculatedNeurons: {[id: number]: { x: number, y: number, layer: number }} = { };
        let calculatedNeuronsNumber: number = 0;

        for (const neuron of this.props.data.inputs) {
            const x: number = layerNumber * X_MULTIPLIER + X_OFFSET;
            const y: number = currentNodeInLayer * Y_MULTIPLIER + Y_OFFSET;

            svg.append('circle').attr('r', 10).style('fill', 'white').style('stroke', 'black')
                .attr('transform', 'translate(' + x + ', ' + y + ')');

            svg.append('text').attr('x', x).attr('y', y + 7).attr('font-size', 8).attr('fill', 'black')
                .text(neuron.id);

            calculatedNeurons[neuron.id] = { x, y, layer: layerNumber };
            calculatedNeuronsNumber++;
            currentNodeInLayer++;
        }

        layerNumber++;
        currentNodeInLayer = 0;

        const allNeuronsNumber: number = this.props.data.inputs.length + this.props.data.hidden.length; // without output
    
        while (calculatedNeuronsNumber < allNeuronsNumber) {
            let lowestDiscNeuron: NeuronSerialized;
            let lowestDisc: number = 1e10;
            let thereAreZeros: boolean = false;

            for (const neuron of this.props.data.hidden) {
                if (calculatedNeurons[neuron.id] === undefined) {
                    let currentDisc: number = 0;
                    for (const synapse of this.props.data.synapses) {
                        if (synapse.targetId === neuron.id && calculatedNeurons[synapse.originId] === undefined) {
                            currentDisc++;
                        }
                    }

                    if (currentDisc === 0) {
                        const x: number = layerNumber * X_MULTIPLIER + X_OFFSET;
                        let y: number = currentNodeInLayer * Y_MULTIPLIER + Y_OFFSET;
                        if (layerNumber % 2 === 1) {
                            y += EVEN_Y_OFFSET;
                        }
                        calculatedNeurons[neuron.id] = { x, y, layer: layerNumber };
                        calculatedNeuronsNumber++;
                        currentNodeInLayer++;
                        thereAreZeros = true;

                        svg.append('circle').attr('r', 10).style('fill', 'white').style('stroke', 'black')
                            .attr('transform', 'translate(' + x + ', ' + y + ')');

                        svg.append('text').attr('x', x).attr('y', y + 7).attr('font-size', 8).attr('fill', 'black')
                            .text(neuron.id);
                    } else if (currentDisc < lowestDisc) {
                        lowestDiscNeuron = neuron;
                        lowestDisc = currentDisc;
                    }
                }
            }

            if (thereAreZeros) { // todo moze usunac?
                layerNumber++;
                currentNodeInLayer = 0;
            }

            if (lowestDiscNeuron !== undefined) {
                const x: number = layerNumber * X_MULTIPLIER + X_OFFSET;
                let y: number = currentNodeInLayer * Y_MULTIPLIER + Y_OFFSET;
                if (layerNumber % 2 === 1) {
                    y += EVEN_Y_OFFSET;
                }
                calculatedNeurons[lowestDiscNeuron.id] = { x, y, layer: layerNumber };
                calculatedNeuronsNumber++;

                svg.append('circle').attr('r', 10).style('fill', 'white').style('stroke', 'black')
                    .attr('transform', 'translate(' + x + ', ' + y + ')');

                svg.append('text').attr('x', x).attr('y', y + 7).attr('font-size', 8).attr('fill', 'black')
                    .text(lowestDiscNeuron.id);

                layerNumber++;
            }
        }

        const x: number = layerNumber * X_MULTIPLIER + X_OFFSET;
        let y: number = currentNodeInLayer * Y_MULTIPLIER + Y_OFFSET;
        if (layerNumber % 2 === 1) {
            y += EVEN_Y_OFFSET;
        }
        calculatedNeurons[this.props.data.output.id] = { x, y, layer: layerNumber };

        svg.append('circle').attr('r', 10).style('fill', 'white').style('stroke', 'black')
            .attr('transform', 'translate(' + x + ', ' + y + ')');

        svg.append('text').attr('x', x).attr('y', y + 7).attr('font-size', 8).attr('fill', 'black')
            .text(this.props.data.output.id);


        // synapses
        for (const synapse of this.props.data.synapses) {
            const originX: number = calculatedNeurons[synapse.originId].x;
            let originY: number = calculatedNeurons[synapse.originId].y;
            const targetX: number = calculatedNeurons[synapse.targetId].x;
            let targetY: number = calculatedNeurons[synapse.targetId].y;

            let color: string = 'green';
            
            if (synapse.weight < 0) {
                color = 'red';
            }

            if (calculatedNeurons[synapse.originId].layer > calculatedNeurons[synapse.targetId].layer) {
                originY -= 8;
                targetY -= 8;
                color = 'blue';
            }


            const line = svg.append('line').style('stroke', color).style('stroke-width', Math.abs(synapse.weight / 2))
                .attr('x1', originX).attr('y1', originY).attr('x2', targetX).attr('y2', targetY);

            if (!synapse.enabled) {
                line.attr('stroke-dasharray', '1,5');
            }

            svg.append('text').attr('x', (originX + targetX) / 2).attr('y', (originY + targetY) / 2 - 10).attr('font-size', 8).attr('fill', color)
                .text(synapse.innovation + ' ' + synapse.weight.toFixed(3));
        }
    }

    render() {
        return (
            <div className={'container' + (this.state.clicked ? ' clicked' : '') }>
                <svg ref={node => this.node = node} width={4000} height={4000} onClick={() => this.setState({ clicked: !this.state.clicked })}></svg>
            </div>
        );
    }
}