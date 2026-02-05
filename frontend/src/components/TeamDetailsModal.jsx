import { useState } from 'react';
import { X, Shield, UserPlus, Trash2, Crown } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function TeamDetailsModal({ team, onClose, onUpdate }) {
    const { user } = useAuth();
    const [addUsername, setAddUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isCaptain = user && team.captain && user._id === team.captain._id;

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
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to remove member');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg relative shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex items-start justify-between">
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

                {/* Content */}
                <div className="p-6">
                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Add Member Form (Captain Only) */}
                    {isCaptain && (
                        <form onSubmit={handleAddMember} className="mb-8 p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                            <h3 className="text-sm font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                                <UserPlus size={14} /> Add Member
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
                                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
                                >
                                    {loading ? 'Adding...' : 'Add'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Roster List */}
                    <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Team Roster ({team.members.length})</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        {team.members.map((member) => (
                            <div key={member._id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
                                        {member.avatar ? (
                                            <img src={member.avatar} alt={member.username} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="font-bold text-xs text-slate-400">{member.username[0]}</span>
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
