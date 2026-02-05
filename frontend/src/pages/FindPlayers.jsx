import { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, Search, UserPt } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SpotlightCard from '../components/ui/SpotlightCard';
import FriendRequestButton from '../components/FriendRequestButton';
import { useAuth } from '../context/AuthContext';

export default function FindPlayers() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        try {
            const res = await axios.get(`/api/player/search?q=${query}`, {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            // Filter out self
            const filtered = res.data.filter(p => p._id !== user._id);
            setResults(filtered);
        } catch (err) {
            console.error("Search error", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8 pt-20 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="flex items-center gap-4 mb-8">
                    <button onClick={() => navigate('/dashboard')} className="p-2 bg-slate-900 border border-slate-800 rounded-full hover:bg-slate-800 transition-colors">
                        <ArrowLeft />
                    </button>
                    <h1 className="text-3xl font-bold">Find Players</h1>
                </header>

                <div className="mb-10 max-w-2xl mx-auto">
                    <form onSubmit={handleSearch} className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl opacity-20 group-hover:opacity-30 transition-opacity blur-md" />
                        <div className="relative bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex items-center p-2 focus-within:border-cyan-500/50 transition-colors">
                            <Search className="ml-3 text-slate-500" />
                            <input
                                type="text"
                                className="w-full bg-transparent border-none text-white px-4 py-3 focus:outline-none placeholder:text-slate-600 font-medium"
                                placeholder="Search by username, Summoner Name, or Riot ID..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Searching...' : 'Search'}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.length > 0 ? (
                        results.map(player => (
                            <SpotlightCard key={player._id} className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xl border border-slate-700 overflow-hidden">
                                        {player.avatar ? (
                                            <img src={player.avatar} alt={player.username} className="w-full h-full object-cover" />
                                        ) : (
                                            player.username[0].toUpperCase()
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-white">{player.username}</h3>
                                        <p className="text-sm text-slate-400">
                                            {player.summonerName ? `${player.summonerName} #${player.tagLine}` : 'No Riot ID'}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <FriendRequestButton targetUserId={player._id} initialStatus="none" />
                                </div>
                            </SpotlightCard>
                        ))
                    ) : (
                        query && !loading && (
                            <div className="col-span-full text-center text-slate-500 py-10">
                                No players found matching "{query}"
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
