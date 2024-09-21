import WebSocket from 'ws';
import http from 'http';

let wss: WebSocket.Server;

export const
  initializeWebSocket = (server: http.Server): WebSocket.Server => {
    wss = new WebSocket.Server({ server });

    wss.on('connection', (ws) => {
      // console.log('New WebSocket connection');

      ws.on('message', (message) => {
        console.log('Received:', message);
        // Handle incoming WebSocket messages
      });

      ws.on('close', () => {
        // console.log('WebSocket connection closed');
      });
    });

    return wss;
  };

export const broadcastUpdate = (update: any) => {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(update));
    }
  });
};
