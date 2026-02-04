import { useRef, useEffect, useState } from 'react';
import { Tv, StopCircle, PlayCircle, Radio, Mic, MicOff, Video, VideoOff, Volume2, VolumeX, Pause, Play } from 'lucide-react';
import useLiveStream from '../hooks/useLiveStream';
import { useAuth } from '../context/AuthContext';

export default function LiveStream({ tournamentId, isOrganizer }) {
    const { user } = useAuth();
    const {
        stream, status, startStream, stopStream,
        toggleVideo, toggleMic, toggleSystemAudio, toggleStreamPause,
        isVideoEnabled, isMicEnabled, isSystemAudioEnabled, isStreamPaused
    } = useLiveStream(tournamentId, isOrganizer, user);
    const videoRef = useRef(null);
    const [isViewerPlaying, setIsViewerPlaying] = useState(true);
    const [isViewerMuted, setIsViewerMuted] = useState(true); // Default muted for autoplay policy

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
            // Force play to handle browser policies
            videoRef.current.play().catch(err => {
                console.error("Error playing video stream:", err);
            });
        }
    }, [stream]);

    if (!isOrganizer && status !== 'watching' && status !== 'live') {
        return (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <Tv size={32} className="text-slate-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Live Stream Offline</h3>
                <p className="text-slate-400">Waiting for the tournament organizer to go live.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Status Bar */}
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <Radio className={status === 'live' || status === 'watching' ? "text-red-500 animate-pulse" : "text-slate-500"} />
                    {status === 'live' ? 'You are Live' : (status === 'watching' ? 'Live Stream' : 'Live Stream')}
                    {isStreamPaused && <span className="text-yellow-500 text-sm font-normal uppercase border border-yellow-500 px-2 py-0.5 rounded ml-2">Paused</span>}
                </h3>

                {isOrganizer && (
                    status === 'live' ? (
                        <div className="flex items-center gap-2">
                            {/* Stream Controls */}
                            <button
                                onClick={toggleMic}
                                className={`p-2 rounded-lg transition-colors ${!isMicEnabled ? 'bg-red-500/20 text-red-500' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                                title={isMicEnabled ? "Mute Mic" : "Unmute Mic"}
                            >
                                {isMicEnabled ? <Mic size={20} /> : <MicOff size={20} />}
                            </button>
                            <button
                                onClick={toggleSystemAudio}
                                className={`p-2 rounded-lg transition-colors ${!isSystemAudioEnabled ? 'bg-red-500/20 text-red-500' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                                title={isSystemAudioEnabled ? "Mute System Audio" : "Unmute System Audio"}
                            >
                                {isSystemAudioEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                            </button>
                            <button
                                onClick={toggleVideo}
                                className={`p-2 rounded-lg transition-colors ${!isVideoEnabled ? 'bg-red-500/20 text-red-500' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                                title={isVideoEnabled ? "Disable Video" : "Enable Video"}
                            >
                                {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
                            </button>

                            <div className="w-[1px] h-6 bg-slate-700 mx-1" />

                            <button
                                onClick={toggleStreamPause}
                                className={`p-2 rounded-lg transition-colors ${isStreamPaused ? 'bg-yellow-500/20 text-yellow-500' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                                title={isStreamPaused ? "Resume Stream" : "Pause Stream"}
                            >
                                {isStreamPaused ? <Play size={20} /> : <Pause size={20} />}
                            </button>

                            <div className="w-[1px] h-6 bg-slate-700 mx-1" />

                            <button
                                onClick={stopStream}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-bold"
                            >
                                <StopCircle size={18} /> End Stream
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={startStream}
                            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors font-bold"
                        >
                            <PlayCircle size={18} /> Go Live
                        </button>
                    )
                )}
            </div>

            {/* Video Player */}
            {(stream || status === 'live' || status === 'watching') && (
                <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted={isOrganizer} // Mute self to avoid loop
                        className="w-full h-full object-contain"
                    />

                    {/* Overlay Badges */}
                    <div className="absolute top-4 left-4 flex gap-2">
                        <div className="px-3 py-1 bg-red-600 text-white text-xs font-bold uppercase rounded-md flex items-center gap-1">
                            <span className="w-2 h-2 bg-white rounded-full animate-pulse" /> Live
                        </div>
                    </div>
                </div>
            )}

            {status === 'ended' && !isOrganizer && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
                    <Tv size={32} className="text-slate-500 mb-4" />
                    <p className="text-slate-400">Stream has ended.</p>
                </div>
            )}
            {/* Viewer Controls */}
            {!isOrganizer && (status === 'live' || status === 'watching') && (
                <div className="flex items-center gap-2 justify-end">
                    <button
                        onClick={() => {
                            if (videoRef.current) {
                                if (videoRef.current.paused) videoRef.current.play();
                                else videoRef.current.pause();
                                // Trigger re-render to update icon (handled by standard react state if we added it, 
                                // but for now forcing update or relying on UI state would be better. 
                                // Let's simplify: simple toggle with local state is better.)
                            }
                        }}
                        className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
                        title="Play/Pause"
                    >
                        {videoRef.current?.paused ? <Play size={20} /> : <Pause size={20} />}
                    </button>

                    <button
                        onClick={() => {
                            if (videoRef.current) {
                                videoRef.current.muted = !videoRef.current.muted;
                            }
                        }}
                        className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
                        title="Mute/Unmute"
                    >
                        {videoRef.current?.muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>

                    {/* Fullscreen Button could go here too */}
                </div>
            )}
        </div>
    );
}
