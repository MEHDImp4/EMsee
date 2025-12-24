
// Hardcode 5001 to ensure connection stability
export const BASE_URL = 'http://localhost:5001';
export const API_URL = `${BASE_URL}/api`;

/**
 * Generic API request handler
 * @param {string} endpoint - The API endpoint (e.g., '/auth/login')
 * @param {object} options - Fetch options (method, body, headers)
 * @returns {Promise<any>} - JSON response
 */
async function request(endpoint, options = {}) {
    // Set default headers
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // Add Authorization header if token exists
    const token = localStorage.getItem('token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers,
    };

    // Handle body parsing
    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
        config.body = JSON.stringify(config.body);
    }

    // Allow FormData to set its own Content-Type (by removing it if it's explicitly set to application/json)
    if (options.body instanceof FormData) {
        delete headers['Content-Type'];
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);

        if (response.status === 401) {
            console.warn('Unauthorized access - logging out');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.reload();
            return;
        }

        const contentType = response.headers.get('content-type') || '';
        let data;

        if (contentType.includes('application/json')) {
            data = await response.json();
        } else {
            const text = await response.text();
            if (!response.ok) {
                throw new Error(text || 'API Error');
            }
            return text;
        }

        if (!response.ok) {
            throw new Error(data?.error || data?.message || 'API Error');
        }

        return data;
    } catch (error) {
        console.error('API Request Failed:', error);
        throw error;
    }
}

export default {
    get: (endpoint) => request(endpoint, { method: 'GET' }),
    post: (endpoint, body) => request(endpoint, { method: 'POST', body }),
    put: (endpoint, body) => request(endpoint, { method: 'PUT', body }),
    delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
    patch: (endpoint, body) => request(endpoint, { method: 'PATCH', body }),
};
