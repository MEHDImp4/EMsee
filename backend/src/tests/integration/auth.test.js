const request = require('supertest');
const { app, server } = require('../../app');

// Mock UserModel before req
jest.mock('../../models/UserModel', () => ({
    UserModel: {
        findByEmail: jest.fn(),
        findByUsername: jest.fn(),
        create: jest.fn(),
    }
}));

const { UserModel } = require('../../models/UserModel');

describe('Auth API Integration', () => {
    let testServer;

    beforeAll(() => {
        testServer = server;
    });

    afterAll(async () => {
        await new Promise(resolve => testServer.close(resolve));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/auth/register', () => {
        it('should return 400 if validation fails (short password)', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'validUser',
                    email: 'test@example.com',
                    password: '123' // Too short
                });

            // If validation fails, controller is NOT reached.
            expect(UserModel.findByEmail).not.toHaveBeenCalled();
            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBe('Validation failed');
        });

        it('should return 400 if email is invalid', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'validUser',
                    email: 'not-an-email',
                    password: 'password123'
                });

            expect(UserModel.findByEmail).not.toHaveBeenCalled();
            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBe('Validation failed');
        });
    });

    describe('POST /api/auth/login', () => {
        it('should return 400 if fields are missing', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com'
                    // Missing password
                });

            expect(UserModel.findByEmail).not.toHaveBeenCalled();
            expect(res.statusCode).toBe(400);
        });
    });
});
