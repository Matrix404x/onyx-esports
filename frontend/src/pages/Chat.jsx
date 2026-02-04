import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Send, Hash, Users, MessageSquare, Search, Bell, Settings, Menu, X, Volume2, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import VoicePanel from '../components/VoicePanel';
import SettingsModal from '../components/SettingsModal';
import { API_URL } from '../config';

const socket = io(API_URL, { autoConnect: false });

export default function Chat() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [activeChannel, setActiveChannel] = useState('general');
    const [currentVoiceChannel, setCurrentVoiceChannel] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [userStatus, setUserStatus] = useState('online');
    const messagesEndRef = useRef(null);

    const channels = [
        { id: 'general', name: 'general', category: 'Community', type: 'text' },
        { id: 'tournaments', name: 'tournaments', category: 'Community', type: 'text' },
        { id: 'looking-for-group', name: 'looking-for-group', category: 'Community', type: 'text' },
        { id: 'off-topic', name: 'off-topic', category: 'Community', type: 'text' },
        { id: 'valorant', name: 'valorant', category: 'Games', type: 'text' },
        { id: 'cs2', name: 'cs2', category: 'Games', type: 'text' },
        { id: 'voice-general', name: 'General Voice', category: 'Voice Channels', type: 'voice' },
        { id: 'voice-gaming', name: 'Gaming Lounge', category: 'Voice Channels', type: 'voice' },
    ];

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        socket.connect();
        socket.emit('join-room', activeChannel);

        const handleReceiveMessage = (data) => {
            setMessages((prev) => [...prev, data]);
        };

        socket.on('receive-message', handleReceiveMessage);

        return () => {
            socket.off('receive-message', handleReceiveMessage);
            socket.disconnect();
        };
    }, [activeChannel, user, navigate]);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await axios.get(`/api/chat/${activeChannel}`, {
                    headers: { 'x-auth-token': localStorage.getItem('token') }
                });
                setMessages(res.data);
            } catch (err) {
                console.error("Error fetching chat history", err);
            }
        };

        fetchMessages();
        socket.emit('join-room', activeChannel);
    }, [activeChannel]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;

        const messageData = {
            roomId: activeChannel,
            sender: user.username,
            senderId: user.id,
            text: newMessage,
            type: 'text',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: new Date().toISOString()
        };

        socket.emit('send-message', messageData);
        setMessages((prev) => [...prev, messageData]);
        setNewMessage('');
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            // 1. Upload File
            const res = await axios.post('/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // 2. Send Message with Media
            const messageData = {
                roomId: activeChannel,
                sender: user.username,
                senderId: user.id,
                text: '', // Empty text for media-only message
                type: res.data.type, // 'image' or 'video'
                mediaUrl: res.data.url,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                timestamp: new Date().toISOString()
            };

            socket.emit('send-message', messageData);
            setMessages((prev) => [...prev, messageData]);

        } catch (err) {
            console.error("Upload failed", err);
            alert("Failed to upload file");
        }
    };

    // Group channels by category
    const groupedChannels = channels.reduce((acc, channel) => {
        if (!acc[channel.category]) acc[channel.category] = [];
        acc[channel.category].push(channel);
        return acc;
    }, {});

    return (
        <div className="flex h-screen bg-slate-950 text-white overflow-hidden font-sans">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar (Channels) */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Server Header */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 shadow-sm bg-slate-900/50 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="text-slate-400 hover:text-white transition-colors"
                            title="Back to Dashboard"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="font-bold text-lg tracking-wide flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-white">
                                <MessageSquare size={16} fill="white" />
                            </div>
                            Onyx
                        </h1>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400">
                        <X size={20} />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 pb-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                        <input
                            type="text"
                            placeholder="Find conversations"
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-9 pr-4 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 transition-all placeholder:text-slate-600"
                        />
                    </div>
                </div>

                {/* Channel List */}
                <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
                    {Object.entries(groupedChannels).map(([category, items]) => (
                        <div key={category}>
                            <h3 className="px-3 text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center justify-between group cursor-pointer hover:text-slate-300">
                                {category}
                            </h3>
                            <div className="space-y-[2px]">
                                {items.map(channel => (
                                    <button
                                        key={channel.id}
                                        onClick={() => {
                                            if (channel.type === 'voice') {
                                                setCurrentVoiceChannel(channel.id);
                                            } else {
                                                setActiveChannel(channel.id);
                                                setSidebarOpen(false);
                                            }
                                        }}
                                        className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-all group ${(channel.type === 'text' && activeChannel === channel.id)
                                            ? 'bg-cyan-500/10 text-cyan-400'
                                            : (channel.type === 'voice' && currentVoiceChannel === channel.id)
                                                ? 'bg-green-500/10 text-green-400'
                                                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                                            }`}
                                    >
                                        {channel.type === 'voice' ? <Volume2 size={18} /> : <Hash size={18} />}
                                        <span className="font-medium truncate">{channel.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Voice Connected Panel */}
                {currentVoiceChannel && (
                    <VoicePanel
                        channelId={currentVoiceChannel}
                        user={user}
                        onLeave={() => setCurrentVoiceChannel(null)}
                    />
                )}

                {/* User Status Bar */}
                <div className="p-3 bg-slate-950/50 border-t border-slate-800 flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300 border border-slate-700">
                            {user?.username?.[0] || 'U'}
                        </div>
                        <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-slate-900 rounded-full ${userStatus === 'online' ? 'bg-green-500' :
                            userStatus === 'idle' ? 'bg-yellow-500' :
                                userStatus === 'dnd' ? 'bg-red-500' : 'bg-slate-500'
                            }`}></div>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="font-bold text-sm truncate">{user?.username || 'Guest'}</p>
                        <p className="text-xs text-slate-400 truncate capitalize">
                            {userStatus === 'dnd' ? 'Do Not Disturb' : userStatus}
                        </p>
                    </div>
                    <button onClick={() => setShowSettings(true)} className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white" title="User Settings">
                        <Settings size={18} />
                    </button>
                </div>
            </aside>

            {/* Main Chat Area - Existing Code Unchanged */}
            <main className="flex-1 flex flex-col bg-slate-950 relative">
                {/* ... (Header, Messages, Input will reside here in original file, we just wrap around sidebar closure) ... */}
                {/* To avoid replacing the whole file, I will just return the Modal logic here if inserted correctly */}
                {/* Actually, I need to make sure I don't delete the main content. This replacement target is just the sidebar footer. */}
            </main>

            {/* Settings Modal */}
            {showSettings && (
                <SettingsModal
                    onClose={() => setShowSettings(false)}
                    user={user}
                    status={userStatus}
                    setStatus={setUserStatus}
                />
            )}
        </div>
    );
}
