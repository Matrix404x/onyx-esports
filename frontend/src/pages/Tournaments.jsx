import { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, Calendar, Trophy, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Tournaments() {
    const [tournaments, setTournaments] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTournaments = async () => {
            try {
                const res = await axios.get('/api/tournaments');
                setTournaments(res.data);
            } catch (err) {
                console.error("Error fetching tournaments", err);
            }
        };
        fetchTournaments();
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8 pt-20">
            <div className="max-w-7xl mx-auto">
                <header className="flex items-center gap-4 mb-8">
                    <button onClick={() => navigate('/dashboard')} className="p-2 bg-slate-900 border border-slate-800 rounded-full hover:bg-slate-800 transition-colors">
                        <ArrowLeft />
                    </button>
                    <h1 className="text-3xl font-bold">All Tournaments</h1>
                </header>

                <h2 className="text-xl font-bold mb-6 text-cyan-400">Live & Upcoming</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {tournaments.filter(t => t.status !== 'completed' && (new Date(t.date) > new Date() || t.isLive)).length === 0 ? (
                        <div className="col-span-full text-center text-slate-500 py-10">No upcoming tournaments.</div>
                    ) : (
                        tournaments.filter(t => t.status !== 'completed' && (new Date(t.date) > new Date() || t.isLive)).map(tournament => (
                            <TournamentCard key={tournament._id} data={tournament} />
                        ))
                    )}
                </div>

                <h2 className="text-xl font-bold mb-6 text-slate-500">History</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60">
                    {tournaments.filter(t => t.status === 'completed' || (new Date(t.date) <= new Date() && !t.isLive)).length === 0 ? (
                        <div className="col-span-full text-center text-slate-500 py-10">No past tournaments.</div>
                    ) : (
                        tournaments.filter(t => t.status === 'completed' || (new Date(t.date) <= new Date() && !t.isLive)).map(tournament => (
                            <TournamentCard key={tournament._id} data={tournament} isCompleted={true} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

function TournamentCard({ data, isCompleted = false }) {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/tournament/${data._id}`)}
            className="group bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-cyan-500/50 transition-all hover:shadow-lg hover:shadow-cyan-500/10 cursor-pointer"
        >
            <div className="h-48 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent z-10" />
                <img src={data.image || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2670&auto=format&fit=crop'} alt={data.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <span className="absolute top-2 right-2 z-20 px-2 py-1 bg-slate-950/80 backdrop-blur rounded text-xs font-bold border border-slate-700">
                    {data.game}
                </span>
                {data.isLive && (
                    <span className="absolute top-2 left-2 z-20 px-2 py-1 bg-red-600 text-white rounded text-xs font-bold uppercase animate-pulse">
                        LIVE
                    </span>
                )}
            </div>

            <div className="p-5">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">{data.title}</h3>

                <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-4">
                    <div className="flex items-center gap-1"><Calendar size={14} /> {new Date(data.date).toLocaleDateString()}</div>
                    <div className="flex items-center gap-1"><Trophy size={14} /> {data.prize}</div>
                    <div className="flex items-center gap-1"><Users size={14} /> {data.currentTeams || 0} / {data.maxTeams}</div>
                </div>

                <div className="flex items-center gap-2">
                    <button className={`flex-1 py-2 rounded-lg font-medium transition-colors border ${isCompleted
                        ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                        : 'bg-slate-800 hover:bg-cyan-600 text-white border-slate-700 hover:border-cyan-500'
                        }`}>
                        {isCompleted ? 'Completed' : 'View Details'}
                    </button>
                    {data.entryFee === 0 && <span className="px-3 py-2 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg font-bold text-sm">Free</span>}
                </div>
            </div>
        </div>
    );
}
