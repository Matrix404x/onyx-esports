import { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, UserCheck, Clock, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function FriendRequestButton({ targetUserId }) {
    const { user } = useAuth();
    const [status, setStatus] = useState('none'); // none, pending, friend, received
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !targetUserId) return;
        checkStatus();
    }, [user, targetUserId]);

    const checkStatus = () => {
        // We can determine status by checking our own user object if it's up to date, 
        // or passing status as prop. But for now let's assume we need to derive it.
        // If we want real-time accuracy we might valid against checking the target user 
        // OR rely on our 'user' context being refreshed.

        // Simpler approach: Check our friends list and sent requests?
        // But we don't store "sent requests" easily on frontend unless we fetch them into context.
        // Let's rely on Props or just fetch specific status if needed. 
        // Actually, easiest is to just try to add and handle error, or fetch user details.

        // BETTER: When visiting a profile, the profiles data usually contains if they are friend.
        // For now, let's implement the basic actions assuming we know the status or default to 'none'.
        // Let's fetch the friends list to check if friend.

        if (user.friends?.includes(targetUserId)) {
            setStatus('friend');
            setLoading(false);
            return;
        }

        // Check if we sent a request (requires fetching our sent requests? or checking target user?)
        // The backend `User` model stores received requests. 
        // So to know if I sent a request, I'd need to check the target user's requests.
        // This is a bit tricky without a specific "check-friendship" endpoint.

        // Let's add a "check status" logic here? Or just assume 'none' and let backend validation handle it.
        // For better UX, let's fetch 'friends' from API to be sure.

        // Temporary: just set loading false
        setLoading(false);
    };

    const sendRequest = async () => {
        setLoading(true);
        try {
            await axios.post(`/api/friends/request/${targetUserId}`, {}, {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            setStatus('pending');
            alert('Friend request sent!');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to send request');
        } finally {
            setLoading(false);
        }
    };

    if (!user || user._id === targetUserId) return null;

    // Helper to verify status via API if needed, but for now we trust local or just show "Add"
    // Ideally we pass "isFriend" prop.

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
