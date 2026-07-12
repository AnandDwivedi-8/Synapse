import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:8000/api/v1',
    withCredentials: true
});

// Add request/response logging
API.interceptors.request.use(
    config => {
        // Ensure withCredentials is true for all requests (sends cookies automatically)
        config.withCredentials = true;
        
        // Don't set Content-Type for FormData - let axios/browser set it automatically with boundary
        if (!(config.data instanceof FormData)) {
            config.headers['Content-Type'] = 'application/json';
        }
        
        // Add token from localStorage as fallback for Authorization header
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('📤 [API REQUEST] Adding Bearer token to Authorization header');
        }
        
        console.log('📤 [API REQUEST]', config.method.toUpperCase(), config.url, 'withCredentials:', config.withCredentials);
        return config;
    },
    error => {
        console.error('📤 [API REQUEST ERROR]', error);
        return Promise.reject(error);
    }
);

API.interceptors.response.use(
    response => {
        console.log('📥 [API RESPONSE]', response.status, response.config.url);
        return response;
    },
    error => {
        console.error('📥 [API RESPONSE ERROR]', error.response?.status, error.config?.url, error.message);
        return Promise.reject(error);
    }
);

export default API;


