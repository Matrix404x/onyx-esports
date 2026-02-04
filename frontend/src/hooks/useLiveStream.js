import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { API_URL } from '../config';

// Use a singleton socket connection if possible, or new one. 
// For now, let's assume we reuse the one from useWebRTC or create a new one.
// To avoid conflicts, let's create a new one for now as it's cleaner for this feature.
const socket = io(API_URL, { autoConnect: false });

export default function useLiveStream(tournamentId, isHost, user) {
    const [stream, setStream] = useState(null);
    const [status, setStatus] = useState('idle'); // idle, live, watching, ended
    const [viewerCount, setViewerCount] = useState(0);

    // Host Refs
    const localStreamRef = useRef(null);
    const peerConnections = useRef({}); // { viewerId: RTCPeerConnection }

    // Viewer Refs
    const remotePeerRef = useRef(null);

    useEffect(() => {
        if (!tournamentId) return;

        socket.connect();

        // Listen for generic signaling
        socket.on('offer', handleOffer);
        socket.on('answer', handleAnswer);
        socket.on('ice-candidate', handleIceCandidate);

        if (isHost) {
            socket.on('viewer-connected', handleViewerConnected);
        } else {
            socket.on('stream-started', handleStreamStarted);
            socket.on('stream-ended', handleStreamEnded);
            // Also join the stream room immediately to check if stream is already live?
            // For now, we wait for user to click "Watch" or auto-join.
            // Let's auto-join for signaling purposes
            socket.emit('join-stream', tournamentId);
        }

        return () => {
            socket.off('offer', handleOffer);
            socket.off('answer', handleAnswer);
            socket.off('ice-candidate', handleIceCandidate);
            socket.off('viewer-connected', handleViewerConnected);
            socket.off('stream-started', handleStreamStarted);
            socket.off('stream-ended', handleStreamEnded);
            socket.disconnect();
            stopStream();
        };
    }, [tournamentId, isHost, user]);

    // --- Host Functions ---

    const startStream = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true
            });

            // Add mic audio potentially?
            // const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            // // Merge tracks if needed. For now simple screen share.

            localStreamRef.current = mediaStream;
            setStream(mediaStream);
            setStatus('live');

            socket.emit('start-stream', tournamentId);

            // Handle stream stop via browser UI
            mediaStream.getVideoTracks()[0].onended = stopStream;

        } catch (err) {
            console.error("Error starting stream:", err);
            alert("Could not start screen share.");
        }
    };

    const stopStream = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }
        setStream(null);
        setStatus('idle');

        // Close all peer connections
        Object.values(peerConnections.current).forEach(pc => pc.close());
        peerConnections.current = {};

        if (isHost) {
            socket.emit('stop-stream', tournamentId);
        }
    };

    const handleViewerConnected = async (viewerId) => {
        console.log("Viewer connected:", viewerId);
        if (!localStreamRef.current) return;

        const peer = createPeer(viewerId);
        peerConnections.current[viewerId] = peer;

        // Add tracks
        localStreamRef.current.getTracks().forEach(track => {
            peer.addTrack(track, localStreamRef.current);
        });

        // Create Offer
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        socket.emit('offer', { target: viewerId, offer });
    };

    // --- Viewer Functions ---

    const handleStreamStarted = (hostId) => {
        console.log("Stream started by host:", hostId);
        setStatus('watching'); // Or 'ready'
    };

    const handleStreamEnded = () => {
        setStatus('ended');
        setStream(null);
        if (remotePeerRef.current) {
            remotePeerRef.current.close();
            remotePeerRef.current = null;
        }
    };

    // --- Signaling Handlers ---

    const createPeer = (targetId) => {
        const peer = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        peer.onicecandidate = (e) => {
            if (e.candidate) {
                socket.emit('ice-candidate', { target: targetId, candidate: e.candidate });
            }
        };

        if (!isHost) {
            peer.ontrack = (e) => {
                console.log("Received remote track");
                setStream(e.streams[0]);
                setStatus('watching');
            };
        }

        return peer;
    };

    const handleOffer = async ({ offer, caller }) => {
        if (isHost) return; // Host shouldn't receive offers in this model

        console.log("Received offer from:", caller);

        const peer = createPeer(caller);
        remotePeerRef.current = peer;

        await peer.setRemoteDescription(offer);
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);

        socket.emit('answer', { target: caller, answer });
    };

    const handleAnswer = async ({ answer, caller }) => {
        if (!isHost) return; // Viewers shouldn't receive answers

        const peer = peerConnections.current[caller];
        if (peer) {
            await peer.setRemoteDescription(answer);
        }
    };

    const handleIceCandidate = async ({ candidate, caller }) => {
        const peer = isHost ? peerConnections.current[caller] : remotePeerRef.current;
        if (peer) {
            await peer.addIceCandidate(candidate);
        }
    };

    return {
        stream,
        status,
        startStream,
        stopStream
    };
}
