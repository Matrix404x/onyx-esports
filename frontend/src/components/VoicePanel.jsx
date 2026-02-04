import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, PhoneOff } from 'lucide-react';
import useWebRTC from '../hooks/useWebRTC';

export default function VoicePanel({ channelId, user, onLeave }) {
    const [muted, setMuted] = useState(false);
    const { peers, myStream } = useWebRTC(channelId, user);
    const [isSpeaking, setIsSpeaking] = useState(false);

    // Audio Visualizer Logic (Simplified for Panel)
    useEffect(() => {
        if (!myStream || muted) {
            setIsSpeaking(false);
            return;
        }

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(myStream);
        const javascriptNode = audioContext.createScriptProcessor(512, 1, 1);

        analyser.smoothingTimeConstant = 0.5;
        analyser.fftSize = 256;

        microphone.connect(analyser);
        analyser.connect(javascriptNode);
        javascriptNode.connect(audioContext.destination);

        javascriptNode.onaudioprocess = () => {
            const array = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(array);
            let values = 0;
            for (let i = 0; i < array.length; i++) {
                values += array[i];
            }
            const average = values / array.length;
            setIsSpeaking(average > 15);
        };

        return () => {
            javascriptNode.disconnect();
            analyser.disconnect();
            microphone.disconnect();
            audioContext.close();
        }
    }, [myStream, muted]);

    // Mute Toggle Logic
    useEffect(() => {
        if (myStream) {
            myStream.getAudioTracks().forEach(track => track.enabled = !muted);
        }
    }, [muted, myStream]);

    return (
        <div className="bg-slate-900 border-t border-slate-800 p-3">
            <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-green-500 text-xs font-bold uppercase tracking-wider">
                    <Volume2 size={14} /> Voice Connected
                </div>
                <div className="text-xs text-slate-500 font-medium">
                    {channelId} / {peers.length + 1} users
                </div>
            </div>

            {/* Users Grid */}
            <div className="flex flex-wrap gap-2 mb-3 max-h-32 overflow-y-auto custom-scrollbar">
                {/* Me */}
                <div className="relative group">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${isSpeaking ? 'border-green-500 text-white shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'border-slate-700 text-slate-400 bg-slate-800'}`}>
                        {user?.username?.[0] || 'Me'}
                    </div>
                    {muted && <div className="absolute -bottom-1 -right-1 bg-slate-900 rounded-full p-0.5 border border-slate-700"><MicOff size={10} className="text-red-500" /></div>}
                </div>

                {/* Peers */}
                {peers.map(peer => (
                    <Peer key={peer.id} peer={peer} />
                ))}
            </div>

            {/* Controls */}
            <div className="flex gap-2">
                <button
                    onClick={() => setMuted(!muted)}
                    className={`flex-1 py-2 rounded-lg flex items-center justify-center transition-colors ${muted ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'}`}
                >
                    {muted ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
                <button
                    onClick={onLeave}
                    className="flex-1 py-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors"
                    title="Disconnect"
                >
                    <PhoneOff size={18} />
                </button>
            </div>
        </div>
    );
}

function Peer({ peer }) {
    const audioRef = useRef();

    useEffect(() => {
        if (audioRef.current && peer.stream) {
            audioRef.current.srcObject = peer.stream;
            // Explicitly play audio to bypass potential autoplay blocks
            audioRef.current.play().catch(err => {
                console.error("Failed to play audio:", err);
            });
        }
    }, [peer.stream]);

    return (
        <div className="relative group">
            <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center font-bold text-sm text-slate-400">
                ?
            </div>
            {/* Audio Element Hidden */}
            <audio ref={audioRef} autoPlay playsInline controls={false} className="hidden" />
        </div>
    )
}
