
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './config/db';
import authRoutes from './routes/authRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api/auth', authRoutes);

// Test DB Connection
// Test DB Connection
// Prisma connects lazily, but we can try a simple query to verify
/*
pool.getConnection()
    .then((connection) => {
        console.log('Database connected successfully');
        connection.release();
    })
    .catch((err) => {
        console.error('Database connection failed:', err);
    });
*/
// You can remove this block entirely or replace with:
/*
import prisma from './config/db';
prisma.$connect()
    .then(() => console.log('Database connected successfully'))
    .catch((err) => console.error('Database connection failed:', err));
*/

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log("SERVER RELOADED WITH AVAILABILITY CHECK v2");
});
