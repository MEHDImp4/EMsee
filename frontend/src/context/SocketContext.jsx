import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import { BASE_URL } from '../services/api';

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { user } = useAuth();
    const socketRef = useRef(null);

    useEffect(() => {
        // Cleanup existing socket if user is logged out or changed
        if (!user) {
            if (socketRef.current) {
                console.log('[SOCKET-CTX] Disconnecting (No User)');
                socketRef.current.disconnect();
                socketRef.current = null;
                setSocket(null);
            }
            return;
        }

        // Avoid re-connecting if already connected with same user
        if (socketRef.current && socketRef.current.connected) {
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            console.error('[SOCKET-CTX] No token found despite user being present');
            return;
        }

        // Use VITE_SOCKET_URL or fallback to just root path (for same-origin) or BASE_URL
        const socketUrl = import.meta.env.VITE_SOCKET_URL || (import.meta.env.DEV ? 'http://localhost:5001' : '/');
        console.log('[SOCKET-CTX] Initializing connection to:', socketUrl);

        // Connect
        const newSocket = io(socketUrl, {
            auth: { token },
            transports: ['polling', 'websocket'], // Try polling first for stability
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            path: '/socket.io/', // Explicit default path
        });

        newSocket.on('connect', () => {
            console.log('[SOCKET-CTX] Connected! ID:', newSocket.id);
        });

        newSocket.on('connect_error', (err) => {
            console.error('[SOCKET-CTX] Connection Error:', err.message);
        });

        newSocket.on('disconnect', (reason) => {
            console.log('[SOCKET-CTX] Disconnected:', reason);
        });

        // Debug ping
        newSocket.on('pong', () => console.log('[SOCKET-CTX] Pong received'));

        socketRef.current = newSocket;
        setSocket(newSocket);

        return () => {
            // Cleanup on unmount (optional, usually keep it alive?)
            // For now, let's keep strict cleanup to avoid dupes
            if (socketRef.current) {
                console.log('[SOCKET-CTX] Cleanup disconnect');
                socketRef.current.disconnect();
                socketRef.current = null;
                setSocket(null);
            }
        };
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};
