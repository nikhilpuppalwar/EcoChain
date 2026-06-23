import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import api from '../lib/api';

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isLoading: false,

            // Login action
            login: async (credentials) => {
                set({ isLoading: true });
                try {
                    const response = await api.post('/auth/login', credentials);
                    const { user, accessToken } = response.data;

                    set({ user, accessToken, isAuthenticated: true, isLoading: false });
                    return { user, accessToken };
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            // Register action
            register: async (endpoint, data) => {
                set({ isLoading: true });
                try {
                    // If sending form data (files) vs json
                    const isFormData = data instanceof FormData;
                    const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};

                    const response = await api.post(endpoint, data, config);
                    set({ isLoading: false });
                    return response.data;
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            // Logout action
            logout: async () => {
                try {
                    await api.post('/auth/logout');
                } catch (e) {
                    // Ignored on client side — always clear state and redirect
                } finally {
                    set({ user: null, accessToken: null, isAuthenticated: false });
                    // Use replace() so the logged-out page isn't in browser history
                    window.location.replace('/login');
                }
            },

            // Refresh Token
            refreshToken: async () => {
                try {
                    // With credentials attached, backend checks httpOnly cookie
                    const response = await axios.post(
                        `${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}/auth/refresh`,
                        {},
                        { withCredentials: true }
                    );

                    set({ accessToken: response.data.accessToken });
                    return response.data;
                } catch (error) {
                    get().logout();
                    throw error;
                }
            },

            // Update User State (e.g. after profile update)
            setUser: (user) => set({ user }),
        }),
        {
            name: 'ecochain-auth', // localStorage key
            partialize: (state) => ({ accessToken: state.accessToken, user: state.user, isAuthenticated: state.isAuthenticated }), // Only save these
        }
    )
);
