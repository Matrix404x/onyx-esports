import { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ userCount: 0, tournamentCount: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const res = await axios.get('/api/admin/stats', {
                    headers: { 'x-auth-token': token }
                });
                setStats(res.data);
            } catch (err) {
                console.error("Error fetching stats:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div className="p-4">Loading stats...</div>;

    return (
        <div>
            <h2 className="text-3xl font-bold mb-8 text-white">Dashboard Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Users Card */}
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
                    <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">Total Users</h3>
                    <p className="text-4xl font-bold text-white mt-2">{stats.userCount}</p>
                </div>

                {/* Tournaments Card */}
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
                    <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">Tournaments</h3>
                    <p className="text-4xl font-bold text-cyan-400 mt-2">{stats.tournamentCount}</p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
