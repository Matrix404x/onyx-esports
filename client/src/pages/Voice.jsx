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

  const { joinVoiceIntent, setJoinVoiceIntent } = useVoicePresence();

  const roomKey = `voice-demo-${channelId}`;

  const user = {
    userId: "user_" + Math.random().toString(36).slice(2),
    username: "Ashish",
  };

  const { micOn, enableMic, toggleMic, disableMic } = useMicrophone();
  const speaking = useSpeakingIndicator(localStream);
  const { createOffer, closePeer } = useWebRTC(localStream, roomKey, audioRef);

  const isHost =
    participants.find((u) => u.userId === user.userId)?.role === "host";

  // SOCKETS
  useEffect(() => {
    socket.connect();

    socket.on("voice-users", setParticipants);
    socket.on("user-speaking", ({ userId, speaking }) => {
      setSpeakingUsers((p) => ({ ...p, [userId]: speaking }));
    });

    socket.on("force-leave-voice", leaveVoice);

    return () => socket.disconnect();
  }, []);

  // SPEAKING
  useEffect(() => {
    if (!joined) return;
    socket.emit(speaking ? "speaking-start" : "speaking-stop", {
      roomKey,
      userId: user.userId,
    });
  }, [speaking, joined, roomKey]);

  // JOIN
  const joinVoice = async () => {
    if (joined) return;
    const stream = await enableMic();
    if (!stream) return;

    setLocalStream(stream);
    socket.emit("join-voice", { roomKey, user });
    shouldOfferRef.current = true;
    setJoined(true);
  };

  useEffect(() => {
    if (localStream && joined && shouldOfferRef.current) {
      shouldOfferRef.current = false;
      createOffer();
    }
  }, [localStream, joined]);

  // LEAVE
  const leaveVoice = () => {
    closePeer();
    disableMic();
    socket.emit("leave-voice", { roomKey, userId: user.userId });

    setLocalStream(null);
    setJoined(false);
    setParticipants([]);
    setSpeakingUsers({});
  };

  // HOST ACTIONS
  const muteUser = (targetUserId) => {
    socket.emit("mute-user", { roomKey, targetUserId });
  };

  const kickUser = (targetUserId) => {
    socket.emit("kick-user", { roomKey, targetUserId });
  };

  // SWITCH CHANNEL
  const switchChannel = async (newChannel) => {
    if (newChannel === channelId) return;
    if (joined) leaveVoice();
    setChannelId(newChannel);
  };

  // CHAT → VOICE
  useEffect(() => {
    if (!joinVoiceIntent) return;
    switchChannel(joinVoiceIntent.replace("voice-demo-", ""));
    setJoinVoiceIntent(null);
  }, [joinVoiceIntent]);

  return (
    <div className="flex h-screen bg-slate-950 text-white">
      <VoiceChannelList
        channels={[
          { id: "lobby", name: "Lobby" },
          { id: "team-a", name: "Team A" },
          { id: "team-b", name: "Team B" },
        ]}
        active={channelId}
        onSelect={switchChannel}
      />

      <ParticipantList
        users={participants}
        speakingUsers={speakingUsers}
        currentUserId={user.userId}
        isHost={isHost}
        onMuteUser={muteUser}
        onKickUser={kickUser}
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
