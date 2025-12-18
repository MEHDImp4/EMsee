export const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    // Remove /api from end if present to get base URL
    const baseUrl = apiUrl.replace(/\/api$/, '');
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};
