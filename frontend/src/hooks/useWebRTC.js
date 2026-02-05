import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { API_URL } from '../config';

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
        socket.connect();

        navigator.mediaDevices.getUserMedia({ audio: true, video: false })
            .then(stream => {
                userStream.current = stream;
                setPeers(prev => [...prev]); // Trigger re-render to expose stream

                socket.emit('join-voice', channelId);

                socket.on('user-connected', (userId) => {
                    console.log('User connected:', userId);
                    const peer = createPeer(userId, socket.id, stream);
                    peersRef.current[userId] = peer;

                    // Create Offer
                    peer.createOffer().then(offer => {
                        peer.setLocalDescription(offer);
                        socket.emit('offer', { target: userId, offer });
                    });
                });

                socket.on('offer', async ({ offer, caller }) => {
                    const peer = createPeer(caller, socket.id, stream);
                    peersRef.current[caller] = peer;
                    await peer.setRemoteDescription(offer);
                    const answer = await peer.createAnswer();
                    await peer.setLocalDescription(answer);
                    socket.emit('answer', { target: caller, answer });
                });

                socket.on('answer', async ({ answer, caller }) => {
                    const peer = peersRef.current[caller];
                    if (peer) await peer.setRemoteDescription(answer);
                });

                socket.on('ice-candidate', async ({ candidate, caller }) => {
                    const peer = peersRef.current[caller];
                    if (peer) await peer.addIceCandidate(candidate);
                });

                socket.on('user-disconnected', (userId) => {
                    if (peersRef.current[userId]) {
                        peersRef.current[userId].close();
                        delete peersRef.current[userId];
                        setPeers(prev => prev.filter(p => p.id !== userId));
                    }
                });
            })
            .catch(err => {
                console.error("Error accessing microphone:", err);
                toast.error("Could not access microphone: " + err.message + ". Please ensure you have granted permission.", { duration: 5000 });
            });

        return () => {
            socket.emit('leave-voice', channelId);
            socket.disconnect();
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
