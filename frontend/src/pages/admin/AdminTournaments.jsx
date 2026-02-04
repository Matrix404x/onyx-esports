import { useState, useEffect } from 'react';
import axios from 'axios';

const AdminTournaments = () => {
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem('token');
    const config = {
        headers: { 'x-auth-token': token }
    };

    useEffect(() => {
        fetchTournaments();
    }, []);

    const fetchTournaments = async () => {
        try {
            const res = await axios.get('/api/admin/tournaments', config);
            setTournaments(res.data);
        } catch (err) {
            console.error("Error fetching tournaments:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this tournament? This action cannot be undone.')) return;

        try {
            await axios.delete(`/api/admin/tournaments/${id}`, config);
            setTournaments(tournaments.filter(t => t._id !== id));
        } catch (err) {
            console.error("Error deleting tournament:", err);
            alert("Failed to delete tournament");
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h2 className="text-3xl font-bold mb-8 text-white">Tournament Management</h2>

            <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-800 text-slate-300">
                        <tr>
                            <th className="p-4 font-medium">Title</th>
                            <th className="p-4 font-medium">Game</th>
                            <th className="p-4 font-medium">Participants</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {tournaments.map(tournament => (
                            <tr key={tournament._id} className="hover:bg-slate-800/50 transition-colors text-slate-300">
                                <td className="p-4 font-medium text-white">{tournament.title}</td>
                                <td className="p-4 uppercase text-slate-400">{tournament.game}</td>
                                <td className="p-4">
                                    {tournament.participants ? tournament.participants.length : 0} / {tournament.maxParticipants || '-'}
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded w-fit text-xs font-bold ${tournament.status === 'upcoming' ? 'bg-cyan-500/20 text-cyan-300' :
                                            tournament.status === 'ongoing' ? 'bg-green-500/20 text-green-300' :
                                                'bg-slate-700 text-slate-300'
                                        }`}>
                                        {tournament.status ? tournament.status.toUpperCase() : 'UNKNOWN'}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <button
                                        onClick={() => handleDelete(tournament._id)}
                                        className="text-rose-500 hover:text-rose-400 text-sm font-medium"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {tournaments.length === 0 && (
                            <tr>
                                <td colSpan="5" className="p-8 text-center text-slate-500">
                                    No tournaments found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminTournaments;
