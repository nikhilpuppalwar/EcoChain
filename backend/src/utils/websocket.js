const { WebSocketServer, WebSocket } = require('ws');

let wss;

// Map to store connected users { userId: WebSocket }
const clients = new Map();

const initWebSocket = (server) => {
    wss = new WebSocketServer({ server });

    wss.on('connection', (ws, req) => {
        console.log('🔌 New WebSocket connection');

        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message);

                // Handle auth message
                if (data.type === 'auth' && data.userId) {
                    clients.set(data.userId, ws);
                    console.log(`👤 User ${data.userId} authenticated on WebSocket`);
                }
            } catch (err) {
                console.error('WebSocket parse error:', err);
            }
        });

        ws.on('close', () => {
            for (const [userId, client] of clients.entries()) {
                if (client === ws) {
                    clients.delete(userId);
                    console.log(`🔌 User ${userId} disconnected`);
                    break;
                }
            }
        });
    });
};

const sendToUser = (userId, payload) => {
    const ws = clients.get(userId.toString());
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(payload));
    }
};

const broadcastToRole = (role, payload) => {
    // In a real app we would need a way to look up all connected users for a role
    // For now this is a limitation unless we query DB, but we could broadcast to all
    // and frontends can filter it out, or we maintain a role map.
    // Simplified broadcast format for now:
    wss?.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ ...payload, targetRole: role }));
        }
    });
};

module.exports = { initWebSocket, sendToUser, broadcastToRole };
