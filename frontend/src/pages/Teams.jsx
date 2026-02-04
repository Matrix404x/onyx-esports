import { ArrowLeft, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Teams() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8 pt-20 flex flex-col items-center justify-center">
            <div className="max-w-2xl text-center">
                <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-800">
                    <Users size={32} className="text-cyan-400" />
                </div>
                <h1 className="text-4xl font-bold mb-4">Teams Coming Soon</h1>
                <p className="text-slate-400 mb-8 text-lg">
                    We are building a comprehensive team management system.
                    Soon you will be able to create teams, invite members, and manage rosters.
                </p>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl font-medium transition-all flex items-center gap-2 mx-auto"
                >
                    <ArrowLeft size={18} /> Back to Dashboard
                </button>
            </div>
        </div>
    );
}
