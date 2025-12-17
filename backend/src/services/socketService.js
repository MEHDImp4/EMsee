const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

const initializeSocket = (server) => {
    io = socketIo(server, {
        cors: {
            origin: "http://localhost:5173", // Allow frontend origin
            methods: ["GET", "POST"]
        }
    });

    // Authentication Middleware
    io.use((socket, next) => {
        if (socket.handshake.auth && socket.handshake.auth.token) {
            jwt.verify(socket.handshake.auth.token, process.env.JWT_SECRET, (err, decoded) => {
                if (err) return next(new Error('Authentication error'));
                socket.user = decoded;
                next();
            });
        } else {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.user?.id}`);

        // Join user to their personal room for direct messages
        if (socket.user?.id) {
            socket.join(`user_${socket.user.id}`);
            console.log(`User ${socket.user.id} joined room: user_${socket.user.id}`);
        }

        // Join conversation room
        socket.on('joinConversation', (conversationId) => {
            socket.join(`conversation_${conversationId}`);
            console.log(`User ${socket.user.id} joined conversation: ${conversationId}`);
        });

        // Leave conversation room
        socket.on('leaveConversation', (conversationId) => {
            socket.leave(`conversation_${conversationId}`);
            console.log(`User ${socket.user.id} left conversation: ${conversationId}`);
        });

        // User is typing indicator
        socket.on('typing', ({ conversationId, isTyping }) => {
            socket.to(`conversation_${conversationId}`).emit('userTyping', {
                userId: socket.user.id,
                conversationId,
                isTyping
            });
        });

        socket.on('disconnect', () => {
            console.log('User disconnected');
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
