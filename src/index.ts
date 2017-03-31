let change = 'asdsdddasaaadaadadaaaaaaaas'

let worker;

export function start() {
    worker = new Worker('./worker.js');
    worker.onmessage = onMessage;
    worker.postMessage('');
}

export function stop() {
    worker.terminate();
}

const onMessage = (event) => {
    document.getElementById('step').innerText = event.data;
}