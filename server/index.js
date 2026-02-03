import { useEffect, useState, useRef } from "react";
import { socket } from "../services/socket";
import useMicrophone from "../hooks/useMicrophone";
import useWebRTC from "../hooks/useWebRTC";
import useSpeakingIndicator from "../hooks/useSpeakingIndicator";
import { useVoicePresence } from "../context/VoicePresenceContext";

import VoiceRoom from "../components/VoiceRoom";
import ParticipantList from "../components/ParticipantList";
import VoiceChannelList from "../components/VoiceChannelList";

export default function Voice() {
  const [localStream, setLocalStream] = useState(null);
  const [joined, setJoined] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [speakingUsers, setSpeakingUsers] = useState({});
  const [channelId, setChannelId] = useState("lobby");

  const audioRef = useRef(null);
  const shouldOfferRef = useRef(false);

  // 🔗 Chat → Voice intent
  const { joinVoiceIntent, setJoinVoiceIntent } = useVoicePresence();

  const roomKey = `voice-demo-${channelId}`;

  // TEMP user (replace with auth later)
  const user = {
    userId: "user_" + Math.random().toString(36).slice(2),
    username: "Ashish",
  };

  const {
    micOn,
    enableMic,
    toggleMic,
    disableMic,
  } = useMicrophone();

  const speaking = useSpeakingIndicator(localStream);

  const { createOffer, closePeer } = useWebRTC(
    localStream,
    roomKey,
    audioRef
  );

  const channels = [
    { id: "lobby", name: "Lobby" },
    { id: "team-a", name: "Team A" },
    { id: "team-b", name: "Team B" },
  ];

  // =========================
  // SOCKET LISTENERS
  // =========================
  useEffect(() => {
    socket.connect();

    socket.on("voice-users", (users) => {
      setParticipants(users);
    });

    socket.on("user-speaking", ({ userId, speaking }) => {
      setSpeakingUsers((prev) => ({
        ...prev,
        [userId]: speaking,
      }));
    });

    return () => socket.disconnect();
  }, []);

  // =========================
  // EMIT SPEAKING STATE
  // =========================
  useEffect(() => {
    if (!joined) return;

    socket.emit(speaking ? "speaking-start" : "speaking-stop", {
      roomKey,
      userId: user.userId,
    });
  }, [speaking, joined, roomKey]);

  // =========================
  // EMIT MUTE STATE
  // =========================
  useEffect(() => {
    if (!joined) return;

    socket.emit("mute-update", {
      roomKey,
      userId: user.userId,
      muted: !micOn,
    });
  }, [micOn, joined, roomKey]);

  // =========================
  // JOIN VOICE
  // =========================
  const joinVoice = async () => {
    if (joined) return;

    const stream = await enableMic();
    if (!stream) return;

    setLocalStream(stream);
    socket.emit("join-voice", { roomKey, user });

    shouldOfferRef.current = true;
    setJoined(true);
  };

  // =========================
  // CREATE OFFER
  // =========================
  useEffect(() => {
    if (localStream && joined && shouldOfferRef.current) {
      shouldOfferRef.current = false;
      createOffer();
    }
  }, [localStream, joined, createOffer]);

  // =========================
  // LEAVE VOICE
  // =========================
  const leaveVoice = () => {
    closePeer();
    disableMic();
    socket.emit("leave-voice", { roomKey, userId: user.userId });

    setLocalStream(null);
    setJoined(false);
    setParticipants([]);
    setSpeakingUsers({});
  };

  // =========================
  // SWITCH CHANNEL
  // =========================
  const switchChannel = async (newChannel) => {
    if (newChannel === channelId) return;

    if (joined) {
      closePeer();
      disableMic();
      socket.emit("leave-voice", { roomKey, userId: user.userId });

      setJoined(false);
      setLocalStream(null);
      setParticipants([]);
      setSpeakingUsers({});
    }

    setChannelId(newChannel);
  };

  // =========================
  // CHAT → JOIN VOICE
  // =========================
  useEffect(() => {
    if (!joinVoiceIntent) return;

    const targetChannel = joinVoiceIntent.replace("voice-demo-", "");

    switchChannel(targetChannel);
    setJoinVoiceIntent(null);
  }, [joinVoiceIntent]);

  return (
    <div className="flex h-screen bg-slate-950 text-white">
      <VoiceChannelList
        channels={channels}
        active={channelId}
        onSelect={switchChannel}
      />

      <ParticipantList
        users={participants}
        speakingUsers={speakingUsers}
      />

      <VoiceRoom
        joined={joined}
        micOn={micOn}
        speaking={speaking}
        onJoin={joinVoice}
        onLeave={leaveVoice}
        onToggleMic={toggleMic}
      />

      <audio ref={audioRef} autoPlay playsInline />
    </div>
  );
}
