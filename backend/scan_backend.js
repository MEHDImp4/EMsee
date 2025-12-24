const http = require('http');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();
const dotenv = require('dotenv');
dotenv.config();

const ports = [5000];

async function checkPort(port, token, data) {
    return new Promise((resolve) => {
        const options = {
            hostname: 'localhost',
            port: port,
            path: '/api/notifications/debug',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length,
                'Authorization': `Bearer ${token}`
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                resolve({ port, status: res.statusCode, body });
            });
        });

        req.on('error', () => {
            resolve({ port, status: null });
        });

        req.write(data);
        req.end();
    });
}

async function run() {
    try {
        const user = await prisma.user.findFirst();
        if (!user) {
            console.log('No user found');
            return;
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '1h' });
        console.log('Got token for user:', user.username);
        const data = JSON.stringify({ recipientId: user.id, type: 'SYSTEM' });

        console.log('Scanning ports...');
        for (const port of ports) {
            const result = await checkPort(port, token, data);
            if (result.status) {
                console.log(`Port ${port}: Status ${result.status}`);
                console.log('Body:', result.body);
            }
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

run();
