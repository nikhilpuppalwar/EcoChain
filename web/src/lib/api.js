import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
    withCredentials: true, // Need this for sending/receiving refresh token cookies
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor: Attach access token
api.interceptors.request.use(
    (config) => {
        const { accessToken } = useAuthStore.getState();
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 and refresh access token
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Avoid infinite loop if refresh token itself fails
        if (originalRequest.url === '/auth/refresh') {
            useAuthStore.getState().logout();
            return Promise.reject(error);
        }

        // Check if error is 401 and we haven't already retried
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const { refreshToken } = useAuthStore.getState();
                const response = await refreshToken();

                // Update header for current request with new token
                originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;

                return api(originalRequest);
            } catch (refreshError) {
                useAuthStore.getState().logout();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
