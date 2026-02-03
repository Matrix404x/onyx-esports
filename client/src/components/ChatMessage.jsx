export default function ChatMessage({ message }) {
  return (
    <div className="flex flex-col">
      <span className="text-sm text-cyan-400">
        {message.sender}
      </span>
      <p className="text-slate-200">
        {message.text}
      </p>
    </div>
  );
}
