import { useState, useEffect } from 'react';
import { ArrowLeft, Users, Plus, Trash2, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import SpotlightCard from '../components/ui/SpotlightCard';
import CreateTeamModal from '../components/CreateTeamModal';
import TeamDetailsModal from '../components/TeamDetailsModal';

export default function Teams() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [teams, setTeams] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchTeams = async () => {
        try {
            const res = await axios.get('/api/teams');
            setTeams(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTeam = (newTeam) => {
        setTeams([...teams, newTeam]);
    };



    useEffect(() => {
        fetchTeams();
    }, []);

    const handleDeleteTeam = async (teamId) => {
        if (!window.confirm('Are you sure you want to delete this team?')) return;
        try {
            await axios.delete(`/api/teams/${teamId}`, {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            setTeams(teams.filter(t => t._id !== teamId));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete team');
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 md:p-8 pt-24">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <Users className="text-cyan-400" /> Teams
                        </h1>
                        <p className="text-slate-400">Discover and join elite esports teams.</p>
                    </div>
                    {user && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg shadow-cyan-900/20"
                        >
                            <Plus size={18} /> Create Team
                        </button>
                    )}
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => <div key={i} className="h-48 bg-slate-900/50 animate-pulse rounded-2xl" />)}
                    </div>
                ) : teams.length === 0 ? (
                    <div className="text-center py-20 text-slate-500">
                        <Users size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="text-xl">No teams found yet.</p>
                        <p>Be the first to create one!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {teams.map(team => (
                            <SpotlightCard key={team._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col h-full group">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-16 h-16 rounded-xl bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700">
                                        {team.logo ? (
                                            <img src={team.logo} alt={team.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-2xl font-bold text-slate-500">{team.tag}</span>
                                        )}
                                    </div>
                                    {/* Permission Check: Admin OR Captain */}
                                    {user && (user.role === 'admin' || user._id === team.captain?._id) && (
                                        <button
                                            onClick={() => handleDeleteTeam(team._id)}
                                            className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                            title="Delete Team"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>

                                <h3 className="text-xl font-bold mb-1 group-hover:text-cyan-400 transition-colors">{team.name}</h3>
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="bg-slate-800 text-xs font-bold px-2 py-0.5 rounded text-slate-400 border border-slate-700">
                                        {team.tag}
                                    </span>
                                    <span className="text-xs text-slate-500 flex items-center gap-1">
                                        <Shield size={12} /> Captain: {team.captain?.username || 'Unknown'}
                                    </span>
                                </div>

                                <div className="mt-auto pt-4 border-t border-slate-800 flex items-center justify-between text-sm text-slate-400">
                                    <span>{team.members?.length || 0} Members</span>
                                    <button
                                        onClick={() => setSelectedTeam(team)}
                                        className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                                    >
                                        View Roster →
                                    </button>
                                </div>
                            </SpotlightCard>
                        ))}
                    </div>
                )}
            </div>



            {/* Create Modal */}
            {
                showCreateModal && (
                    <CreateTeamModal
                        onClose={() => setShowCreateModal(false)}
                        onTeamCreated={handleCreateTeam}
                    />
                )
            }

            {/* Team Details / Roster Modal */}
            {
                selectedTeam && (
                    <TeamDetailsModal
                        team={selectedTeam}
                        onClose={() => setSelectedTeam(null)}
                        onUpdate={(updatedTeam) => {
                            setTeams(teams.map(t => t._id === updatedTeam._id ? updatedTeam : t));
                            setSelectedTeam(updatedTeam);
                        }}
                    />
                )
            }
        </div >
    );
}
