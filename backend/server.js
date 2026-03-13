require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const http = require('http');
const { WebSocketServer } = require('ws');

// Import utilities
const { initWebSocket } = require('./src/utils/websocket');
const errorHandler = require('./src/middleware/errorHandler');

// Initialize App
const app = express();
const server = http.createServer(app);

// Middleware
app.use(helmet());
app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // allow localhost and any ngrok subdomain
        if (origin === 'http://localhost:5173' || origin.endsWith('.ngrok-free.dev') || origin === process.env.FRONTEND_URL) {
            return callback(null, true);
        }

        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
    },
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Initialize WebSocket
initWebSocket(server);

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes (To be imported later)
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/emissions', require('./src/routes/emissions.routes'));
app.use('/api/marketplace', require('./src/routes/marketplace.routes'));
app.use('/api/gov', require('./src/routes/government.routes'));
app.use('/api/notifications', require('./src/routes/notifications.routes'));
app.use('/api/wallet', require('./src/routes/wallet.routes'));
app.use('/api/ai', require('./src/routes/ai.routes'));
app.use('/api/audit', require('./src/routes/audit.routes'));

// Basic Health Check
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// Global Error Handler
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
