import { useState } from 'react';
import { X, Upload, Shield } from 'lucide-react';
import axios from 'axios';

export default function CreateTeamModal({ onClose, onTeamCreated }) {
    const [formData, setFormData] = useState({ name: '', tag: '', logo: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('/api/teams', formData, {
                headers: { 'x-auth-token': token }
            });
            onTeamCreated(res.data);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create team');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-md relative shadow-2xl">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Shield className="text-cyan-400" /> Create New Team
                </h2>

                {error && <div className="p-3 mb-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Team Name</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors text-white"
                            placeholder="e.g. T1 Academy"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Team Tag (2-5 Chars)</label>
                        <input
                            type="text"
                            required
                            maxLength={5}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors text-white uppercase"
                            placeholder="e.g. T1"
                            value={formData.tag}
                            onChange={(e) => setFormData({ ...formData, tag: e.target.value.toUpperCase() })}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Logo URL</label>
                        <input
                            type="url"
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors text-white"
                            placeholder="https://..."
                            value={formData.logo}
                            onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-cyan-900/20 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                    >
                        {loading ? 'Creating...' : 'Create Team'}
                    </button>
                </form>
            </div>
        </div>
    );
}
