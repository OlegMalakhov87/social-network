const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

const clients = new Map();

function setupWebSocket(server) {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    let userId = null;

    ws.on('message', async (raw) => {
      try {
        const msg = JSON.parse(raw);

        if (msg.type === 'auth') {
          const decoded = jwt.verify(msg.token, process.env.JWT_SECRET);
          userId = decoded.id;
          if (!clients.has(userId)) clients.set(userId, new Set());
          clients.get(userId).add(ws);
          ws.send(JSON.stringify({ type: 'auth success' }));
        }
      } catch (err) {
        ws.send(JSON.stringify({ type: 'error', message: 'Auth failed' }));
      }
    });

    ws.on('close', () => {
      if (userId && clients.has(userId)) {
        clients.get(userId).delete(ws);
        if (clients.get(userId).size === 0) clients.delete(userId);
      }
    });
  });

  return { wss, clients };
}

function notifyUser(userId, payload) {
  const sockets = clients.get(userId);
  if (!sockets) return;
  const data = JSON.stringify(payload);
  sockets.forEach((ws) => ws.send(data));
}

module.exports = { setupWebSocket, notifyUser, clients };
