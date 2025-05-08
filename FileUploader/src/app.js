require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { initializeFirebase } = require('./config/firebase');
const uploadRoutes = require('./routes/upload');
const errorHandler = require('./middleware/error');
const ssrfProtection = require('./middleware/BlacklistIp/ssrfProtection');
const AllRoutes = require('./routes/AllRoutes');

const app = express();
const PORT = process.env.PORT || 8443;

initializeFirebase();

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.'
});

// CORS configuration
const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization', "access-token"],
    credentials: true
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
};

app.use(cors(corsOptions));
app.use(securityHeaders);
app.use(express.json());
app.use(limiter);
app.use(ssrfProtection);
// I'm paying for this API, so I'm going to protect it from all kinds of misuse and attacks.
app.use(`*`, AllRoutes)
app.use('/upload', uploadRoutes);
app.use(errorHandler);

module.exports = { app, PORT }; 