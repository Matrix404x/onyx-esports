import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Calendar, DollarSign, Users, Gamepad2, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';

export default function CreateTournament() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        game: 'Valorant',
        prize: '',
        entryFee: 0,
        date: '',
        maxTeams: 16,
        image: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error("You must be logged in to create a tournament.");
            return;
        }

        try {
            await axios.post('/api/tournaments', formData, {
                headers: {
                    'x-auth-token': token
                }
            });

            toast.success("Tournament Created Successfully!");
            navigate('/tournaments');
        } catch (err) {
            console.error(err);
            toast.error("Failed to create tournament: " + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
            <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">

                {/* Header */}
                <div className="bg-slate-900 border-b border-slate-800 p-6 flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition">
                        <ArrowLeft />
                    </button>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                        Host a Tournament
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">

                    {/* Title */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                            <Trophy size={16} className="text-cyan-400" /> Tournament Name
                        </label>
                        <input
                            type="text"
                            name="title"
                            required
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors"
                            placeholder="e.g. Winter Championship 2024"
                            value={formData.title}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Game */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                <Gamepad2 size={16} className="text-purple-400" /> Game
                            </label>
                            <select
                                name="game"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors"
                                value={formData.game}
                                onChange={handleChange}
                            >
                                <option value="Valorant">Valorant</option>
                                <option value="CS2">Counter-Strike 2</option>
                                <option value="League of Legends">League of Legends</option>
                                <option value="Dota 2">Dota 2</option>
                                <option value="Rocket League">Rocket League</option>
                            </select>
                        </div>

                        {/* Prize Pool */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                <DollarSign size={16} className="text-green-400" /> Prize Pool
                            </label>
                            <input
                                type="text"
                                name="prize"
                                required
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors"
                                placeholder="e.g. $10,000"
                                value={formData.prize}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Entry Fee */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                <DollarSign size={16} className="text-red-400" /> Entry Fee (₹)
                            </label>
                            <input
                                type="number"
                                name="entryFee"
                                min="0"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors"
                                placeholder="0 for Free"
                                value={formData.entryFee}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Date */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                <Calendar size={16} className="text-yellow-400" /> Date
                            </label>
                            <input
                                type="date"
                                name="date"
                                required
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors text-slate-400"
                                value={formData.date}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Max Teams */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                <Users size={16} className="text-red-400" /> Max Teams
                            </label>
                            <input
                                type="number"
                                name="maxTeams"
                                min="2"
                                max="64"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors"
                                value={formData.maxTeams}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Image URL */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                            <ImageIcon size={16} className="text-blue-400" /> Cover Image URL
                        </label>
                        <input
                            type="url"
                            name="image"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors"
                            placeholder="https://..."
                            value={formData.image}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all transform hover:scale-[1.01]"
                        >
                            Create Tournament
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
