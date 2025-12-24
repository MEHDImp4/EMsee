const http = require('http');

// Simple script to login and call debug endpoint
// Assuming we have a user/password
const postData = JSON.stringify({
    email: 'test@example.com', // Need a valid user email...
    password: 'password123'
});

// We need a way to get a token.
// I'll assume I can find a user in DB via prisma script and generate a token manually?
// OR use the login endpoint.

// Let's use the local script approach to get a user and generate a token manually using jwt.
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();
const dotenv = require('dotenv');
dotenv.config();

async function run() {
    try {
        const user = await prisma.user.findFirst();
        if (!user) {
            console.log('No user found');
            return;
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '1h' });
        console.log('Got token for user:', user.username);

        // Now call the API
        const data = JSON.stringify({
            recipientId: user.id,
            type: 'SYSTEM'
        });

        const options = {
            hostname: 'localhost',
            port: 5000, // Assuming 5000 from backend package scripts usually? Or .env?
            path: '/api/notifications/debug',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length,
                'Authorization': `Bearer ${token}`
            }
        };

        const req = http.request(options, (res) => {
            console.log(`STATUS: ${res.statusCode}`);
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                console.log(`BODY: ${chunk}`);
            });
        });

        req.on('error', (e) => {
            console.error(`problem with request: ${e.message}`);
        });

        req.write(data);
        req.end();

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

run();
