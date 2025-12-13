
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth.routes');
const postRoutes = require('./routes/post.routes');
const userRoutes = require('./routes/user.routes');
const commentRoutes = require('./routes/comment.routes');

const http = require('http'); // Import http
const { initializeSocket } = require('./services/socketService'); // Import socket service

// Load environment variables
const dotenvExpand = require('dotenv-expand');
const dotenvConfig = dotenv.config();
dotenvExpand.expand(dotenvConfig);

// Skip this check in test environment if you want, or ensure env vars are set in tests
if (!process.env.JWT_SECRET && process.env.NODE_ENV !== 'test') {
    console.error('FATAL ERROR: JWT_SECRET is not defined in environment variables.');
    process.exit(1);
}

const app = express();
const server = http.createServer(app); // Create HTTP server
const io = initializeSocket(server); // Initialize Socket.io

app.use(cors());
app.use(express.json());

// Request logging middleware
if (process.env.NODE_ENV !== 'test') {
    app.use((req, res, next) => {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
        next();
    });
}

const errorMiddleware = require('./middlewares/errorMiddleware');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/comments', commentRoutes);

// Swagger Documentation
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(errorMiddleware);


app.get('/', (req, res) => {
    res.send('API is running...');
});

// Serve static uploads
app.use('/uploads', express.static('uploads'));

module.exports = { app, server };
