import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../services/firebase";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

const TOURNAMENT_ID = "demo-tournament";

export default function ChatWindow() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const messagesRef = collection(
      db,
      "tournaments",
      TOURNAMENT_ID,
      "chats"
    );

    const q = query(messagesRef, orderBy("createdAt"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, []);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    await addDoc(
      collection(db, "tournaments", TOURNAMENT_ID, "chats"),
      {
        text,
        senderId: "mock_user_1",     // later from JWT
        senderName: "Ashish",        // later from profile
        createdAt: serverTimestamp(),
      }
    );
  };

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto h-screen">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900">
        <h2 className="text-lg font-semibold text-cyan-400">
          Tournament Chat
        </h2>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
      </div>

      {/* Input */}
      <ChatInput onSend={sendMessage} />
    </div>
  );
}
