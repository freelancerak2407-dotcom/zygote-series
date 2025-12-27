const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const config = require('./config');

// Import routes
const authRoutes = require('./routes/auth');
const trackRoutes = require('./routes/tracks');
const subjectRoutes = require('./routes/subjects');
const topicRoutes = require('./routes/topics');
const adminRoutes = require('./routes/admin');
const subscriptionRoutes = require('./routes/subscriptions');
const userRoutes = require('./routes/users');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: [config.FRONTEND_URL, config.ADMIN_URL],
    credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (config.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Rate limiting
const limiter = rateLimit({
    windowMs: config.RATE_LIMIT_WINDOW_MS,
    max: config.RATE_LIMIT_MAX_REQUESTS,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'ZYGOTE API is running',
        timestamp: new Date().toISOString(),
        environment: config.NODE_ENV
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tracks', trackRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/users', userRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);

    // Don't leak error details in production
    const message = config.NODE_ENV === 'development'
        ? err.message
        : 'An error occurred. Please try again later.';

    res.status(err.status || 500).json({
        success: false,
        message,
        ...(config.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Start server
const PORT = config.PORT || 5000;

app.listen(PORT, () => {
    console.log('');
    console.log('🧬 ================================');
    console.log('   ZYGOTE API Server');
    console.log('================================');
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${config.NODE_ENV}`);
    console.log(`📡 API URL: http://localhost:${PORT}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    console.log('================================');
    console.log('');
});

module.exports = app;
