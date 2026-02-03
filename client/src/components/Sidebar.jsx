import { NavLink } from "react-router-dom";
import { LayoutDashboard, Trophy, Users, Settings } from "lucide-react";

const linkBase =
  "flex items-center gap-3 px-3 py-2 rounded-lg transition";
const linkActive =
  "bg-slate-800 text-cyan-400";
const linkInactive =
  "text-slate-300 hover:bg-slate-800 hover:text-cyan-400";

export default function Sidebar({ open }) {
  return (
    <aside
      className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-slate-900 p-6
      transform ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
      transition-transform duration-200`}
    >
      <h2 className="text-2xl font-bold text-cyan-400 mb-8">
        ESPORTS
      </h2>

      <nav className="flex flex-col gap-2">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `${linkBase} ${isActive ? linkActive : linkInactive}`
          }
        >
          <LayoutDashboard size={18} />
          Dashboard
        </NavLink>

        <NavLink
          to="#"
          className={linkInactive + " " + linkBase}
        >
          <Trophy size={18} />
          Tournaments
        </NavLink>

        <NavLink
          to="#"
          className={linkInactive + " " + linkBase}
        >
          <Users size={18} />
          Teams
        </NavLink>

        <NavLink
          to="#"
          className={linkInactive + " " + linkBase}
        >
          <Settings size={18} />
          Settings
        </NavLink>
      </nav>
    </aside>
  );
}
