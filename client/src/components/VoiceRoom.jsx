export default function VoiceRoom({
  joined,
  micOn,
  speaking,
  onJoin,
  onLeave,
  onToggleMic,
}) {
  return (
    <div className="flex-1 p-6">
      <h2 className="text-xl font-bold">Voice Room</h2>

      {!joined ? (
        <button
          onClick={onJoin}
          className="mt-4 bg-green-600 px-4 py-2 rounded"
        >
          Join Voice
        </button>
      ) : (
        <>
          <div className="flex items-center gap-3 mt-4">
            <div
              className={`w-3 h-3 rounded-full ${
                speaking ? "bg-green-400 animate-pulse" : "bg-slate-600"
              }`}
            />
            <span>{speaking ? "Speaking…" : "Silent"}</span>
          </div>

          <div className="mt-4">
            <button
              onClick={onToggleMic}
              className="bg-slate-700 px-4 py-2 rounded mr-3"
            >
              {micOn ? "Mute 🔇" : "Unmute 🎤"}
            </button>

            <button
              onClick={onLeave}
              className="bg-red-600 px-4 py-2 rounded"
            >
              Leave
            </button>
          </div>
        </>
      )}
    </div>
  );
}
