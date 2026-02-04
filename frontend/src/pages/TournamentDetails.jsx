import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Trophy, Users, Shield, Share2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import PaymentModal from '../components/PaymentModal';
import LiveStream from '../components/LiveStream';
import TournamentChat from '../components/TournamentChat';

export default function TournamentDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [tournament, setTournament] = useState(null);
    const [isJoined, setIsJoined] = useState(false);
    const [showPayment, setShowPayment] = useState(false);

    useEffect(() => {
        const fetchTournament = async () => {
            try {
                const res = await axios.get(`/api/tournaments/${id}`);
                setTournament(res.data);
                // Check if user is participant
                if (user && res.data.participants && res.data.participants.includes(user.id)) {
                    setIsJoined(true);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchTournament();
    }, [id, user]);

    // Actual Join Function (Called after payment or if free)
    const processJoin = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`/api/tournaments/${id}/join`, {}, {
                headers: { 'x-auth-token': token }
            });
            alert("Joined successfully!");
            setIsJoined(true);
            setShowPayment(false);
            // Refresh data
            const res = await axios.get(`/api/tournaments/${id}`);
            setTournament(res.data);
        } catch (err) {
            alert(err.response?.data?.message || "Failed to join");
        }
    };

    const handleJoinClick = () => {
        if (!user) {
            alert("Please login to join!");
            navigate('/login');
            return;
        }

        if (tournament.entryFee > 0) {
            setShowPayment(true);
        } else {
            processJoin();
        }
    };


    if (!tournament) return <div className="text-white p-10">Loading...</div>;

    // Check if current user is organizer
    const organizerId = tournament.organizer?._id || tournament.organizer;
    const currentUserId = user?.id;
    const isOrganizer = user && (String(currentUserId) === String(organizerId));

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            {/* Hero Header */}
            <div className="relative h-80">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent z-10" />
                <img src={tournament.image || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2670&auto=format&fit=crop'} alt={tournament.title} className="w-full h-full object-cover opacity-60" />

                <div className="absolute top-6 left-6 z-20 flex items-center gap-4">
                    <button
                        onClick={() => {
                            if (window.history.length > 2) {
                                navigate(-1);
                            } else {
                                navigate(user ? '/dashboard' : '/');
                            }
                        }}
                        className="p-2 bg-slate-900/80 rounded-full hover:bg-cyan-500/20 text-white transition"
                    >
                        <ArrowLeft />
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="px-4 py-2 bg-slate-900/80 rounded-full hover:bg-cyan-500/20 text-white transition text-sm font-bold backdrop-blur-sm"
                    >
                        Home
                    </button>
                </div>

                <div className="absolute top-6 right-6 z-20">
                    {user ? (
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full font-bold shadow-lg shadow-cyan-500/20 transition-all backdrop-blur-sm"
                        >
                            Dashboard
                        </button>
                    ) : (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate('/login')}
                                className="px-6 py-2 bg-slate-900/80 hover:bg-slate-800 text-white rounded-full font-bold transition-all backdrop-blur-sm"
                            >
                                Login
                            </button>
                            <button
                                onClick={() => navigate('/register')}
                                className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full font-bold shadow-lg shadow-cyan-500/20 transition-all backdrop-blur-sm"
                            >
                                Register
                            </button>
                        </div>
                    )}
                </div>

                <div className="absolute bottom-0 left-0 w-full p-8 z-20">
                    <div className="max-w-6xl mx-auto">
                        <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 rounded-full text-sm font-bold mb-4 inline-block">
                            {tournament.game}
                        </span>
                        <h1 className="text-5xl font-extrabold mb-2">{tournament.title}</h1>
                        <div className="flex items-center gap-6 text-slate-300">
                            <div className="flex items-center gap-2"><Calendar size={18} /> {new Date(tournament.date).toLocaleDateString()}</div>
                            <div className="flex items-center gap-2"><Trophy size={18} /> {tournament.prize}</div>
                            <div className="flex items-center gap-2"><Users size={18} /> {tournament.currentTeams || 0} / {tournament.maxTeams} Teams</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: Bracket */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Live Stream Section */}
                    <section>
                        <LiveStream tournamentId={id} isOrganizer={isOrganizer} />
                    </section>

                    <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <Shield className="text-cyan-400" /> Tournament Bracket
                        </h2>
                        {/* Mock Bracket Visualization */}
                        <div className="flex justify-between items-center gap-4 overflow-x-auto pb-4">
                            <div className="p-10 text-slate-500 text-center w-full">
                                Brackets will be generated when tournament starts.
                            </div>
                        </div>
                    </section>
                </div>

                {/* Sidebar: Actions */}
                <div className="space-y-6">
                    {/* Live Chat Component */}
                    <div className="sticky top-6 z-30">
                        <TournamentChat tournamentId={id} />
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                        <h3 className="text-xl font-bold mb-4">Registration</h3>
                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between text-slate-400">
                                <span>Entry Fee</span>
                                <span className={tournament.entryFee > 0 ? "text-green-400 font-bold" : "text-white font-bold"}>
                                    {tournament.entryFee > 0 ? `₹${tournament.entryFee}` : 'Free'}
                                </span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                                <span>Slots Left</span>
                                <span className="text-white font-bold">{tournament.maxTeams - (tournament.currentTeams || 0)}</span>
                            </div>
                        </div>

                        {isJoined ? (
                            <button disabled className="w-full py-3 bg-green-600/20 text-green-500 border border-green-600/50 font-bold rounded-xl cursor-default">
                                You have Joined!
                            </button>
                        ) : (
                            <button
                                onClick={handleJoinClick}
                                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all"
                            >
                                {tournament.entryFee > 0 ? 'Pay & Register' : 'Register Team'}
                            </button>
                        )}

                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                                const toast = document.createElement('div');
                                toast.className = 'fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full shadow-xl z-50 animate-bounce';
                                toast.innerText = 'Tournament link copied to clipboard! 🚀';
                                document.body.appendChild(toast);
                                setTimeout(() => toast.remove(), 3000);
                            }}
                            className="w-full mt-3 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2"
                        >
                            <Share2 size={18} /> Share Tournament
                        </button>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {showPayment && (
                <PaymentModal
                    amount={tournament.entryFee}
                    onClose={() => setShowPayment(false)}
                    onSuccess={processJoin}
                />
            )}
        </div>
    );
}

function Match({ team1, team2, score1, score2 }) {
    return (
        <div className="bg-slate-950 border border-slate-800 rounded-lg w-48 overflow-hidden">
            <div className="flex justify-between px-3 py-2 border-b border-slate-800 bg-slate-900/50">
                <span className="text-sm font-medium">{team1}</span>
                <span className="text-sm text-cyan-400 font-bold">{score1}</span>
            </div>
            <div className="flex justify-between px-3 py-2 bg-slate-900/50">
                <span className="text-sm font-medium">{team2}</span>
                <span className="text-sm text-cyan-400 font-bold">{score2}</span>
            </div>
        </div>
    )
}


