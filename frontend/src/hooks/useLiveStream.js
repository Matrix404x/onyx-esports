import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { API_URL } from '../config';
import toast from 'react-hot-toast';

// Use a singleton socket connection if possible, or new one. 
// For now, let's assume we reuse the one from useWebRTC or create a new one.
// To avoid conflicts, let's create a new one for now as it's cleaner for this feature.
const socket = io(API_URL, { autoConnect: false });

export default function useLiveStream(tournamentId, isHost, user) {
    const [stream, setStream] = useState(null);
    const [status, setStatus] = useState('idle'); // idle, live, watching, ended
    const [viewerCount, setViewerCount] = useState(0);
    // Debug State
    const [debugInfo, setDebugInfo] = useState({
        role: isHost ? 'Host' : 'Viewer',
        audioTracks: 0,
        videoTracks: 0,
        peerConnectionState: 'new',
        logs: []
    });

    const addLog = (msg) => {
        console.log(msg); // Keep console log
        setDebugInfo(prev => ({ ...prev, logs: [...prev.logs.slice(-4), msg] }));
    };

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

    const audioContextRef = useRef(null);
    const audioDestinationRef = useRef(null);

    const startStream = async () => {
        try {
            // 1. Get Screen Share (Video + System Audio)
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    cursor: "always",
                    frameRate: { max: 24, ideal: 24 }, // Lower FPS to 24 (cinematic) to save CPU
                    width: { max: 854, ideal: 854 },   // Lower to 480p
                    height: { max: 480, ideal: 480 }
                },
                audio: {
                    echoCancellation: false, // Disable EC on system audio to prevent quality loss
                    autoGainControl: false,
                    noiseSuppression: false,
                    sampleRate: 44100
                }
            });
            screenStreamRef.current = screenStream; // Store ref for toggling/cleanup

            // CHECK: Did we actually get an audio track?
            if (screenStream.getAudioTracks().length === 0) {
                toast("WARNING: No System Audio detected!\n\n1. Make sure you checked the 'Share system audio' box.\n2. For best results, share a Chrome TAB (like YouTube), not a Window.", {
                    icon: '⚠️',
                    duration: 6000,
                    style: {
                        borderRadius: '10px',
                        background: '#333',
                        color: '#fff',
                    },
                });
            }

            // 2. Get Microphone (User Voice)
            let micStream;
            try {
                micStream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true
                    }
                });
            } catch (micErr) {
                console.warn("Microphone access denied or not available", micErr);
            }
            if (micStream) {
                micStreamRef.current = micStream; // Store ref for toggling/cleanup
            }

            // 3. Mix Audio Sources
            const ac = new (window.AudioContext || window.webkitAudioContext)();
            addLog(`AudioContext: ${ac.state}`);
            audioContextRef.current = ac;
            if (ac.state === 'suspended') {
                await ac.resume();
                addLog(`AudioContext Resumed: ${ac.state}`);
            }
            const dest = ac.createMediaStreamDestination();
            audioDestinationRef.current = dest;

            // Add Screen Audio to Mix
            if (screenStream.getAudioTracks().length > 0) {
                addLog("Mixing: Added Screen Audio");
                const screenSource = ac.createMediaStreamSource(screenStream);
                const screenGain = ac.createGain();
                screenGain.gain.value = 1; // Default Unmuted
                screenSource.connect(screenGain).connect(dest);
                screenGainNodeRef.current = screenGain;
            } else {
                addLog("Mixing: NO Screen Audio Found");
            }

            // Add Mic Audio to Mix
            if (micStream && micStream.getAudioTracks().length > 0) {
                addLog("Mixing: Added Mic Audio");
                const micSource = ac.createMediaStreamSource(micStream);
                const micGain = ac.createGain();
                micGain.gain.value = 1; // Default Unmuted
                micSource.connect(micGain).connect(dest);
                micGainNodeRef.current = micGain;
            }

            // 4. Create Final Mixed Stream
            const mixedStream = new MediaStream();
            // Add Video
            screenStream.getVideoTracks().forEach(track => mixedStream.addTrack(track));
            // Add Mixed Audio
            const mixedAudioTracks = dest.stream.getAudioTracks();
            if (mixedAudioTracks.length > 0) {
                addLog("Final: Added Mixed Audio");
                mixedStream.addTrack(mixedAudioTracks[0]);
            } else if (screenStream.getAudioTracks().length > 0) {
                // Fallback if mixing failed for some reason
                addLog("Final: Fallback to Screen Audio");
                mixedStream.addTrack(screenStream.getAudioTracks()[0]);
            } else {
                addLog("Final: NO AUDIO TRACKS!");
            }

            localStreamRef.current = mixedStream;
            setStream(mixedStream);
            setDebugInfo(prev => ({
                ...prev,
                audioTracks: mixedStream.getAudioTracks().length,
                videoTracks: mixedStream.getVideoTracks().length
            }));
            setStatus('live');

            socket.emit('start-stream', tournamentId);

            // Handle stream stop via browser UI
            screenStream.getVideoTracks()[0].onended = () => {
                stopStream();
                // Also stop mic tracks
                if (micStream) micStream.getTracks().forEach(t => t.stop());
            };

        } catch (err) {
            console.error("Error starting stream:", err);
            alert("Could not start screen share. Please allow permissions.");
        }
    };

    const stopStream = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }

        // Stop Screen Stream Source
        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach(track => track.stop());
            screenStreamRef.current = null;
        }

        // Stop Mic Stream Source
        if (micStreamRef.current) {
            micStreamRef.current.getTracks().forEach(track => track.stop());
            micStreamRef.current = null;
        }

        // Clean up Audio Context
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        audioDestinationRef.current = null;

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
            console.log(`Adding track to peer ${viewerId}: kind=${track.kind}, enabled=${track.enabled}, muted=${track.muted}, id=${track.id}`);
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
                const track = e.track;
                addLog(`Rx Track: ${track.kind} (${track.id.slice(0, 4)}..)`);

                // If this is an audio track, notify user
                if (track.kind === 'audio') {
                    toast.success("Audio Connected! 🔊", { id: 'audio-connected' });
                }

                // Important: Use the stream that wraps these tracks
                const remoteStream = e.streams[0];

                if (remoteStream) {
                    setStream(remoteStream);
                    setStatus('watching');

                    setDebugInfo(prev => ({
                        ...prev,
                        audioTracks: remoteStream.getAudioTracks().length,
                        videoTracks: remoteStream.getVideoTracks().length
                    }));

                    // Force update of tracks if they arrive late
                    remoteStream.onaddtrack = (evt) => {
                        addLog(`Rx Late Track: ${evt.track.kind}`);
                        setStream(new MediaStream(remoteStream.getTracks())); // Force new reference
                        setDebugInfo(prev => ({
                            ...prev,
                            audioTracks: remoteStream.getAudioTracks().length + 1, // approx
                            videoTracks: remoteStream.getVideoTracks().length
                        }));
                    };
                }
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

    // --- Stream Controls ---
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isMicEnabled, setIsMicEnabled] = useState(true);
    const [isSystemAudioEnabled, setIsSystemAudioEnabled] = useState(true);

    // Refs to hold source streams for independent toggling
    const micStreamRef = useRef(null);
    const screenStreamRef = useRef(null);

    // Gain Nodes for mixing control
    const micGainNodeRef = useRef(null);
    const screenGainNodeRef = useRef(null);

    const toggleVideo = () => {
        if (localStreamRef.current) {
            const videoTracks = localStreamRef.current.getVideoTracks();
            videoTracks.forEach(track => {
                track.enabled = !isVideoEnabled;
            });
            setIsVideoEnabled(!isVideoEnabled);
        }
    };

    const toggleMic = () => {
        const newEnabled = !isMicEnabled;
        // 1. Toggle via GainNode (Mixing)
        if (micGainNodeRef.current) {
            micGainNodeRef.current.gain.value = newEnabled ? 1 : 0;
        }
        // 2. Toggle via Track (Fallback/Indicator)
        if (micStreamRef.current) {
            micStreamRef.current.getAudioTracks().forEach(t => t.enabled = newEnabled);
        }
        setIsMicEnabled(newEnabled);
    };

    const toggleSystemAudio = () => {
        const newEnabled = !isSystemAudioEnabled;
        // 1. Toggle via GainNode (Mixing)
        if (screenGainNodeRef.current) {
            screenGainNodeRef.current.gain.value = newEnabled ? 1 : 0;
        }
        // 2. Toggle via Track (Fallback/Indicator)
        if (screenStreamRef.current) {
            screenStreamRef.current.getAudioTracks().forEach(t => t.enabled = newEnabled);
        }
        setIsSystemAudioEnabled(newEnabled);
    };

    return {
        stream,
        status,
        startStream,
        stopStream,
        toggleVideo,
        toggleMic,
        toggleSystemAudio,
        isVideoEnabled,
        isMicEnabled,
        isSystemAudioEnabled,
        debugInfo
    };
};
}
