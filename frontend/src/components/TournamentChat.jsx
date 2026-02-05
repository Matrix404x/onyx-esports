import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { Send, MessageSquare, User, MoreVertical, ChevronDown, ChevronUp } from 'lucide-react';
import UserPopover from '../components/UserPopover';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

// Reusing the socket instance or creating a new one properly
// For a production app, this should be in a Context or Hook to share the connection
const socket = io(API_URL, { autoConnect: false });

export default function TournamentChat({ tournamentId }) {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isOpen, setIsOpen] = useState(true); // Toggle for mobile/optional view
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!tournamentId) return;

        const fetchHistory = async () => {
            try {
                const res = await axios.get(`/api/chat/${tournamentId}`, {
                    headers: { 'x-auth-token': localStorage.getItem('token') }
                });
                setMessages(res.data);
            } catch (err) {
                console.error("Failed to load chat history", err);
            }
        };
        fetchHistory();

        socket.connect();
        socket.emit('join-room', tournamentId);

        const handleReceiveMessage = (data) => {
            setMessages((prev) => [...prev, data]);
        };

        socket.on('receive-message', handleReceiveMessage);

        return () => {
            socket.off('receive-message', handleReceiveMessage);
            socket.disconnect();
        };
    }, [tournamentId]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;

        const messageData = {
            roomId: tournamentId,
            sender: user.username || 'Guest',
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
            const res = await axios.post('/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const messageData = {
                roomId: tournamentId,
                sender: user.username || 'Guest',
                senderId: user.id,
                text: '',
                type: res.data.type,
                mediaUrl: res.data.url,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                timestamp: new Date().toISOString()
            };

            socket.emit('send-message', messageData);
            setMessages((prev) => [...prev, messageData]);
        } catch (err) {
            console.error("Upload failed", err);
        }
    };

    const [isCollapsed, setIsCollapsed] = useState(false); // Default expanded

    // ... (keep existing useEffects)

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div className={`bg-slate-900 border border-slate-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden relative group transition-all duration-300 ${isCollapsed ? 'h-16' : 'h-[600px]'}`}>
            {/* Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm flex justify-between items-center sticky top-0 z-10 cursor-pointer" onClick={toggleCollapse}>
                <h3 className="font-bold flex items-center gap-2 text-white">
                    <MessageSquare size={18} className="text-cyan-400" />
                    Live Chat
                    <span className="flex h-2 w-2 relative ml-1">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                    </span>
                </h3>
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); toggleCollapse(); }}
                        className="text-slate-500 hover:text-white transition-colors p-1 rounded-full hover:bg-slate-800"
                    >
                        {isCollapsed ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                    <button className="text-slate-500 hover:text-white transition-colors hidden md:block">
                        <MoreVertical size={16} />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
                        <MessageSquare size={48} className="mb-2 opacity-50" />
                        <p className="text-sm">Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMe = msg.sender === user?.username;

                        return (
                            <div key={idx} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''} animate-fade-in`}>

                                {/* Avatar */}
                                <UserPopover userId={msg.senderId} username={msg.sender}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${isMe ? 'bg-cyan-900 border-cyan-700 text-cyan-200' : 'bg-slate-800 border-slate-700 text-slate-400'} shrink-0 cursor-pointer hover:border-cyan-500 transition-colors`}>
                                        {msg.sender[0].toUpperCase()}
                                    </div>
                                </UserPopover>

                                {/* Message Bubble */}
                                <div className={`flex flex-col max-w-[80%] ${isMe ? 'items-end' : 'items-start'}`}>
                                    <div className="flex items-baseline gap-2 mb-1">
                                        <UserPopover userId={msg.senderId} username={msg.sender}>
                                            <span className={`text-xs font-bold cursor-pointer hover:underline ${isMe ? 'text-cyan-400' : 'text-slate-300'}`}>
                                                {msg.sender}
                                            </span>
                                        </UserPopover>
                                        <span className="text-[10px] text-slate-600">{msg.time}</span>
                                    </div>

                                    {/* Media Content */}
                                    {msg.type === 'image' && (
                                        <div className="mb-2 rounded-xl overflow-hidden border border-slate-700">
                                            <img src={msg.mediaUrl} alt="Shared" className="w-full h-auto" />
                                        </div>
                                    )}
                                    {msg.type === 'video' && (
                                        <div className="mb-2 rounded-xl overflow-hidden border border-slate-700">
                                            <video src={msg.mediaUrl} controls className="w-full h-auto" />
                                        </div>
                                    )}

                                    {/* Text Content */}
                                    {msg.text && (
                                        <div className={`px-4 py-2 text-sm rounded-2xl shadow-sm ${isMe
                                            ? 'bg-gradient-to-br from-cyan-600 to-blue-600 text-white rounded-tr-none'
                                            : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none'
                                            }`}>
                                            {msg.text}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/80 backdrop-blur-md">
                {user ? (
                    <form onSubmit={sendMessage} className="relative">
                        <input
                            type="file"
                            id="tournamentFileInput"
                            className="hidden"
                            onChange={handleFileUpload}
                            accept="image/*,video/*"
                        />
                        <button
                            type="button"
                            onClick={() => document.getElementById('tournamentFileInput').click()}
                            className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <div className="w-5 h-5 bg-slate-700/50 border border-slate-600 rounded-full flex items-center justify-center text-xs font-bold pb-0.5">+</div>
                        </button>

                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Send a message..."
                            className="w-full bg-slate-900/50 border border-slate-700 text-slate-200 text-sm rounded-xl pl-10 pr-12 py-3 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-slate-600"
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-all disabled:opacity-0 disabled:scale-75 shadow-lg shadow-cyan-500/20"
                        >
                            <Send size={16} />
                        </button>
                    </form>
                ) : (
                    <div className="text-center">
                        <p className="text-xs text-slate-500 mb-2">Log in to chat</p>
                    </div>
                )}
            </div>

            {/* Background Decorative Gradient */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-slate-950/20 z-0" />
        </div>
    );
}

// Add this to your tailwind config or global css for animation if not present
// @keyframes fade-in {
//   from { opacity: 0; transform: translateY(5px); }
//   to { opacity: 1; transform: translateY(0); }
// }
// .animate-fade-in {
//   animation: fade-in 0.2s ease-out forwards;
// }
