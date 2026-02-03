export default function VoiceChannelList({ channels, active, onSelect }) {
  return (
    <div className="w-60 bg-slate-900 p-4 border-r border-slate-700">
      <h3 className="text-sm font-semibold mb-3 text-slate-300">
        Voice Channels
      </h3>

      {channels.map((channel) => (
        <button
          key={channel.id}
          onClick={() => onSelect(channel.id)}
          className={`w-full text-left px-3 py-2 rounded mb-1 ${
            active === channel.id
              ? "bg-slate-700 text-white"
              : "text-slate-400 hover:bg-slate-800"
          }`}
        >
          🔊 {channel.name}
        </button>
      ))}
    </div>
  );
}
