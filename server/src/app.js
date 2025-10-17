const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { Sequelize } = require('sequelize');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Database connection
const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/geospatial_db', {
    dialect: 'postgres',
    logging: false
});

// File upload configuration
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage });

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Root endpoint
app.get('/', (req, res) => {
    res.json({ 
        message: 'Geospatial Platform API',
        version: '0.1.0',
        endpoints: {
            health: '/health',
            auth: '/api/auth',
            docs: '/api/docs'
        }
    });
});

// Health check endpoint (no authentication required)
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        service: 'Geospatial Platform Backend'
    });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', authenticateToken, require('./routes/projects'));
app.use('/api/datasets', authenticateToken, require('./routes/datasets'));
app.use('/api/analysis', authenticateToken, require('./routes/analysis'));

// WebSocket setup
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});

// WebSocket events
io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('subscribe', (projectId) => {
        socket.join(`project_${projectId}`);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
    try {
        // Try to authenticate with database
        await sequelize.authenticate();
        console.log('✓ Database connection established.');
    } catch (error) {
        console.warn('⚠ Warning: Unable to connect to the database:', error.message);
        console.warn('⚠ Server will run without database functionality.');
    }
    console.log(`✓ Server running on port ${PORT}`);
    console.log(`✓ Health check: http://localhost:${PORT}/health`);
    console.log(`✓ API Docs: http://localhost:${PORT}/api`);
});