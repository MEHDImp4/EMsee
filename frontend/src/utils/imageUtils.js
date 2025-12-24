export const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
    // Remove /api from end if present to get base URL
    const baseUrl = apiUrl.replace(/\/api\/?$/, '');

    // Ensure path starts with / if needed
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    return `${baseUrl}${normalizedPath}`;
};
