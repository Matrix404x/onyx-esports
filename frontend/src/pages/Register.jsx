import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trophy, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Register() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await register(formData.username, formData.email, formData.password);
        if (res.success) {
            toast.success("Registration Successful!");
            navigate('/dashboard');
        } else {
            toast.error(res.message);
        }
    };
    return (
        <div className="flex h-screen w-full items-center justify-center bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center">
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm" />

            <div className="relative z-10 w-full max-w-md p-8 bg-slate-900/50 border border-slate-700/50 rounded-2xl shadow-2xl backdrop-blur-md animate-fade-in-up">
                <div className="flex flex-col items-center mb-6">
                    <div className="p-3 bg-purple-500/10 rounded-full mb-4">
                        <Trophy className="w-10 h-10 text-purple-400" />
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                        Join the League
                    </h2>
                    <p className="text-slate-400 mt-2">Start your legacy today.</p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Username</label>
                        <input
                            type="text"
                            name="username"
                            className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 text-white placeholder-slate-500 outline-none transition-all"
                            placeholder="ProGamer123"
                            value={formData.username}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 text-white placeholder-slate-500 outline-none transition-all"
                            placeholder="player@example.com"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 text-white placeholder-slate-500 outline-none transition-all"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>

                    <button className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-lg shadow-lg shadow-purple-500/20 transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2">
                        Create Account <UserPlus size={18} />
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-400">
                    Already a member?{' '}
                    <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                        Login here
                    </Link>
                </div>
            </div>
        </div>
    );
}
