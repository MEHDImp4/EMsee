import React, { createContext, useContext, useState } from 'react';

const ModalContext = createContext();

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
    const [isComposeOpen, setIsComposeOpen] = useState(false);
    const [replyTo, setReplyTo] = useState(null);

    const [modalOptions, setModalOptions] = useState({});

    const openCompose = (target = null, options = {}) => {
        // target can be a post or a comment; we tag comments with isComment to route API
        if (target?.isComment) {
            setReplyTo({ ...target, isComment: true });
        } else if (target) {
            setReplyTo({ ...target, isComment: false });
        } else {
            setReplyTo(null);
        }
        setModalOptions(options); // Store callbacks like onSuccess
        setIsComposeOpen(true);
    };

    const closeCompose = () => {
        setIsComposeOpen(false);
        setReplyTo(null);
        setModalOptions({});
    };

    return (
        <ModalContext.Provider value={{ isComposeOpen, replyTo, modalOptions, openCompose, closeCompose }}>
            {children}
        </ModalContext.Provider>
    );
};
