import { useState, useEffect } from 'react';
import { LayoutDashboard, Trophy, Users, MessageSquare, Mic, LogOut, Menu, X, Link as LinkIcon, Activity, Star, Shield } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Dashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [tournaments, setTournaments] = useState([]);
    const [playerStats, setPlayerStats] = useState(null);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [loadingStats, setLoadingStats] = useState(false);

    // Link Form State
    const [riotForm, setRiotForm] = useState({ gameName: '', tagLine: '', region: 'na1', game: 'lol' });
    const [linkError, setLinkError] = useState('');

    useEffect(() => {
        const fetchTournaments = async () => {
            try {
                const res = await axios.get('/api/tournaments');
                setTournaments(res.data);
            } catch (err) {
                console.error("Error fetching tournaments", err);
            }
        };

        const fetchStats = async () => {
            try {
                setLoadingStats(true);
                const res = await axios.get('/api/player/stats', {
                    headers: { 'x-auth-token': localStorage.getItem('token') }
                });
                setPlayerStats(res.data);
            } catch (err) {
                // If 400, strictly means no linked account
                console.log("Stats fetch info:", err.response?.data?.message);
            } finally {
                setLoadingStats(false);
            }
        };

        fetchTournaments();
        if (user) fetchStats();
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleLinkAccount = async (e) => {
        e.preventDefault();
        setLinkError('');
        try {
            const res = await axios.post('/api/player/link', riotForm, {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            setShowLinkModal(false);
            setPlayerStats(res.data.stats); // Update stats directly
            alert('Account Linked Successfully!');
        } catch (err) {
            setLinkError(err.response?.data?.message || 'Failed to link account');
        }
    };

    return (
        <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
            {/* Sidebar (Unchanged) */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transition-transform duration-300 md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between p-6 h-20 border-b border-slate-800">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Onyx</h1>
                    <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <nav className="p-4 space-y-2">
                    <NavItem icon={<LayoutDashboard />} label="Dashboard" onClick={() => navigate('/dashboard')} active={window.location.pathname === '/dashboard'} />
                    <NavItem icon={<Trophy />} label="Tournaments" onClick={() => navigate('/tournaments')} active={window.location.pathname === '/tournaments'} />
                    <NavItem icon={<Users />} label="Teams" onClick={() => navigate('/teams')} active={window.location.pathname === '/teams'} />
                    <NavItem icon={<MessageSquare />} label="Chat" onClick={() => navigate('/chat')} active={window.location.pathname === '/chat'} />
                    <NavItem icon={<Mic />} label="Voice Channels" onClick={() => navigate('/voice')} active={window.location.pathname === '/voice'} />
                    {user?.role === 'admin' && (
                        <NavItem icon={<Shield />} label="Admin Panel" onClick={() => navigate('/admin')} active={window.location.pathname.startsWith('/admin')} />
                    )}
                </nav>

                <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
                    <div onClick={() => window.location.href = '/profile'} className="flex items-center gap-3 mb-4 cursor-pointer hover:bg-slate-800 p-2 rounded-lg transition-colors">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold">
                            {user?.username?.[0] || 'U'}
                        </div>
                        <div>
                            <p className="font-medium text-sm">{user?.username || 'Gamer'}</p>
                            <p className="text-xs text-slate-400">Online</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors w-full px-2">
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Topbar */}
                <header className="h-20 bg-slate-900/50 backdrop-blur border-b border-slate-800 flex items-center justify-between px-6">
                    <button onClick={() => setSidebarOpen(true)} className="md:hidden text-slate-400 hover:text-white">
                        <Menu size={24} />
                    </button>

                    <div className="ml-auto flex items-center gap-4">
                        <button onClick={() => navigate('/create-tournament')} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition text-sm">
                            Create Tournament
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                    {/* Player Stats Section */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <Activity className="text-cyan-400" /> Player Statistics
                            </h2>
                            {!playerStats && (
                                <button onClick={() => setShowLinkModal(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:border-cyan-500 transition-colors text-sm">
                                    <LinkIcon size={16} /> Connect Riot Account
                                </button>
                            )}
                        </div>

                        {loadingStats ? (
                            <div className="h-32 bg-slate-900/50 animate-pulse rounded-xl" />
                        ) : playerStats ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Profile Card */}
                                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center gap-4">
                                    <div className="relative">
                                        {/* Avatar Logic */}
                                        <img
                                            src={playerStats.summoner
                                                ? `https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/${playerStats.summoner.profileIconId}.png`
                                                : 'https://img.icons8.com/color/48/valorant.png'}
                                            alt="Icon"
                                            className="w-16 h-16 rounded-full border-2 border-cyan-500"
                                        />
                                        {playerStats.summoner && (
                                            <span className="absolute -bottom-1 -right-1 bg-slate-950 text-xs px-1.5 py-0.5 rounded border border-slate-700">
                                                {playerStats.summoner.summonerLevel}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold">{playerStats.account.gameName} <span className="text-slate-500">#{playerStats.account.tagLine}</span></h3>
                                        <p className="text-sm text-slate-400 capitalize">{
                                            playerStats.shard
                                                ? `Valorant - ${playerStats.shard.activeShard}`
                                                : (playerStats.region || 'NA')
                                        }</p>
                                    </div>
                                </div>

                                {/* Rank Card */}
                                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                                    <h4 className="text-slate-400 text-sm mb-2 uppercase tracking-wider font-semibold">Ranked</h4>
                                    {playerStats.leagues ? (
                                        /* LoL Stats */
                                        playerStats.leagues.find(l => l.queueType === 'RANKED_SOLO_5x5') ? (
                                            <div className="flex items-center gap-4">
                                                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                                                    {playerStats.leagues.find(l => l.queueType === 'RANKED_SOLO_5x5').tier} {playerStats.leagues.find(l => l.queueType === 'RANKED_SOLO_5x5').rank}
                                                </div>
                                                <div className="text-sm text-slate-400">
                                                    <p>{playerStats.leagues.find(l => l.queueType === 'RANKED_SOLO_5x5').leaguePoints} LP</p>
                                                    <p>{playerStats.leagues.find(l => l.queueType === 'RANKED_SOLO_5x5').wins}W / {playerStats.leagues.find(l => l.queueType === 'RANKED_SOLO_5x5').losses}L</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-slate-500 italic">Unranked (LoL)</p>
                                        )
                                    ) : (
                                        /* Valorant Stats */
                                        <div className="flex flex-col gap-2">
                                            {playerStats.ranked ? (
                                                <div>
                                                    <p className="text-xl font-bold text-white">Ranked Rating</p>
                                                    <p className="text-cyan-400 font-medium">Rank Data Connected</p>
                                                </div>
                                            ) : (
                                                <div>
                                                    <p className="text-xl font-bold text-slate-500">Unranked</p>
                                                    <p className="text-xs text-slate-400">Play competitive to get a rank</p>
                                                </div>
                                            )}

                                            {/* Recent Matches List */}
                                            {playerStats.recentMatches && playerStats.recentMatches.length > 0 && (
                                                <div className="mt-2">
                                                    <p className="text-xs font-semibold text-slate-500 mb-1 uppercase">Recent Matches</p>
                                                    <div className="flex gap-1">
                                                        {playerStats.recentMatches.slice(0, 5).map((match, idx) => {
                                                            // Logic relies on assuming current player won/lost. 
                                                            // Riot Match-V1 returns full match details. Complex to parse fully in frontend without more backend logic.
                                                            // For MVP, we simply show "Played" or rely on a simple visual if we can't determine win easily.
                                                            // Actually, Match-V1 is big. Let's just show a dot for now indicating activity.
                                                            return (
                                                                <div key={idx} className="w-2 h-8 rounded bg-slate-700" title="Recent Match (Result N/A)"></div>
                                                            );
                                                        })}
                                                    </div>
                                                    <p className="text-xs text-slate-500 mt-1">{playerStats.recentMatches.length} Matches Found</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Win Rate Card */}
                                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col justify-center items-center text-center">
                                    <Star className="text-yellow-500 mb-2" size={24} />
                                    <p className="text-slate-400 text-sm">Win Rate</p>
                                    <p className="text-xl font-bold">
                                        {/* LoL Calculation */}
                                        {playerStats.leagues && playerStats.leagues.find(l => l.queueType === 'RANKED_SOLO_5x5')
                                            ? Math.round((playerStats.leagues.find(l => l.queueType === 'RANKED_SOLO_5x5').wins / (playerStats.leagues.find(l => l.queueType === 'RANKED_SOLO_5x5').wins + playerStats.leagues.find(l => l.queueType === 'RANKED_SOLO_5x5').losses)) * 100) + '%'
                                            : playerStats.recentMatches && playerStats.recentMatches.length > 0
                                                ? <span className="text-sm text-slate-400 font-normal">Calculating...</span>
                                                : 'N/A'
                                        }
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-slate-900/50 border border-dashed border-slate-800 p-8 rounded-xl text-center">
                                <p className="text-slate-400 mb-4">Link your Riot Games account to see your stats here.</p>
                                <button onClick={() => setShowLinkModal(true)} className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-cyan-900/20">
                                    Connect Account
                                </button>
                            </div>
                        )}
                    </div>

                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Trophy className="text-yellow-500" /> Live Tournaments</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tournaments.length === 0 ? (
                            <div className="col-span-full text-center text-slate-500 py-10">No tournaments found. Create one!</div>
                        ) : (
                            tournaments.map(tournament => (
                                <TournamentCard key={tournament._id} data={tournament} />
                            ))
                        )}
                    </div>
                </main>
            </div>

            {/* Link Modal */}
            {showLinkModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-md shadow-2xl relative">
                        <button onClick={() => setShowLinkModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                            <X size={20} />
                        </button>
                        <h2 className="text-xl font-bold mb-1">Connect Riot Account</h2>
                        <p className="text-slate-400 text-sm mb-6">Enter your Riot ID to sync your stats.</p>

                        {linkError && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-4 text-sm">{linkError}</div>}

                        <form onSubmit={handleLinkAccount} className="space-y-4">
                            {/* Game Selector */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Game</label>
                                <select
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-500 transition-colors"
                                    value={riotForm.game}
                                    onChange={(e) => setRiotForm({ ...riotForm, game: e.target.value })}
                                >
                                    <option value="lol">League of Legends</option>
                                    <option value="val">Valorant</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <div className="col-span-2 space-y-1">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Game Name</label>
                                    <input
                                        type="text"
                                        placeholder="Name"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-500 transition-colors"
                                        value={riotForm.gameName}
                                        onChange={(e) => setRiotForm({ ...riotForm, gameName: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Tag Line</label>
                                    <input
                                        type="text"
                                        placeholder="#NA1"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-500 transition-colors"
                                        value={riotForm.tagLine}
                                        onChange={(e) => setRiotForm({ ...riotForm, tagLine: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500 uppercase">
                                    {riotForm.game === 'val' ? 'Server Region' : 'Region'}
                                </label>
                                <select
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-500 transition-colors"
                                    value={riotForm.region}
                                    onChange={(e) => setRiotForm({ ...riotForm, region: e.target.value })}
                                >
                                    <option value="na1">North America (NA1)</option>
                                    <option value="euw1">Europe West (EUW1)</option>
                                    <option value="sg2">Singapore/SEA (SG2)</option>
                                    <option value="kr">Korea (KR)</option>
                                    <option value="br1">Brazil (BR1)</option>
                                    <option value="jp1">Japan (JP1)</option>
                                    <option value="tr1">Turkey (TR1)</option>
                                    <option value="ru">Russia (RU)</option>
                                    <option value="oc1">Oceania (OC1)</option>
                                    <option value="la1">Latin America North (LA1)</option>
                                    <option value="la2">Latin America South (LA2)</option>
                                    <option value="ph2">Philippines (PH2)</option>
                                    <option value="th2">Thailand (TH2)</option>
                                    <option value="tw2">Taiwan (TW2)</option>
                                    <option value="vn2">Vietnam (VN2)</option>
                                </select>
                            </div>

                            <button type="submit" className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-cyan-900/20 mt-2">
                                Link Account
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function NavItem({ icon, label, active, onClick }) {
    return (
        <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${active ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            {icon}
            <span className="font-medium">{label}</span>
        </button>
    );
}

function TournamentCard({ data }) {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/tournament/${data._id}`)}
            className="group bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-cyan-500/50 transition-all hover:shadow-lg hover:shadow-cyan-500/10 cursor-pointer"
        >
            <div className="h-40 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent z-10" />
                <img src={data.image || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2670&auto=format&fit=crop'} alt={data.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <span className="absolute top-2 right-2 z-20 px-2 py-1 bg-slate-950/80 backdrop-blur rounded text-xs font-bold border border-slate-700">
                    {data.game}
                </span>
            </div>

            <div className="p-5">
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">{data.title}</h3>

                <div className="flex justify-between items-center text-sm text-slate-400 mb-4">
                    <span>📅 {new Date(data.date).toLocaleDateString()}</span>
                    <span>🏆 {data.prize}</span>
                </div>

                <button className="w-full py-2 bg-slate-800 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors border border-slate-700 hover:border-cyan-500">
                    View Details
                </button>
            </div>
        </div>
    );
}
