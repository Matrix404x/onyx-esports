import { User, Trophy, Target, Swords, Clock, Edit2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Mock Stats
    const stats = {
        matchesPlayed: 42,
        tournamentsWon: 3,
        winRate: '68%',
        rank: 'Diamond II'
    };

    const matchHistory = [
        { id: 1, result: 'Victory', game: 'Valorant', score: '13 - 9', date: '2 hours ago', kill: 18, death: 12 },
        { id: 2, result: 'Defeat', game: 'Valorant', score: '11 - 13', date: 'Yesterday', kill: 24, death: 15 },
        { id: 3, result: 'Victory', game: 'CS2', score: '16 - 14', date: '2 days ago', kill: 32, death: 19 },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 pb-20">

            {/* Navigation */}
            <div className="max-w-4xl mx-auto mb-6">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white transition">
                    <ArrowLeft size={20} /> Back
                </button>
            </div>

            <div className="max-w-4xl mx-auto space-y-6">
                {/* Profile Header */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-cyan-600/20 to-blue-600/20" />

                    <div className="relative flex flex-col md:flex-row items-center md:items-end gap-6 z-10">
                        <div className="w-32 h-32 rounded-full bg-slate-950 border-4 border-slate-800 flex items-center justify-center text-4xl font-bold pb-2 shadow-xl">
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                                {user?.username?.[0] || 'U'}
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left mb-2">
                            <h1 className="text-3xl font-bold">{user?.username || 'Guest User'}</h1>
                            <p className="text-slate-400">@{user?.username?.toLowerCase() || 'guest'} • Member since Feb 2024</p>
                        </div>

                        <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors">
                            <Edit2 size={16} /> Edit Profile
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard icon={<Swords className="text-red-400" />} label="Matches" value={stats.matchesPlayed} />
                    <StatCard icon={<Trophy className="text-yellow-400" />} label="Wins" value={stats.tournamentsWon} />
                    <StatCard icon={<Target className="text-green-400" />} label="Win Rate" value={stats.winRate} />
                    <StatCard icon={<User className="text-blue-400" />} label="Rank" value={stats.rank} />
                </div>

                {/* Match History */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Clock className="text-cyan-400" /> Recent Matches
                    </h2>

                    <div className="space-y-4">
                        {matchHistory.map(match => (
                            <div key={match.id} className="flex flex-col md:flex-row items-center justify-between p-4 bg-slate-950/50 border border-slate-800 rounded-xl hover:border-slate-700 transition">
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <div className={`w-2 h-12 rounded-full ${match.result === 'Victory' ? 'bg-green-500' : 'bg-red-500'}`} />
                                    <div>
                                        <h3 className="font-bold text-lg">{match.game}</h3>
                                        <p className={`text-sm font-bold ${match.result === 'Victory' ? 'text-green-400' : 'text-red-400'}`}>{match.result}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8 my-4 md:my-0">
                                    <div className="text-center">
                                        <p className="text-xs text-slate-500">Score</p>
                                        <p className="font-mono font-bold">{match.score}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-slate-500">K/D</p>
                                        <p className="font-mono font-bold">{match.kill} / {match.death}</p>
                                    </div>
                                </div>

                                <div className="text-sm text-slate-500">
                                    {match.date}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}

function StatCard({ icon, label, value }) {
    return (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-slate-800/50 transition-colors">
            {icon}
            <span className="text-2xl font-bold">{value}</span>
            <span className="text-xs text-slate-400">{label}</span>
        </div>
    )
}
