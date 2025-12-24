const http = require('http');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();
const dotenv = require('dotenv');
dotenv.config();

const port = 5001; // Found 5001 in .env

async function run() {
    try {
        const user = await prisma.user.findFirst();
        if (!user) {
            console.log('No user found');
            return;
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '1h' });

        const options = {
            hostname: 'localhost',
            port: port,
            path: '/api/notifications/status',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const data = JSON.parse(body);
                    console.log(`User ID: ${data.userId}`);
                    console.log(`Is Connected: ${data.isConnected}`);
                    console.log(`Active Rooms: ${data.allRooms.join(', ')}`);
                } catch (e) {
                    console.log('Raw Body:', body);
                }
            });
        });

        req.end();
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

run();
