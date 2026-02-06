import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { X, Send, Minus, Maximize2 } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';

const socket = io(API_URL, { autoConnect: false });

export default function PrivateChatWindow({ currentUser, recipient, onClose }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isMinimized, setIsMinimized] = useState(false);
    const messagesEndRef = useRef(null);

    // Create a unique room ID for these two users
    // Sort IDs to ensure same room ID regardless of who initiates
    const roomId = `private-${[currentUser._id, recipient._id].sort().join('-')}`;

    useEffect(() => {
        socket.connect();
        socket.emit('join-room', roomId);

        const fetchHistory = async () => {
            try {
                const res = await axios.get(`/api/chat/${roomId}`, {
                    headers: { 'x-auth-token': localStorage.getItem('token') }
                });
                setMessages(res.data);
            } catch (err) {
                console.error("Failed to fetch private chat history", err);
            }
        };

        fetchHistory();

        const handleReceiveMessage = (data) => {
            if (data.roomId === roomId) {
                setMessages(prev => [...prev, data]);
            }
        };

        socket.on('receive-message', handleReceiveMessage);

        return () => {
            socket.off('receive-message', handleReceiveMessage);
            socket.disconnect();
        };
    }, [roomId]);

    useEffect(() => {
        if (!isMinimized) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isMinimized]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const messageData = {
            roomId,
            sender: currentUser.username,
            senderId: currentUser._id,
            text: newMessage,
            type: 'text',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: new Date().toISOString()
        };

        socket.emit('send-message', messageData);
        setMessages(prev => [...prev, messageData]);
        setNewMessage('');
    };

    if (isMinimized) {
        return (
            <div className="fixed bottom-0 right-80 w-64 bg-slate-900 border border-slate-700 rounded-t-lg shadow-xl z-50">
                <div
                    className="flex items-center justify-between p-3 bg-slate-800 rounded-t-lg cursor-pointer hover:bg-slate-700 transition-colors"
                    onClick={() => setIsMinimized(false)}
                >
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <img
                                src={recipient.avatar || `https://ui-avatars.com/api/?name=${recipient.username}&background=random`}
                                alt={recipient.username}
                                className="w-6 h-6 rounded-full"
                            />
                            <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-slate-800"></span>
                        </div>
                        <span className="font-bold text-sm text-white truncate">{recipient.username}</span>
                    </div>
                    <div className="flex gap-1">
                        <button onClick={(e) => { e.stopPropagation(); setIsMinimized(false); }} className="text-slate-400 hover:text-white p-1">
                            <Maximize2 size={14} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="text-slate-400 hover:text-red-400 p-1">
                            <X size={14} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed bottom-0 right-80 w-80 h-96 bg-slate-900 border border-slate-700 rounded-t-lg shadow-2xl z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-3 bg-slate-800 rounded-t-lg border-b border-slate-700">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <img
                            src={recipient.avatar || `https://ui-avatars.com/api/?name=${recipient.username}&background=random`}
                            alt={recipient.username}
                            className="w-8 h-8 rounded-full"
                        />
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-slate-800"></span>
                    </div>
                    <div>
                        <h4 className="font-bold text-sm text-white leading-tight">{recipient.username}</h4>
                        <span className="text-[10px] text-green-400">Online</span>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setIsMinimized(true)}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                    >
                        <Minus size={16} />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-950/50 custom-scrollbar">
                {messages.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 text-xs">
                        <p>Start chatting with {recipient.username}!</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMe = msg.sender === currentUser.username;
                        return (
                            <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                <div
                                    className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${isMe
                                            ? 'bg-cyan-600 text-white rounded-br-none'
                                            : 'bg-slate-800 text-slate-200 rounded-bl-none'
                                        }`}
                                >
                                    {msg.text}
                                </div>
                                <span className="text-[10px] text-slate-600 mt-1 px-1">
                                    {msg.time}
                                </span>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-3 bg-slate-800 border-t border-slate-700">
                <div className="relative">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-full py-2 pl-4 pr-10 text-sm text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 placeholder:text-slate-500"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="absolute right-1 top-1 p-1.5 bg-cyan-600 text-white rounded-full hover:bg-cyan-500 disabled:opacity-50 disabled:hover:bg-cyan-600 transition-colors"
                    >
                        <Send size={14} />
                    </button>
                </div>
            </form>
        </div>
    );
}
