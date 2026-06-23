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
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, Postman, server-to-server)
        if (!origin) return callback(null, true);

        // Allow exact matches from allowedOrigins list
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        // Allow any Vercel deployment (preview & production) and ngrok tunnels
        if (origin.endsWith('.vercel.app') || origin.endsWith('.ngrok-free.app') || origin.endsWith('.ngrok-free.dev')) {
            return callback(null, true);
        }

        const msg = `CORS: Origin '${origin}' is not allowed. Add it to FRONTEND_URL in your Render environment variables.`;
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
app.use('/api/credits', require('./src/routes/wallet.routes')); // Alias for the frontend
app.use('/api/ai', require('./src/routes/ai.routes'));
app.use('/api/audit', require('./src/routes/audit.routes'));
app.use('/api/reports', require('./src/routes/reports.routes'));
app.use('/api/public', require('./src/routes/public.routes'));
app.use('/api/profile', require('./src/routes/profile.routes'));
// DEV ONLY admin helpers (only active when HACKATHON_MODE=true)
app.use('/api/admin', require('./src/routes/admin.routes'));


// Basic Health Check
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// Global Error Handler
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
