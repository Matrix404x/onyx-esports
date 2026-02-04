import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import TournamentDetails from './pages/TournamentDetails';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Voice from './pages/Voice';
import CreateTournament from './pages/CreateTournament';
import Profile from './pages/Profile';
import Tournaments from './pages/Tournaments';
import Teams from './pages/Teams';

import Landing from './pages/Landing';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTournaments from './pages/admin/AdminTournaments';

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tournaments" element={<Tournaments />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/tournament/:id" element={<TournamentDetails />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/voice" element={<Voice />} />
        <Route path="/create-tournament" element={<CreateTournament />} />
        <Route path="/profile" element={<Profile />} />
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="tournaments" element={<AdminTournaments />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
