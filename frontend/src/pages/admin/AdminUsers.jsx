import { useState, useEffect } from 'react';
import axios from 'axios';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem('token');
    const config = {
        headers: { 'x-auth-token': token }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await axios.get('/api/admin/users', config);
            setUsers(res.data);
        } catch (err) {
            console.error("Error fetching users:", err);
            // Handle error (e.g. redirect if 403)
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;

        try {
            await axios.delete(`/api/admin/users/${id}`, config);
            setUsers(users.filter(user => user._id !== id));
        } catch (err) {
            console.error("Error deleting user:", err);
            alert("Failed to delete user");
        }
    };

    const handleRoleUpdate = async (id, currentRole) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        if (!window.confirm(`Change role to ${newRole}?`)) return;

        try {
            const res = await axios.put(`/api/admin/users/${id}/role`, { role: newRole }, config);
            setUsers(users.map(user => user._id === id ? { ...user, role: res.data.role } : user));
        } catch (err) {
            console.error("Error updating role:", err);
            alert("Failed to update role");
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h2 className="text-3xl font-bold mb-8 text-white">User Management</h2>

            <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-800 text-slate-300">
                        <tr>
                            <th className="p-4 font-medium">Username</th>
                            <th className="p-4 font-medium">Email</th>
                            <th className="p-4 font-medium">Role</th>
                            <th className="p-4 font-medium">Joined</th>
                            <th className="p-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {users.map(user => (
                            <tr key={user._id} className="hover:bg-slate-800/50 transition-colors text-slate-300">
                                <td className="p-4 font-medium text-white">{user.username}</td>
                                <td className="p-4">{user.email}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-700 text-slate-300'
                                        }`}>
                                        {user.role.toUpperCase()}
                                    </span>
                                </td>
                                <td className="p-4 text-slate-400">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                                <td className="p-4 text-right space-x-2">
                                    <button
                                        onClick={() => handleRoleUpdate(user._id, user.role)}
                                        className="text-cyan-400 hover:text-cyan-300 text-sm font-medium"
                                    >
                                        {user.role === 'admin' ? 'Demote' : 'Promote'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user._id)}
                                        className="text-rose-500 hover:text-rose-400 text-sm font-medium"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsers;
