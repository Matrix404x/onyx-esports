import { createContext, useContext, useEffect, useState } from "react";
import { socket } from "../services/socket";

const VoicePresenceContext = createContext(null);

export function VoicePresenceProvider({ children }) {
  const [voicePresence, setVoicePresence] = useState({});
  const [joinVoiceIntent, setJoinVoiceIntent] = useState(null);

  useEffect(() => {
    socket.on("user-voice-status", ({ userId, channel, inVoice }) => {
      setVoicePresence((prev) => ({
        ...prev,
        [userId]: inVoice ? channel : null,
      }));
    });

    return () => socket.off("user-voice-status");
  }, []);

  return (
    <VoicePresenceContext.Provider
      value={{
        voicePresence,
        joinVoiceIntent,
        setJoinVoiceIntent,
      }}
    >
      {children}
    </VoicePresenceContext.Provider>
  );
}

export const useVoicePresence = () => useContext(VoicePresenceContext);
