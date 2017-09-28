import { select } from 'd3-selection';
import * as React from 'react';

import { NetworkSerialized, NeuronSerialized } from '../serialization.models';

const X_MULTIPLIER: number = 300;
const Y_MULTIPLIER: number = 100;
const X_OFFSET: number = 50;
const Y_OFFSET: number = 25;

export class CanvasComponent extends React.Component {
    node: SVGElement;
    props: { data: NetworkSerialized };


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

        const calculatedNeurons: {[key: number]: { x: number, y: number }} = { };

        for (const neuron of this.props.data.inputs) {
            const x: number = layerNumber * X_MULTIPLIER + X_OFFSET;
            const y: number = currentNodeInLayer * Y_MULTIPLIER + Y_OFFSET;

            svg.append('circle').attr('r', 10).style('fill', 'white').style('stroke', 'black')
            .attr('transform', 'translate(' + x + ', ' + y + ')');

            svg.append('text').attr('x', x).attr('y', y + 7).attr('font-size', 8).attr('fill', 'black')
                .text(neuron.id);

            calculatedNeurons[neuron.id] = { x, y };
            currentNodeInLayer++;
        }

        layerNumber++;
        currentNodeInLayer = 0;
    }

    render() {
        return (
            <div className="container">
                <svg ref={node => this.node = node} width={4000} height={4000}></svg>
            </div>
        );
    }
}