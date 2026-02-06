import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Trophy, Swords, TrendingUp, Calendar, Clock, Activity, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        userCount: 0,
        tournamentCount: 0,
        activeTournaments: 0,
        upcomingTournaments: 0,
        completedTournaments: 0,
        teamCount: 0
    });
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

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                <Activity className="text-cyan-400" />
                Performance Overview
            </h2>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Total Users */}
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users size={64} className="text-cyan-400" />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                            <Users size={24} />
                        </div>
                        <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">Total Users</h3>
                    </div>
                    <p className="text-3xl font-bold text-white">{stats.userCount}</p>
                    <div className="mt-4 flex items-center text-xs text-green-400 gap-1">
                        <TrendingUp size={14} />
                        <span>+12% this month</span>
                    </div>
                </div>

                {/* Active Tournaments */}
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 relative overflow-hidden group hover:border-green-500/50 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Swords size={64} className="text-green-400" />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400">
                            <Swords size={24} />
                        </div>
                        <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">Active Battles</h3>
                    </div>
                    <p className="text-3xl font-bold text-white">{stats.activeTournaments}</p>
                    <div className="mt-4 flex items-center text-xs text-slate-400 gap-1">
                        <span>{stats.upcomingTournaments} upcoming events</span>
                    </div>
                </div>

                {/* Total Teams */}
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 relative overflow-hidden group hover:border-purple-500/50 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Trophy size={64} className="text-purple-400" />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                            <Trophy size={24} />
                        </div>
                        <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">Registered Teams</h3>
                    </div>
                    <p className="text-3xl font-bold text-white">{stats.teamCount}</p>
                    <div className="mt-4 flex items-center text-xs text-purple-400 gap-1">
                        <span>High Engagement</span>
                    </div>
                </div>

                {/* Revenue (Mock) */}
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 relative overflow-hidden group hover:border-yellow-500/50 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <DollarSign size={64} className="text-yellow-400" />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-400">
                            <DollarSign size={24} />
                        </div>
                        <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">Est. Revenue</h3>
                    </div>
                    <p className="text-3xl font-bold text-white">$0.00</p>
                    <div className="mt-4 flex items-center text-xs text-slate-500 gap-1">
                        <span>Payments integration in progress</span>
                    </div>
                </div>
            </div>

            {/* Recent Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* System Health / Quick Actions */}
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 lg:col-span-2">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Clock size={20} className="text-slate-400" />
                        Quick Actions
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link to="/admin/tournaments" className="p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-4 border border-slate-700/50 hover:border-cyan-500/50">
                            <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                                <Trophy size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-white">Manage Tournaments</h4>
                                <p className="text-xs text-slate-400">Create, edit, or delete events</p>
                            </div>
                        </Link>
                        <Link to="/admin/users" className="p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-4 border border-slate-700/50 hover:border-purple-500/50">
                            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                                <Users size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-white">Manage Users</h4>
                                <p className="text-xs text-slate-400">View and moderate user base</p>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Tournament Status Summary */}
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-6">Tournament Status</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-slate-300">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                Ongoing Needs Attention
                            </div>
                            <span className="font-mono text-white">{stats.activeTournaments}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-slate-300">
                                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                Upcoming
                            </div>
                            <span className="font-mono text-white">{stats.upcomingTournaments}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-slate-300">
                                <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                                Completed
                            </div>
                            <span className="font-mono text-white">{stats.completedTournaments}</span>
                        </div>
                        <div className="pt-4 mt-4 border-t border-slate-800">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-400 font-bold">Total Events</span>
                                <span className="font-mono text-cyan-400 font-bold">{stats.tournamentCount}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
