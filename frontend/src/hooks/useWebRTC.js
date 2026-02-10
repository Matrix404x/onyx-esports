import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { API_URL } from '../config';
import toast from 'react-hot-toast';

const socket = io(API_URL, { autoConnect: false });

export default function useWebRTC(channelId, user) {
    const [peers, setPeers] = useState([]);
    const userStream = useRef(null);
    const peersRef = useRef({}); // { userId: RTCPeerConnection }
    const [, forceUpdate] = useState();

    useEffect(() => {
        if (!channelId || !user) {
            console.log("WebRTC Hook: Missing channelId or user", { channelId, user });
            return;
        }

        console.log("WebRTC Hook: Initializing...");
        if (!socket.connected) {
            socket.connect();
        }

        let localStream = null;

        const handleUserConnected = (userId) => {
            console.log('User connected:', userId);
            // Close existing if any (avoid stale state)
            if (peersRef.current[userId]) {
                peersRef.current[userId].close();
            }

            const peer = createPeer(userId, socket.id, localStream);
            peersRef.current[userId] = peer;

            peer.createOffer().then(offer => {
                peer.setLocalDescription(offer);
                socket.emit('offer', { target: userId, offer });
            });
        };

        const handleOffer = async ({ offer, caller }) => {
            // Close existing if any
            if (peersRef.current[caller]) {
                peersRef.current[caller].close();
            }

            const peer = createPeer(caller, socket.id, localStream);
            peersRef.current[caller] = peer;

            await peer.setRemoteDescription(offer);
            const answer = await peer.createAnswer();
            await peer.setLocalDescription(answer);
            socket.emit('answer', { target: caller, answer });
        };

        const handleAnswer = async ({ answer, caller }) => {
            const peer = peersRef.current[caller];
            if (peer) {
                // Check state before setting remote desc to avoid "stable" error
                if (peer.signalingState !== 'stable') {
                    await peer.setRemoteDescription(answer);
                }
            }
        };

        const handleIceCandidate = async ({ candidate, caller }) => {
            const peer = peersRef.current[caller];
            if (peer) await peer.addIceCandidate(candidate);
        };

        const handleUserDisconnected = (userId) => {
            if (peersRef.current[userId]) {
                peersRef.current[userId].close();
                delete peersRef.current[userId];
                setPeers(prev => prev.filter(p => p.id !== userId));
            }
        };

        navigator.mediaDevices.getUserMedia({ audio: true, video: false })
            .then(stream => {
                userStream.current = stream;
                localStream = stream; // closure reference for handlers
                setPeers(prev => [...prev]);

                socket.emit('join-voice', channelId);

                socket.on('user-connected', handleUserConnected);
                socket.on('offer', handleOffer);
                socket.on('answer', handleAnswer);
                socket.on('ice-candidate', handleIceCandidate);
                socket.on('user-disconnected', handleUserDisconnected);
            })
            .catch(err => {
                console.error("Error accessing microphone:", err);
                toast.error("Could not access microphone: " + err.message, { duration: 5000 });
            });

        return () => {
            socket.off('user-connected', handleUserConnected);
            socket.off('offer', handleOffer);
            socket.off('answer', handleAnswer);
            socket.off('ice-candidate', handleIceCandidate);
            socket.off('user-disconnected', handleUserDisconnected);

            socket.emit('leave-voice', channelId);
            // socket.disconnect(); // Keep connection alive if shared? Or disconnect? 
            // Better to disconnect if this is the only use.
            // But if we navigate away, we want to stop.
            // Let's keep existing disconnect behavior but careful about reuse
            // socket.disconnect(); 

            if (userStream.current) {
                userStream.current.getTracks().forEach(track => track.stop());
            }
            Object.values(peersRef.current).forEach(peer => peer.close());
            peersRef.current = {};
            setPeers([]);
        }
    }, [channelId]);

    function createPeer(targetId, myId, stream) {
        const peer = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        stream.getTracks().forEach(track => peer.addTrack(track, stream));

        peer.onicecandidate = (e) => {
            if (e.candidate) {
                socket.emit('ice-candidate', { target: targetId, candidate: e.candidate });
            }
        };

        peer.ontrack = (e) => {
            setPeers(prev => {
                if (!prev.find(p => p.id === targetId)) {
                    return [...prev, { id: targetId, stream: e.streams[0] }]
                }
                return prev;
            });
        };

        return peer;
    }

    return { peers, myStream: userStream.current };
}
