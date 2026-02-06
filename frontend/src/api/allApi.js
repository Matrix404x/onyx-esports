import axios from 'axios';
import { API_URL } from '../config';

// Create a configured axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add a request interceptor to inject the token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['x-auth-token'] = token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor (optional, for global error handling)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // You could handle 401 Unauthorized here (e.g., redirect to login)
        return Promise.reject(error);
    }
);



export const AuthApi = {
    register: (data) => api.post('/api/auth/register', data),
    login: (data) => api.post('/api/auth/login', data),
    updateProfile: (data) => api.put('/api/auth/update', data),
};

export const TournamentApi = {
    getAll: () => api.get('/api/tournaments'),
    getById: (id) => api.get(`/api/tournaments/${id}`),
    create: (data) => api.post('/api/tournaments', data),
    join: (id) => api.post(`/api/tournaments/${id}/join`),
};

export const TeamApi = {
    getAll: () => api.get('/api/teams'),
    create: (data) => api.post('/api/teams', data),
    update: (id, data) => api.put(`/api/teams/${id}`, data),
    delete: (id) => api.delete(`/api/teams/${id}`),
    addMember: (id, data) => api.post(`/api/teams/${id}/members`, data),
    removeMember: (id, userId) => api.delete(`/api/teams/${id}/members/${userId}`),
};

export const PlayerApi = {
    linkAccount: (data) => api.post('/api/player/link', data),
    getMyStats: () => api.get('/api/player/stats'),
    getProfile: (userId) => api.get(`/api/player/profile/${userId}`),
    search: (query) => api.get(`/api/player/search?q=${query}`),
};

export const FriendApi = {
    getList: () => api.get('/api/friends/list'),
    getRequests: () => api.get('/api/friends/requests'),
    sendRequest: (userId) => api.post(`/api/friends/request/${userId}`),
    acceptRequest: (requestId) => api.put(`/api/friends/accept/${requestId}`),
    rejectRequest: (requestId) => api.put(`/api/friends/reject/${requestId}`),
    removeFriend: (friendId) => api.delete(`/api/friends/remove/${friendId}`),
    blockUser: (userId) => api.post(`/api/friends/block/${userId}`),
};

export const ChatApi = {
    getHistory: (roomId) => api.get(`/api/chat/${roomId}`),
};

export const UploadApi = {
    uploadFile: (formData) => api.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

export const PaymentApi = {
    createIntent: (data) => api.post('/api/payments/create-payment-intent', data),
};

export const AdminApi = {
    getStats: () => api.get('/api/admin/stats'),
    getUsers: () => api.get('/api/admin/users'),
    deleteUser: (id) => api.delete(`/api/admin/users/${id}`),
    updateUserRole: (id, role) => api.put(`/api/admin/users/${id}/role`, { role }),
    getTournaments: () => api.get('/api/admin/tournaments'),
    deleteTournament: (id) => api.delete(`/api/admin/tournaments/${id}`),
};

export default api;
