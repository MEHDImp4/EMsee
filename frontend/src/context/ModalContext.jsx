import React, { createContext, useContext, useState } from 'react';

const ModalContext = createContext();

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
    const [isComposeOpen, setIsComposeOpen] = useState(false);
    const [replyTo, setReplyTo] = useState(null);

    const openCompose = (postToReplyTo = null) => {
        setReplyTo(postToReplyTo);
        setIsComposeOpen(true);
    };

    const closeCompose = () => {
        setIsComposeOpen(false);
        setReplyTo(null);
    };

    return (
        <ModalContext.Provider value={{ isComposeOpen, replyTo, openCompose, closeCompose }}>
            {children}
        </ModalContext.Provider>
    );
};
