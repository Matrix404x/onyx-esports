export default function ParticipantList({
  users,
  speakingUsers,
  currentUserId,
  isHost,
  onMuteUser,
  onKickUser,
}) {
  return (
    <div className="w-64 bg-slate-900 p-4 border-r border-slate-700">
      <h3 className="text-sm font-semibold mb-3 text-slate-300">
        Voice Participants
      </h3>

      {users.map((user) => {
        const isSpeaking = speakingUsers[user.userId];

        return (
          <div
            key={user.userId}
            className="flex items-center justify-between py-2 px-2 rounded hover:bg-slate-800"
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isSpeaking
                    ? "bg-green-400 animate-pulse"
                    : "bg-slate-600"
                }`}
              />
              <span className="text-sm">
                {user.username}
                {user.role === "host" && " 👑"}
              </span>
            </div>

            {isHost && user.userId !== currentUserId && (
              <div className="flex gap-2 text-xs">
                <button
                  onClick={() => onMuteUser(user.userId)}
                  className="text-yellow-400"
                >
                  🔇
                </button>
                <button
                  onClick={() => onKickUser(user.userId)}
                  className="text-red-400"
                >
                  ❌
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
