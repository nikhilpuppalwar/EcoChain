const rateLimit = require('express-rate-limit');

// General rate limiter for authentication routes (Login, Register)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // limit each IP to 20 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many authentication attempts from this IP, please try again after 15 minutes.',
    },
});

module.exports = { authLimiter };
