import { CanvasComponent } from './canvas';
import { select } from 'd3-selection';
import * as React from 'react';

import { NetworkSerialized } from '../serialization.models';

export class CheckComponent extends React.Component {
    props: { network: NetworkSerialized, data: any[], onClick: () => void };

    node: SVGElement;

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
            this.draw();
        }
    }

    draw() {
        select(this.node).selectAll('*').remove();
        const svg = select(this.node);

        let currentX: number = 0;

        for (const item of this.props.data) {
            svg.append('rect').attr('x', currentX).attr('y', this.getYFromPrice(item.price)).attr('width', 1).attr('height', 1);
            currentX++;
        }
    }

    getYFromPrice(price: number) {
        return (this.max - price) * (this.svgHeight - 1) / (this.max - this.min) + 0.5;
    }

    render() {
        return <div className="overlay" onClick={this.props.onClick}>
            <div className="check-container" onClick={event => event.stopPropagation()}>
                <div className="check-svg-container">
                    <svg ref={node => this.node = node} width={this.props.data.length} height={this.svgHeight}></svg>
                </div>
                <CanvasComponent data={this.props.network}></CanvasComponent>
            </div>
        </div>
    };
}