import { useVoicePresence } from "../context/VoicePresenceContext";

export default function ChatUserItem({ user }) {
  const { voicePresence, setJoinVoiceIntent } = useVoicePresence();
  const channel = voicePresence[user.userId];

  const handleClick = () => {
    if (!channel) return;
    setJoinVoiceIntent(channel);
  };

  return (
    <div
      onClick={handleClick}
      className={`flex items-center justify-between px-3 py-2 rounded cursor-pointer
        ${channel ? "hover:bg-slate-800" : "opacity-60 cursor-not-allowed"}
      `}
    >
      <span className="text-sm">{user.username}</span>

      {channel && (
        <span className="text-xs text-green-400">
          🔊 In voice
        </span>
      )}
    </div>
  );
}
