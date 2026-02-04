import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) return <div>Loading...</div>;

    if (!user || user.role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    const isActive = (path) => {
        return location.pathname === path ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white';
    };

    return (
        <div className="flex h-screen bg-slate-950">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
                <div className="p-6 border-b border-slate-800">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                        Admin Panel
                    </h1>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <Link
                        to="/admin"
                        className={`block px-4 py-3 rounded-lg transition-colors ${isActive('/admin')}`}
                    >
                        Dashboard
                    </Link>
                    <Link
                        to="/admin/users"
                        className={`block px-4 py-3 rounded-lg transition-colors ${isActive('/admin/users')}`}
                    >
                        Users
                    </Link>
                    <Link
                        to="/admin/tournaments"
                        className={`block px-4 py-3 rounded-lg transition-colors ${isActive('/admin/tournaments')}`}
                    >
                        Tournaments
                    </Link>
                    <div className="pt-4 border-t border-slate-800 mt-4">
                        <Link
                            to="/dashboard"
                            className="block px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                        >
                            Back to App
                        </Link>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-8">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
