import { useEffect, useRef, useCallback } from "react";
import { socket } from "../services/socket";

export default function useWebRTC(localStream, roomKey, audioRef) {
  const peerRef = useRef(null);

  const buildPeer = useCallback(() => {
    if (!localStream) return null;
    if (peerRef.current) return peerRef.current;

    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    localStream.getTracks().forEach(track =>
      peer.addTrack(track, localStream)
    );

    peer.ontrack = (e) => {
      if (audioRef.current) {
        audioRef.current.srcObject = e.streams[0];
        audioRef.current.play().catch(() => {});
      }
    };

    peer.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("webrtc-ice", { roomKey, candidate: e.candidate });
      }
    };

    peerRef.current = peer;
    return peer;
  }, [localStream, roomKey, audioRef]);

  const createOffer = useCallback(async () => {
    const peer = buildPeer();
    if (!peer) return;

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    socket.emit("webrtc-offer", { roomKey, offer });
  }, [buildPeer, roomKey]);

  useEffect(() => {
    socket.on("webrtc-offer", async ({ offer }) => {
      const peer = buildPeer();
      if (!peer) return;

      await peer.setRemoteDescription(offer);
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      socket.emit("webrtc-answer", { roomKey, answer });
    });

    socket.on("webrtc-answer", async ({ answer }) => {
      if (!peerRef.current) return;
      await peerRef.current.setRemoteDescription(answer);
    });

    socket.on("webrtc-ice", async ({ candidate }) => {
      if (peerRef.current && candidate) {
        await peerRef.current.addIceCandidate(candidate);
      }
    });

    return () => {
      socket.off("webrtc-offer");
      socket.off("webrtc-answer");
      socket.off("webrtc-ice");
    };
  }, [buildPeer, roomKey]);

  const closePeer = () => {
    peerRef.current?.close();
    peerRef.current = null;
  };

  return { createOffer, closePeer };
}
