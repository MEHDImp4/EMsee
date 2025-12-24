const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

const initializeSocket = (server) => {
    io = socketIo(server, {
        cors: {
            origin: "*", // Allow ALL origins for dev stability
            methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
            credentials: true
        },
        transports: ['websocket', 'polling'] // Allow both, prefer websocket
    });

    // Authentication Middleware
    io.use((socket, next) => {
        if (socket.handshake.auth && socket.handshake.auth.token) {
            jwt.verify(socket.handshake.auth.token, process.env.JWT_SECRET, (err, decoded) => {
                if (err) {
                    console.error('[SOCKET] Auth Error:', err.message);
                    return next(new Error('Authentication error'));
                }
                socket.user = decoded;
                next();
            });
        } else {
            console.error('[SOCKET] No token provided');
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`[SOCKET] User Connected: ${socket.user?.id} (${socket.id})`);

        // Force join user room
        if (socket.user?.id) {
            const roomName = `user_${socket.user.id}`;
            socket.join(roomName);
            console.log(`[SOCKET] Joined Room: ${roomName}`);
        }

        // Simple debug ping/pong
        socket.on('ping', () => socket.emit('pong'));

        socket.on('disconnect', (reason) => {
            console.log(`[SOCKET] User Disconnected: ${socket.user?.id} Reason: ${reason}`);
        });
    });

    return io;
};

const getIo = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

module.exports = {
    initializeSocket,
    getIo
};
