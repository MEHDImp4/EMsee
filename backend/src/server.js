const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const fs = require('fs');

console.log('DATABASE_URL present:', !!process.env.DATABASE_URL);
const dbUrl = process.env.DATABASE_URL;
try {
    fs.writeFileSync('debug.log', `DATABASE_URL is ${dbUrl ? 'present' : 'missing'}\n`);
} catch (e) {}

let prisma;
try {
    prisma = new PrismaClient({
        datasources: {
            db: {
                url: dbUrl,
            },
        },
    });
    console.log('Prisma Client initialized successfully');
} catch (e) {
    console.error('Failed to initialize Prisma Client:', e);
    try {
        fs.appendFileSync('debug.log', `Error: ${e.message}\n${e.stack}\n`);
    } catch (err) {}
    process.exit(1);
}

app.use(cors());
app.use(express.json());

// Basic health check
app.get('/health', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({ status: 'ok', database: 'connected' });
    } catch (error) {
        res.status(500).json({ status: 'error', database: 'disconnected', error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
});
