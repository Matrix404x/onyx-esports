import { useEffect, useState } from "react";

export default function useSpeakingIndicator(localStream) {
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (!localStream) return;

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;

    const source = audioContext.createMediaStreamSource(localStream);
    source.connect(analyser);

    const data = new Uint8Array(analyser.frequencyBinCount);
    let rafId;

    const detect = () => {
      analyser.getByteFrequencyData(data);
      const avg = data.reduce((s, v) => s + v, 0) / data.length;
      setSpeaking(avg > 20);
      rafId = requestAnimationFrame(detect);
    };

    detect();

    return () => {
      cancelAnimationFrame(rafId);
      audioContext.close();
    };
  }, [localStream]);

  return speaking;
}
