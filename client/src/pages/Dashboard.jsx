import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { mockTournaments } from "../services/mockTournaments";
import TournamentCard from "../components/TournamentCard";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <Sidebar open={sidebarOpen} />

      <div className="flex flex-col flex-1 md:ml-2">
        <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 p-6">
          <h1 className="text-3xl font-bold text-cyan-400">
            Dashboard 🎮
          </h1>

          <p className="mt-2 text-slate-400">
            Welcome to your tournament control center.
          </p>

          {/* Stats */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <StatCard title="Tournaments" value="12" />
            <StatCard title="Matches Played" value="86" />
            <StatCard title="Active Players" value="248" />
          </section>

          {/* Tournaments */}
          <section className="mt-10">
            <h2 className="text-2xl font-bold mb-4">
              Your Tournaments
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {mockTournaments.map((t) => (
                <TournamentCard key={t.id} tournament={t} />
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-cyan-400 transition">
      <h3 className="text-slate-400">{title}</h3>
      <p className="text-4xl font-bold text-cyan-400 mt-2">
        {value}
      </p>
    </div>
  );
}
