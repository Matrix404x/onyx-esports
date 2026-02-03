export default function TournamentCard({ tournament }) {
  const statusColor =
    tournament.status === "Live"
      ? "bg-green-500"
      : tournament.status === "Upcoming"
      ? "bg-yellow-500"
      : "bg-slate-500";

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-cyan-400 transition">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-cyan-400">
          {tournament.name}
        </h3>
        <span className={`text-xs px-2 py-1 rounded ${statusColor}`}>
          {tournament.status}
        </span>
      </div>

      <p className="text-slate-400 text-sm">{tournament.game}</p>
      <p className="text-slate-500 text-sm mt-1">{tournament.date}</p>
    </div>
  );
}
