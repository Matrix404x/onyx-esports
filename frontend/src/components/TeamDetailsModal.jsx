import { useState, useEffect } from 'react';
import { X, Shield, UserPlus, Trash2, Crown, Check, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function TeamDetailsModal({ team, onClose, onUpdate }) {
    const { user } = useAuth();
    const [addUsername, setAddUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [joinLoading, setJoinLoading] = useState(false);
    const [joinRequests, setJoinRequests] = useState([]);

    const isCaptain = user && team.captain && user._id === team.captain._id;
    const isMember = user && team.members.some(m => m._id === user._id);
    const isAdmin = user && user.role === 'admin';

    useEffect(() => {
        if ((isCaptain || isAdmin) && team._id) {
            fetchJoinRequests();
        }
    }, [team._id, isCaptain, isAdmin]);

    const fetchJoinRequests = async () => {
        try {
            const res = await axios.get(`/api/teams/${team._id}/requests`, {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            setJoinRequests(res.data);
        } catch (err) {
            console.error("Failed to fetch requests", err);
        }
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        if (!addUsername.trim()) return;

        setLoading(true);
        setError('');

        try {
            const res = await axios.post(
                `/api/teams/${team._id}/members`,
                { username: addUsername },
                { headers: { 'x-auth-token': localStorage.getItem('token') } }
            );
            onUpdate(res.data);
            setAddUsername('');
            toast.success("Member added!");
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add member');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveMember = async (memberId) => {
        if (!window.confirm('Remove this member?')) return;

        try {
            const res = await axios.delete(
                `/api/teams/${team._id}/members/${memberId}`,
                { headers: { 'x-auth-token': localStorage.getItem('token') } }
            );
            onUpdate(res.data);
            toast.success("Member removed");
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to remove member');
        }
    };

    const handleJoinTeam = async () => {
        setJoinLoading(true);
        try {
            const res = await axios.post(
                `/api/teams/${team._id}/join`,
                {},
                { headers: { 'x-auth-token': localStorage.getItem('token') } }
            );
            toast.success(res.data.message || "Join request sent!");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to send request");
        } finally {
            setJoinLoading(false);
        }
    };

    const handleRequestAction = async (userId, action) => {
        try {
            const res = await axios.post(
                `/api/teams/${team._id}/requests/handle`,
                { userId, action },
                { headers: { 'x-auth-token': localStorage.getItem('token') } }
            );

            if (res.data.team) {
                onUpdate(res.data.team);
            }

            setJoinRequests(joinRequests.filter(req => req._id !== userId));
            toast.success(action === 'accept' ? "Request Accepted" : "Request Rejected");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to handle request");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg relative shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex items-start justify-between flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700">
                            {team.logo ? (
                                <img src={team.logo} alt={team.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-2xl font-bold text-slate-500">{team.tag}</span>
                            )}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                {team.name}
                                <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700 font-bold">{team.tag}</span>
                            </h2>
                            <p className="text-sm text-slate-400 flex items-center gap-1 mt-1">
                                <Shield size={12} className="text-cyan-400" />
                                Captain: <span className="text-cyan-400">{team.captain?.username || 'Unknown'}</span>
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Pending Requests (Captain Only) */}
                    {(isCaptain || isAdmin) && joinRequests.length > 0 && (
                        <div className="mb-6 p-4 bg-slate-950/50 rounded-xl border border-yellow-500/20">
                            <h3 className="text-sm font-bold text-yellow-500 uppercase mb-3 flex items-center gap-2">
                                <AlertCircle size={14} /> Pending Requests ({joinRequests.length})
                            </h3>
                            <div className="space-y-2">
                                {joinRequests.map(req => (
                                    <div key={req._id} className="flex items-center justify-between p-2 bg-slate-900 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 overflow-hidden">
                                                {req.avatar ? <img src={req.avatar} className="w-full h-full object-cover" /> : <span className="text-xs">{req.username[0]}</span>}
                                            </div>
                                            <span className="text-sm font-medium">{req.username}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleRequestAction(req._id, 'accept')} className="p-1.5 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition">
                                                <Check size={16} />
                                            </button>
                                            <button onClick={() => handleRequestAction(req._id, 'reject')} className="p-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition">
                                                <X size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Join Button (Non-Members) */}
                    {!isMember && !isCaptain && (
                        <div className="mb-6">
                            <button
                                onClick={handleJoinTeam}
                                disabled={joinLoading}
                                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-900/20 transition-all flex items-center justify-center gap-2"
                            >
                                {joinLoading ? 'Sending...' : 'Request to Join Team'}
                            </button>
                            <p className="text-center text-xs text-slate-500 mt-2">
                                The captain will review your request.
                            </p>
                        </div>
                    )}

                    {/* Add Member Form (Captain Only) */}
                    {isCaptain && (
                        <form onSubmit={handleAddMember} className="mb-8 p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                            <h3 className="text-sm font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                                <UserPlus size={14} /> Add Member Direct
                            </h3>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={addUsername}
                                    onChange={(e) => setAddUsername(e.target.value)}
                                    placeholder="Enter username..."
                                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                                />
                                <button
                                    type="submit"
                                    disabled={loading || !addUsername.trim()}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-bold rounded-lg transition-colors border border-slate-700"
                                >
                                    {loading ? 'Adding...' : 'Add'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Roster List */}
                    <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Team Roster ({team.members.length})</h3>
                    <div className="space-y-2">
                        {team.members.map((member) => (
                            <div key={member._id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
                                        {member.avatar ? (
                                            <img src={member.avatar} alt={member.username} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="font-bold text-xs text-slate-400">{member.username?.[0]}</span>
                                        )}
                                    </div>
                                    <span className="font-medium text-white">
                                        {member.username}
                                        {team.captain?._id === member._id && (
                                            <Crown size={14} className="inline ml-2 text-yellow-400" fill="currentColor" />
                                        )}
                                    </span>
                                </div>

                                {isCaptain && team.captain?._id !== member._id && (
                                    <button
                                        onClick={() => handleRemoveMember(member._id)}
                                        className="text-slate-500 hover:text-red-400 p-1 rounded transition-colors"
                                        title="Remove Member"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
