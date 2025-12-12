import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import { BASE_URL } from '../services/api';

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { user } = useAuth(); // Assuming useAuth provides the current user/token

    useEffect(() => {
        if (user) {
            const token = localStorage.getItem('token'); // Or however you retrieve the token
            const socketInstance = io(BASE_URL, {
                auth: {
                    token: token
                }
            });

            socketInstance.on('connect', () => {
                console.log('Connected to socket server');
            });

            socketInstance.on('disconnect', () => {
                console.log('Disconnected from socket server');
            });

            setSocket(socketInstance);

            return () => {
                socketInstance.disconnect();
            };
        } else {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
        }
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};
