import { select } from 'd3-selection';
import * as React from 'react';

export class CanvasComponent extends React.Component {
    node: SVGElement;
    props: { data: any };

    constructor(props) {
        super(props);
    }

    draw() {
        select(this.node)
    }

    render() {
        return <svg ref={node => this.node = node} width={4000} height={4000}></svg>
    }
}