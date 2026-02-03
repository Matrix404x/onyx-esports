import { Menu } from "lucide-react";

export default function Topbar({ onMenuClick }) {
  return (
    <header className="h-16 bg-slate-900 flex items-center justify-between px-6 border-b border-slate-800">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden text-slate-300 hover:text-cyan-400"
        >
          <Menu />
        </button>
        <h3 className="font-semibold">Overview</h3>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-slate-400">Ashish</span>
        <div className="w-8 h-8 rounded-full bg-cyan-400 flex items-center justify-center text-slate-900 font-bold">
          A
        </div>
      </div>
    </header>
  );
}
