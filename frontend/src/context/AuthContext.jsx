import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import Loading from '../components/Loading';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Configure Axios default base URL
    axios.defaults.baseURL = API_URL;

    useEffect(() => {
        // Check if user is logged in (e.g., check localStorage)
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const res = await axios.post('/api/auth/login', { email, password });
            setUser(res.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            // Store token
            localStorage.setItem('token', res.data.token);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
    };

    const register = async (username, email, password) => {
        try {
            const res = await axios.post('/api/auth/register', { username, email, password });
            setUser(res.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            localStorage.setItem('token', res.data.token);
            return { success: true };
        } catch (error) {
            console.error("Registration Error:", error);
            const msg = error.response?.data?.message || error.message || 'Registration failed';
            return { success: false, message: msg };
        }
    };

    const updateUser = async (data) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put('/api/auth/update', data, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Merge new data with existing user state including role/id which might not be in response if sparse
            // Actually controller returns full user minus password
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
            return { success: true };
        } catch (error) {
            console.error("Update Profile Error:", error);
            return { success: false, message: error.response?.data?.message || 'Update failed' };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, updateUser, loading }}>
            {loading ? <Loading fullScreen={true} text="Initializing..." /> : children}
        </AuthContext.Provider>
    );
};
