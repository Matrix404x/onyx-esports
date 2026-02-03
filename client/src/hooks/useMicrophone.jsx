import { useState, useRef } from "react";

export default function useMicrophone() {
  const [micOn, setMicOn] = useState(false);
  const streamRef = useRef(null);

  const enableMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setMicOn(true);
      return stream;
    } catch (err) {
      console.error("Mic permission denied", err);
      return null;
    }
  };

  const toggleMic = () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getAudioTracks()[0];
    track.enabled = !track.enabled;
    setMicOn(track.enabled);
  };

  const disableMic = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setMicOn(false);
  };

  return {
    micOn,
    enableMic,
    toggleMic,
    disableMic,
  };
}
