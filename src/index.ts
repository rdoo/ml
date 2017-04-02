import { Network } from './network';
import { Neuron } from './neuron';

declare var d3; // janusze typescriptu

let change = 'asdsdddasaaadaadadaaaaaaaas'

let worker;
let running: boolean = true;

let bestNetwork: any;

for (let i = 0; i < 50; i++) {
    const id: string = 'species' + i;
    const div = document.createElement('div');
    div.id = id;
    setTimeout(() => document.body.appendChild(div), 100);
}

export function start() {
    worker = new Worker('./worker.js');
    worker.onmessage = onMessage;
    worker.postMessage('');
}

export function pause() {
    running = !running;
}

export function stop() {
    worker.terminate();
}

const onMessage = (event) => {
    if (running) {
        bestNetwork = event.data[1];
        document.getElementById('step').innerText = event.data[0];
        document.getElementById('bestNetworkFitness').innerText = event.data[1].fitness;
        document.getElementById('numberOfSpecies').innerText = event.data[2].length;
        d3.select('svg').remove();
        drawNetwork('bestNetwork', event.data[1]);

        const speciesNode = document.getElementById('species');
        while (speciesNode.firstChild) {
            speciesNode.removeChild(speciesNode.firstChild);
        }

        let speciesNumber: number = 0;
        for (let species of event.data[2]) {
            const id: string = 'species' + speciesNumber;
            const fitnessDiv = document.createElement('div');
            fitnessDiv.id = id + 'Fitness';
            fitnessDiv.textContent = '# of networks act: ' + species.networks.length +'; # of networks: ' + species.desiredPopulation + '; Average fitness: ' + species.averageFitness + '; Best fitness: ' + species.networks[0].fitness;
            document.getElementById('species').appendChild(fitnessDiv);

            const svgDiv = document.createElement('div');
            svgDiv.id = id;
            document.getElementById('species').appendChild(svgDiv);
            drawNetwork('species' + speciesNumber, species.networks[0]);
            speciesNumber++;
        }
    }
}

const drawNetwork = (id: string, network: Network) => {
    const X_MULTIPLIER: number = 400;
    const Y_MULTIPLIER: number = 200;

    let Y_OFFSET: number = 100;

    const svg = d3.select('#' + id).append('svg')
        .attr('width', 1500)
        .attr('height', 600);

    let layerNumber: number = 0;
    let currentNodeInLayer: number = 0;

    const calculatedNeurons: any[] = [];

    for (let neuron of network.inputs) {
        const x: number = layerNumber * X_MULTIPLIER + 50;
        const y: number = currentNodeInLayer * Y_MULTIPLIER + Y_OFFSET;
        (neuron as any).x = x;
        (neuron as any).y = y;
        (neuron as any).layer = layerNumber;

        svg.append('circle').attr('r', 10).style('fill', 'white').style('stroke', 'black')
            .attr('transform', 'translate(' + x + ', ' + y + ')');

        calculatedNeurons.push(neuron);
        currentNodeInLayer++;
    }

    layerNumber++;
    currentNodeInLayer = 0;
    Y_OFFSET += 100;

    while (calculatedNeurons.length < (network.inputs.length + network.hidden.length)) {
        for (let neuron of network.hidden) {
            if (calculatedNeurons.indexOf(neuron) === -1) { // nie ma neuronu w tablicy
                (neuron as any).disc = 0;
                for (let synapse of neuron.synapses) {
                    if (calculatedNeurons.indexOf(synapse.origin) === -1 && synapse.enabled) {
                        (neuron as any).disc++;
                    }
                }
            }
        }

        let lowestDisc: number = 100000;

        for (let neuron of network.hidden) {
            if (calculatedNeurons.indexOf(neuron) === -1) { // nie ma neuronu w tablicy
                if ((neuron as any).disc < lowestDisc) {
                    lowestDisc = (neuron as any).disc;
                }
            }
        }

        for (let neuron of network.hidden) {
            if (calculatedNeurons.indexOf(neuron) === -1) { // nie ma neuronu w tablicy
                if ((neuron as any).disc === lowestDisc) {
                    //runLoop = true;

                    const x: number = layerNumber * X_MULTIPLIER + 50;
                    const y: number = currentNodeInLayer * Y_MULTIPLIER + Y_OFFSET;
                    (neuron as any).x = x;
                    (neuron as any).y = y;
                    (neuron as any).layer = layerNumber;

                    svg.append('circle').attr('r', 10).style('fill', 'white').style('stroke', 'black')
                        .attr('transform', 'translate(' + x + ', ' + y + ')');

                    calculatedNeurons.push(neuron);
                    currentNodeInLayer++;
                }
            }
        }

        layerNumber++;
        currentNodeInLayer = 0;

        const x: number = layerNumber * X_MULTIPLIER + 50;
        const y: number = currentNodeInLayer * Y_MULTIPLIER + Y_OFFSET;
        (network.output as any).x = x;
        (network.output as any).y = y;
        (network.output as any).layer = layerNumber;

        svg.append('circle').attr('r', 10).style('fill', 'white').style('stroke', 'black')
            .attr('transform', 'translate(' + x + ', ' + y + ')');
    }

    // lines

    for (let neuron of network.hidden) {
        for (let synapse of neuron.synapses) {
            const originX: number = (synapse.origin as any).x;
            let originY: number = (synapse.origin as any).y;

            const targetX: number = (neuron as any).x;
            let targetY: number = (neuron as any).y;

            let color: string = 'black';

            if (!synapse.enabled) {
                color = 'grey';
            } else if (synapse.weight < 0) {
                color = 'red';
            }

            if ((synapse.origin as any).layer >= (neuron as any).layer) {
                originY -= 8;
                targetY -= 8;
                color = 'blue';
            }

            svg.append('line').style('stroke', color).style('stroke-width', Math.abs(synapse.weight / 2))
                .attr('x1', originX).attr('y1', originY).attr('x2', targetX).attr('y2', targetY);

            svg.append('text').attr('x', (originX + targetX) / 2).attr('y', (originY + targetY) / 2 - 10).attr('font-size', 8).attr('fill', color)
                .text(synapse.innovation + ' ' + synapse.weight.toFixed(3));
        }
    }

    for (let synapse of network.output.synapses) {
        const originX: number = (synapse.origin as any).x;
        let originY: number = (synapse.origin as any).y;

        const targetX: number = (network.output as any).x;
        let targetY: number = (network.output as any).y;

        let color: string = 'black';

        if (!synapse.enabled) {
            color = 'grey';
        } else if (synapse.weight < 0) {
            color = 'red';
        }

        if ((synapse.origin as any).layer >= (network.output as any).layer) {
            originY -= 8;
            targetY -= 8;
            color = 'blue';
        }

        svg.append('line').style('stroke', color).style('stroke-width', Math.abs(synapse.weight / 2))
            .attr('x1', originX).attr('y1', originY).attr('x2', targetX).attr('y2', targetY);

        svg.append('text').attr('x', (originX + targetX) / 2).attr('y', (originY + targetY) / 2 - 10).attr('font-size', 8).attr('fill', color)
            .text(synapse.innovation + ' ' + synapse.weight.toFixed(3));
    }

    //svg.append('line').attr('x1', 100).attr('y1', 100).attr('x2', 200).attr('y2', 200).style('stroke', 'black');
}

export const calcResult = () => {

    // TODO WAZNE !!!!! dodac to do globali
    function getValue(): number {
        if (this.synapses.length === 0) {
            return this.value;
        }

        if (this.calculating === true) {
            return this.value;
        }

        this.calculating = true;

        let tempValue: number = 0;

        for (let synapse of this.synapses) {
            tempValue += synapse.origin.getValue() * synapse.weight;
        }

        this.value = tempValue;

        //return 2.0 / (1.0 + Math.exp(-4.9 * this.value)) - 1.0;
        return 1.0 / (1.0 + Math.exp(-4.9 * this.value));
    }

    const input1: number = Number((document.getElementById('input1') as any).value);
    const input2: number = Number((document.getElementById('input2') as any).value);

    console.log(input1, input2);

    //console.log(bestNetwork);

    bestNetwork.inputs[0].value = input1;
    bestNetwork.inputs[1].value = input2;

    for (let neuron of bestNetwork.inputs) {
        neuron.getValue = getValue.bind(neuron);
    }

    for (let neuron of bestNetwork.hidden) {
        neuron.getValue = getValue.bind(neuron);
    }

    bestNetwork.output.getValue = getValue.bind(bestNetwork.output);

    document.getElementById('result').innerText = String(bestNetwork.output.getValue.apply(bestNetwork.output));


    bestNetwork.output.calculating = false;

    for (let neuron of bestNetwork.hidden) {
        neuron.calculating = false;
    }
}

