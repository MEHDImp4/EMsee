export const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
};

export const getAvatarColor = (name) => {
    const colors = [
        '#ef4444', // red
        '#f97316', // orange
        '#f59e0b', // amber
        '#84cc16', // lime
        '#10b981', // emerald
        '#06b6d4', // cyan
        '#3b82f6', // blue
        '#6366f1', // indigo
        '#8b5cf6', // violet
        '#d946ef', // fuchsia
        '#f43f5e', // rose
        '#64748b'  // slate
    ];
    if (!name) return colors[colors.length - 1];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash % colors.length);
    return colors[index];
};
