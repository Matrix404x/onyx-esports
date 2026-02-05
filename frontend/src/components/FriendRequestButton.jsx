import { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, UserCheck, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function FriendRequestButton({ targetUserId }) {
    const { user } = useAuth();
    const [status, setStatus] = useState('none'); // none, pending, friend, received
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !targetUserId) return;
        checkStatus();
    }, [user, targetUserId]);

    const checkStatus = () => {
        if (user.friends?.includes(targetUserId)) {
            setStatus('friend');
            setLoading(false);
            return;
        }
        setLoading(false);
    };

    const sendRequest = async () => {
        setLoading(true);
        try {
            await axios.post(`/api/friends/request/${targetUserId}`, {}, {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            setStatus('pending');
            toast.success('Friend request sent!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send request');
        } finally {
            setLoading(false);
        }
    };

    if (!user || user._id === targetUserId) return null;

    if (status === 'friend') {
        return (
            <button disabled className="px-4 py-2 bg-green-600/20 text-green-400 rounded-lg flex items-center gap-2 border border-green-600/50">
                <UserCheck size={18} /> Friends
            </button>
        );
    }

    if (status === 'pending') {
        return (
            <button disabled className="px-4 py-2 bg-yellow-600/20 text-yellow-400 rounded-lg flex items-center gap-2 border border-yellow-600/50">
                <Clock size={18} /> Request Sent
            </button>
        );
    }

    return (
        <button
            onClick={sendRequest}
            disabled={loading}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg flex items-center gap-2 transition-colors font-bold shadow-lg shadow-cyan-900/20"
        >
            <UserPlus size={18} /> Add Friend
        </button>
    );
}
