import { select } from 'd3-selection';
import * as React from 'react';

import { NetworkSerialized } from '../serialization.models';

export class CheckComponent extends React.Component {
    props: { network: NetworkSerialized, data: any[], onClick: () => void };

    node: SVGElement;

    componentDidMount() {
        if (this.props.data !== undefined) {
            this.draw();
        }
    }

    draw() {
        select(this.node).selectAll('*').remove();
        const svg = select(this.node);
    }

    render() {
        return <div className="overlay">
            <button onClick={this.props.onClick}>CLOSE</button>
            <svg ref={node => this.node = node} width={1000} height={200}></svg>
            {/* {this.props.data.map((item, i) => {
                return <div key={i}>{item.time} {item.price} {item.volume}</div>
            })} */}
        </div>
    };
}