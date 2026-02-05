import { User, Trophy, Target, Swords, Clock, Edit2, ArrowLeft, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import FriendRequestButton from '../components/FriendRequestButton';
import axios from 'axios';
import SettingsModal from '../components/SettingsModal';
import Loading from '../components/Loading';

export default function Profile() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { userId } = useParams(); // Optional param for viewing others

    const [stats, setStats] = useState({
        matchesPlayed: 0,
        tournamentsWon: 0,
        winRate: 'N/A',
        rank: 'Unranked'
    });
    const [matchHistory, setMatchHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showSettings, setShowSettings] = useState(false);
    const [status, setStatus] = useState('online');

    // Unified user object state to render (either "me" or "them")
    const [displayUser, setDisplayUser] = useState(null);

    useEffect(() => {
        // If no userId param, or userId matches logged in user, we display 'user' from context
        // But we wait for fetchStats to confirm data sync or just use context immediately
        if (!userId && user) {
            setDisplayUser(user);
        }
    }, [user, userId]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                let url = '/api/player/stats'; // Default to my stats
                if (userId && user && userId !== user._id) {
                    url = `/api/player/profile/${userId}`;
                }

                const res = await axios.get(url, {
                    headers: { 'x-auth-token': token }
                });

                const data = res.data;

                setStats({
                    matchesPlayed: data.matchesPlayed || 0,
                    tournamentsWon: data.tournamentsWon || 0,
                    winRate: data.winRate || 'N/A',
                    rank: data.rank || 'Unranked',
                    role: data.role || 'Flex',
                    main: data.main || 'Fill'
                });
                setMatchHistory(data.matchHistory || []);

                // If viewing other profile, the API returns the user profile info merged or separate
                // My `getUserProfile` returns the user info at root of object
                // My `getMyStats` returns { account, summoner, ... } and relies on local `user` for avatar/username in dashboard
                // Let's ensure `displayUser` is set correctly.

                if (userId && user && userId !== user._id) {
                    // It's another user
                    setDisplayUser(data);
                } else if (user) {
                    // It's me, ensure displayUser is set (useEffect above does it, but this confirms)
                    setDisplayUser(user);
                }

                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch stats:", err);
                setError(err.response?.data?.message || "Failed to load profile.");
                setLoading(false);
            }
        };

        if (user) {
            fetchStats();
        }
    }, [user, userId]);

    if (loading) return <Loading text="Loading Profile..." />;

    // Helper to decide if "Me"
    const isMe = !userId || (user && user._id === userId);

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

                    <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6 z-10">
                        <div className="w-32 h-32 rounded-full bg-slate-950 border-4 border-slate-800 flex items-center justify-center text-4xl font-bold pb-2 shadow-xl overflow-hidden">
                            {displayUser?.avatar ? (
                                <img src={displayUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                                    {displayUser?.username?.[0] || 'U'}
                                </div>
                            )}
                        </div>

                        <div className="flex-1 text-center md:text-left mb-2 md:pt-14">
                            <h1 className="text-3xl font-bold">{displayUser?.username || 'Guest User'}</h1>
                            <p className="text-slate-400">@{displayUser?.username?.toLowerCase() || 'guest'} • Member since Feb 2024</p>

                            {/* Display linked Riot ID if available */}
                            {displayUser?.summonerName && (
                                <p className="text-sm text-cyan-400 mt-1">
                                    Linked: {displayUser.summonerName} #{displayUser.tagLine || 'NA1'}
                                </p>
                            )}

                            {/* Bio Section */}
                            {displayUser?.bio && (
                                <div className="mt-4 p-3 bg-slate-950/50 border border-slate-800 rounded-lg max-w-lg">
                                    <p className="text-slate-300 text-sm italic">"{displayUser.bio}"</p>
                                </div>
                            )}
                        </div>

                        <div className="md:pt-14">
                            {isMe ? (
                                <button
                                    onClick={() => setShowSettings(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
                                >
                                    <Edit2 size={16} /> Edit Profile
                                </button>
                            ) : (
                                <FriendRequestButton targetUserId={userId} />
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard icon={<Swords className="text-red-400" />} label="Matches" value={stats.matchesPlayed} />
                    <StatCard icon={<Trophy className="text-yellow-400" />} label="Wins" value={stats.tournamentsWon} />
                    <StatCard icon={<Target className="text-green-400" />} label="Win Rate" value={stats.winRate} />
                    <StatCard icon={<User className="text-blue-400" />} label="Rank" value={stats.rank} />
                    <StatCard icon={<Swords className="text-purple-400" />} label="Role" value={stats.role || '-'} />
                    <StatCard icon={<Star className="text-orange-400" />} label="Main" value={stats.main || '-'} />
                </div>

                {/* Match History */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Clock className="text-cyan-400" /> Recent Matches
                    </h2>

                    {error && (
                        <div className="text-red-400 mb-4 p-4 bg-red-900/10 border border-red-900 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        {matchHistory.length === 0 && !error && (
                            <p className="text-slate-500 text-center py-8">No recent match history found.</p>
                        )}

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

            {/* Settings Modal */}
            {showSettings && (
                <SettingsModal
                    onClose={() => setShowSettings(false)}
                    status={status}
                    setStatus={setStatus}
                />
            )}
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
