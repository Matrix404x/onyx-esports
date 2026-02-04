import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Users, Volume2 } from 'lucide-react';
import useWebRTC from '../hooks/useWebRTC';
import { useAuth } from '../context/AuthContext';

export default function Voice() {
    const { user } = useAuth();
    const [joined, setJoined] = useState(false);
    const [muted, setMuted] = useState(false);
    const { peers, myStream } = useWebRTC(joined ? 'voice-general' : null, user);
    const [isSpeaking, setIsSpeaking] = useState(false);

    // Audio Visualizer Logic
    useEffect(() => {
        if (!myStream || muted) {
            setIsSpeaking(false);
            return;
        }

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(myStream);
        const javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

        analyser.smoothingTimeConstant = 0.8;
        analyser.fftSize = 1024;

        microphone.connect(analyser);
        analyser.connect(javascriptNode);
        javascriptNode.connect(audioContext.destination);

        javascriptNode.onaudioprocess = () => {
            const array = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(array);
            let values = 0;
            const length = array.length;
            for (let i = 0; i < length; i++) {
                values += array[i];
            }
            const average = values / length;
            setIsSpeaking(average > 10); // Threshold for visualizer
        };

        return () => {
            javascriptNode.disconnect();
            analyser.disconnect();
            microphone.disconnect();
            audioContext.close();
        }
    }, [myStream, muted]);

    const toggleMic = () => {
        if (myStream) {
            myStream.getAudioTracks().forEach(track => track.enabled = !muted); // Actually toggle track
            // Ideally track.enabled = !track.enabled, but we sync with state
            myStream.getAudioTracks().forEach(track => track.enabled = muted); // Toggle logic is reverse of state if state is 'muted'
        }
        setMuted(!muted);
    };

    // Fix actual track toggling sync
    useEffect(() => {
        if (myStream) {
            myStream.getAudioTracks().forEach(track => track.enabled = !muted);
        }
    }, [muted, myStream]);


    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-950 p-6 pt-24">
            <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold flex items-center gap-3">
                        <Volume2 className="text-cyan-400" size={32} /> Voice Channel
                    </h2>
                    <div className="px-4 py-2 bg-slate-800 rounded-full text-sm text-slate-400 flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${joined ? 'bg-green-500' : 'bg-red-500'}`} />
                        {joined ? 'Connected' : 'Disconnected'}
                    </div>
                </div>

                {!joined ? (
                    <div className="text-center py-10">
                        <p className="text-slate-400 mb-6">Join the General Voice Channel to talk with other players.</p>
                        <button
                            onClick={() => setJoined(true)}
                            className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-cyan-500/20"
                        >
                            Join Voice
                        </button>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {/* Self */}
                            <div className={`bg-slate-950 border transition-all duration-300 rounded-xl p-4 flex flex-col items-center justify-center gap-3 relative overflow-hidden group ${isSpeaking ? 'border-cyan-400 shadow-md shadow-cyan-500/20' : 'border-slate-700/50'}`}>
                                <div className={`absolute inset-0 opacity-20 transition-opacity ${muted ? 'bg-red-500/20' : 'bg-cyan-500/20 group-hover:opacity-40'}`} />
                                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-xl font-bold border-2 border-slate-700 relative z-10">
                                    {user?.username?.[0] || 'Me'}
                                </div>
                                <div className="text-center relative z-10">
                                    <p className="font-medium text-white">{user?.username || 'You'}</p>
                                    <span className={`text-xs ${isSpeaking ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}>
                                        {muted ? 'Muted' : (isSpeaking ? 'Speaking...' : 'Silent')}
                                    </span>
                                </div>
                            </div>

                            {/* Peers */}
                            {peers.map(peer => (
                                <Peer key={peer.id} peer={peer} />
                            ))}
                        </div>

                        <div className="flex justify-center border-t border-slate-800 pt-6">
                            <button
                                onClick={() => setJoined(false)}
                                className="px-6 py-3 bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-600/50 rounded-xl font-medium mr-4 transition-colors"
                            >
                                Leave Channel
                            </button>
                            <button
                                onClick={() => setMuted(!muted)}
                                className={`p-4 rounded-full border transition-all ${muted ? 'bg-red-500 text-white border-red-600' : 'bg-slate-800 text-white border-slate-700 hover:bg-slate-700'}`}
                            >
                                {muted ? <MicOff /> : <Mic />}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function Peer({ peer }) {
    const audioRef = useRef();

    useEffect(() => {
        if (audioRef.current && peer.stream) {
            audioRef.current.srcObject = peer.stream;
        }
    }, [peer.stream]);

    return (
        <div className="bg-slate-950 border border-slate-700/50 rounded-xl p-4 flex flex-col items-center justify-center gap-3 relative overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-xl font-bold border-2 border-slate-700 relative z-10 text-slate-400">
                ?
            </div>
            <p className="font-medium text-slate-300 relative z-10 text-sm">User {peer.id.slice(0, 4)}</p>
            <audio ref={audioRef} autoPlay playsInline />
        </div>
    )
}
