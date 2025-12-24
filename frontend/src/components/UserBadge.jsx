import React from 'react';
import { useTranslation } from 'react-i18next';
import './css/UserBadge.css';

const getBadgeColorClass = (text) => {
    if (!text) return 'badge-default';
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash % 8); // 8 color variants defined in CSS
    return `badge-color-${index}`;
};

const UserBadge = ({ user }) => {
    const { t } = useTranslation();

    if (!user) return null;

    const role = user.role?.toLowerCase();

    // Badge for students: Show their class
    if (role === 'student' && user.studentClass) {
        const colorClass = getBadgeColorClass(user.studentClass);
        return (
            <span className={`user-badge ${colorClass}`} title={t('badge.class', 'Student Class')}>
                {user.studentClass}
            </span>
        );
    }

    // Badge for professors: Show their subject(s)
    if (role === 'professor' && user.subjects) {
        let subjects = user.subjects;

        // Handle if subjects is a JSON string or already an object/array
        if (typeof subjects === 'string') {
            try {
                subjects = JSON.parse(subjects);
            } catch (e) {
                // keep as string if not valid json
            }
        }

        let displayText = '';
        if (Array.isArray(subjects) && subjects.length > 0) {
            displayText = subjects.join(', ');
        } else if (typeof subjects === 'string') {
            displayText = subjects;
        }

        if (displayText) {
            const colorClass = getBadgeColorClass(displayText);
            return (
                <span className={`user-badge ${colorClass}`} title={t('badge.subject', 'Professor Subject')}>
                    {displayText}
                </span>
            );
        }
    }

    return null;
};

export default UserBadge;
