let protocol: string;
if (window.location.protocol === 'http:') {
    protocol = 'ws://';
} else {
    protocol = 'wss://';
}

let ws = new WebSocket(protocol + window.location.host);

ws.onmessage = (message) => {
    console.log(message.data);

    ws.send('lel');
}
