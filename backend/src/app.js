
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const authRoutes = require('./routes/auth.routes');
const postRoutes = require('./routes/post.routes');
const userRoutes = require('./routes/user.routes');
const notificationRoutes = require('./routes/notification.routes');

const hashtagRoutes = require('./routes/hashtag.routes');
const foryouRoutes = require('./routes/foryou.routes');
const trendingRoutes = require('./routes/trending.routes');
const mediaRoutes = require('./routes/media.routes');
const pollRoutes = require('./routes/poll.routes');
const messageRoutes = require('./routes/message.routes');
const communityRoutes = require('./routes/community.routes');

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

// CORS Configuration
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:4173',
    'http://localhost:3000',
    'http://localhost',
    'https://emsee.smp4.xyz'
];

if (process.env.CLIENT_URL) {
    allowedOrigins.push(...process.env.CLIENT_URL.split(',').map(url => url.trim()));
}

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1 && process.env.NODE_ENV === 'production') {
            var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// Security Middleware
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow resource loading (images)
}));

// Rate limiting - increased for dev/local with many assets
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Increased limit
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', limiter);

app.set('trust proxy', 1); // Trust first proxy (necessary for simple deployments behind Nginx/Docker)

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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
app.use('/api/notifications', notificationRoutes);

app.use('/api/hashtags', hashtagRoutes);
app.use('/api/for-you', foryouRoutes);
app.use('/api/trending', trendingRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/communities', communityRoutes);

// Swagger Documentation
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(errorMiddleware);


app.get('/', (req, res) => {
    res.send('API is running...');
});



module.exports = { app, server };
