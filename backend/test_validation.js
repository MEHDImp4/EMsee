const express = require('express');
const request = require('supertest');
const { z } = require('zod');
const validateRequest = require('./src/middlewares/validateRequest');

const app = express();
app.use(express.json());

const schema = z.object({
    body: z.object({
        name: z.string().min(3)
    })
});

app.post('/test', validateRequest(schema), (req, res) => {
    res.json({ message: 'Success' });
});

const errorMiddleware = require('./src/middlewares/errorMiddleware');
app.use(errorMiddleware);

async function runTest() {
    try {
        console.log('Testing valid...');
        const res1 = await request(app).post('/test').send({ name: 'Bob' });
        console.log('Valid:', res1.status, res1.body);

        console.log('Testing invalid...');
        const res2 = await request(app).post('/test').send({ name: 'Bo' });
        console.log('Invalid:', res2.status, res2.body);
    } catch (err) {
        console.error(err);
    }
}

runTest();
