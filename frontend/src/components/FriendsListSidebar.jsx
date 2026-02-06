import { useState, useEffect } from 'react';

import { Users, UserPlus, X, Check, MessageSquare, MoreVertical, UserX, Ban } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import PrivateChatWindow from './PrivateChatWindow';

import { FriendApi } from '../api/allApi';

export default function FriendsListSidebar({ className = "" }) {
    const { user } = useAuth();
    const [friends, setFriends] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('friends'); // 'friends' or 'requests'

    // Track which friend we are chatting with
    const [activeChatFriend, setActiveChatFriend] = useState(null);

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user, activeTab]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [friendsRes, requestsRes] = await Promise.all([
                FriendApi.getList(),
                FriendApi.getRequests()
            ]);
            setFriends(friendsRes.data);
            setRequests(requestsRes.data);
        } catch (err) {
            console.error("Failed to fetch friends data", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (requestId) => {
        try {
            await FriendApi.acceptRequest(requestId);
            fetchData(); // Refresh both lists
            toast.success('Friend request accepted');
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to accept");
        }
    };

    const handleReject = async (requestId) => {
        try {
            await FriendApi.rejectRequest(requestId);
            fetchData(); // Refresh list
            toast.success('Friend request rejected');
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to reject");
        }
    };

    const [activeDropdown, setActiveDropdown] = useState(null);

    const handleUnfriend = async (friendId) => {
        try {
            await FriendApi.removeFriend(friendId);
            fetchData();
            setActiveDropdown(null);
            toast.success('Unfriended successfully');
        } catch (err) {
            toast.error("Failed to unfriend");
        }
    };

    const handleBlock = async (friendId) => {
        try {
            await FriendApi.blockUser(friendId);
            fetchData();
            setActiveDropdown(null);
            toast.success('User blocked');
        } catch (err) {
            toast.error("Failed to block user");
        }
    };

    if (!user) return null;

    return (
        <div className={`bg-slate-900 border-l border-slate-800 w-80 flex flex-col h-full ${className}`}>
            <div className="p-4 border-b border-slate-800">
                <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                    <Users className="text-cyan-400" size={20} /> Social
                </h2>
                <div className="flex bg-slate-800 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('friends')}
                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'friends'
                            ? 'bg-slate-700 text-white shadow'
                            : 'text-slate-400 hover:text-slate-200'
                            }`}
                    >
                        Friends ({friends.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${activeTab === 'requests'
                            ? 'bg-slate-700 text-white shadow'
                            : 'text-slate-400 hover:text-slate-200'
                            }`}
                    >
                        Requests
                        {requests.length > 0 && (
                            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                {requests.length}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center gap-3 animate-pulse">
                                <div className="w-10 h-10 bg-slate-800 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-slate-800 rounded w-24" />
                                    <div className="h-3 bg-slate-800 rounded w-16" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : activeTab === 'friends' ? (
                    <div className="space-y-4">
                        {friends.length === 0 ? (
                            <div className="text-center text-slate-500 py-8">
                                <Users size={32} className="mx-auto mb-2 opacity-50" />
                                <p>No friends yet</p>
                            </div>
                        ) : (
                            friends.map(friend => (
                                <div key={friend._id} className="relative flex items-center gap-3 p-2 hover:bg-slate-800/50 rounded-lg transition-colors group">
                                    <div className="relative">
                                        <img
                                            src={friend.avatar || `https://ui-avatars.com/api/?name=${friend.username}&background=0D8ABC&color=fff`}
                                            alt={friend.username}
                                            className="w-10 h-10 rounded-full object-cover border border-slate-700"
                                        />
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full" title="Online" />
                                    </div>
                                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setActiveChatFriend(friend)}>
                                        <p className="font-medium text-slate-200 truncate">{friend.username}</p>
                                        <p className="text-xs text-slate-500 truncate">{friend.tagLine || 'Playing Valorant'}</p>
                                    </div>

                                    <div className="flex items-center">
                                        <button
                                            onClick={() => setActiveChatFriend(friend)}
                                            className="text-slate-500 hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity p-2"
                                            title="Message"
                                        >
                                            <MessageSquare size={16} />
                                        </button>
                                        <button
                                            onClick={() => setActiveDropdown(activeDropdown === friend._id ? null : friend._id)}
                                            className="text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity p-2"
                                            title="More options"
                                        >
                                            <MoreVertical size={16} />
                                        </button>
                                    </div>

                                    {/* Dropdown Menu */}
                                    {activeDropdown === friend._id && (
                                        <div className="absolute right-0 top-12 w-32 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
                                            <button
                                                onClick={() => handleUnfriend(friend._id)}
                                                className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-2"
                                            >
                                                <UserX size={14} /> Unfriend
                                            </button>
                                            <button
                                                onClick={() => handleBlock(friend._id)}
                                                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700 hover:text-red-300 flex items-center gap-2"
                                            >
                                                <Ban size={14} /> Block
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {requests.length === 0 ? (
                            <div className="text-center text-slate-500 py-8">
                                <UserPlus size={32} className="mx-auto mb-2 opacity-50" />
                                <p>No pending requests</p>
                            </div>
                        ) : (
                            requests.map(req => (
                                <div key={req._id} className="bg-slate-800/50 p-3 rounded-xl border border-slate-800">
                                    <div className="flex items-center gap-3 mb-3">
                                        <img
                                            src={req.sender.avatar || `https://ui-avatars.com/api/?name=${req.sender.username}&background=random`}
                                            alt={req.sender.username}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                        <div>
                                            <p className="font-bold text-sm text-slate-200">{req.sender.username}</p>
                                            <p className="text-xs text-slate-500">Sent a friend request</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleAccept(req._id)}
                                            className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
                                        >
                                            <Check size={14} /> Accept
                                        </button>
                                        <button
                                            onClick={() => handleReject(req._id)}
                                            className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
                                        >
                                            <X size={14} /> Reject
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Private Chat Window */}
            {activeChatFriend && (
                <PrivateChatWindow
                    currentUser={user}
                    recipient={activeChatFriend}
                    onClose={() => setActiveChatFriend(null)}
                />
            )}
        </div>
    );
}
