import { useMemo, useState } from 'react';

const NOTIFICATIONS = [
    {
        id: 1,
        type: 'like',
        user: 'Sara Bennani',
        avatar: null,
        text: 'a aimé votre réponse',
        content: 'Merci pour les explications sur les closures !',
        time: '2h',
        read: false
    },
    {
        id: 2,
        type: 'system',
        title: 'Nouvelle connexion detectée',
        text: 'Une connexion à votre compte @m.alami a été effectuée depuis un nouvel appareil (Windows 11).',
        time: '23h',
        read: true
    },
    {
        id: 3,
        type: 'anniversary',
        text: "C'est votre anniversaire EMsee !",
        content: "Célébrez votre 1ère année parmi nous.",
        time: '24 Nov',
        read: true
    },
    {
        id: 4,
        type: 'mention',
        user: 'Prof. Amrani',
        avatar: null,
        text: 'vous a mentionné',
        content: "N'oubliez pas de rendre le rapport @m.alami",
        time: '2j',
        read: true
    }
];

const useNotifications = () => {
    const [activeTab, setActiveTab] = useState('all');

    const filteredNotifications = useMemo(() => {
        if (activeTab === 'all') return NOTIFICATIONS;
        if (activeTab === 'verified') return NOTIFICATIONS.filter((n) => n.type === 'system' || n.type === 'anniversary');
        return NOTIFICATIONS.filter((n) => n.type === 'mention' || n.type === 'like');
    }, [activeTab]);

    return { activeTab, setActiveTab, filteredNotifications };
};

export default useNotifications;
