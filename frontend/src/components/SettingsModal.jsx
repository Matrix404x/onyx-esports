import { useState, useEffect, useRef } from 'react';
import { X, User, Volume2, Mic, Activity, Upload, Save, Loader } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

export default function SettingsModal({ onClose, status, setStatus }) {
    const { user, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');

    // Voice Settings State
    const [devices, setDevices] = useState([]);
    const [selectedDevice, setSelectedDevice] = useState('');
    const [micLevel, setMicLevel] = useState(0);
    const audioContextRef = useRef(null);
    const streamRef = useRef(null);

    // Profile Edit State
    const [bio, setBio] = useState(user?.bio || '');
    const [previewImage, setPreviewImage] = useState(user?.avatar || '');
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Fetch Audio Devices
    useEffect(() => {
        navigator.mediaDevices.enumerateDevices().then(devs => {
            const inputs = devs.filter(d => d.kind === 'audioinput');
            setDevices(inputs);
            if (inputs.length > 0) setSelectedDevice(inputs[0].deviceId);
        });
    }, []);

    // Load user data when opening
    useEffect(() => {
        if (user) {
            setBio(user.bio || '');
            setPreviewImage(user.avatar || '');
        }
    }, [user]);

    // Mic Test Logic
    useEffect(() => {
        if (activeTab !== 'voice') {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
            if (audioContextRef.current) {
                audioContextRef.current.close();
                audioContextRef.current = null;
            }
            return;
        }

        const startMicTest = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: { deviceId: selectedDevice ? { exact: selectedDevice } : undefined }
                });
                streamRef.current = stream;

                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                audioContextRef.current = audioContext;
                const analyser = audioContext.createAnalyser();
                const source = audioContext.createMediaStreamSource(stream);
                const javascriptNode = audioContext.createScriptProcessor(512, 1, 1);

                analyser.smoothingTimeConstant = 0.5;
                analyser.fftSize = 1024;

                source.connect(analyser);
                analyser.connect(javascriptNode);
                javascriptNode.connect(audioContext.destination);

                javascriptNode.onaudioprocess = () => {
                    const array = new Uint8Array(analyser.frequencyBinCount);
                    analyser.getByteFrequencyData(array);
                    let values = 0;
                    for (let i = 0; i < array.length; i++) values += array[i];
                    setMicLevel(values / array.length);
                };
            } catch (err) {
                console.error("Error accessing mic for test:", err);
            }
        };

        startMicTest();

        return () => {
            if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
            if (audioContextRef.current) audioContextRef.current.close();
        };
    }, [activeTab, selectedDevice]);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            const res = await axios.post(`${API_URL}/api/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setPreviewImage(res.data.url);
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload image.");
        } finally {
            setUploading(false);
        }
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        const result = await updateUser({ bio, avatar: previewImage });
        setSaving(false);
        if (result.success) {
            onClose();
        } else {
            alert("Failed to update profile.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-4xl h-[600px] bg-slate-900 rounded-xl overflow-hidden shadow-2xl flex border border-slate-800">

                {/* Sidebar */}
                <div className="w-64 bg-slate-950 border-r border-slate-800 p-4 flex flex-col">
                    <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 px-2">User Settings</h2>
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`text-left px-3 py-2 rounded-lg mb-1 font-medium text-sm transition-colors ${activeTab === 'profile' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}
                    >
                        My Account
                    </button>

                    <div className="h-px bg-slate-800 my-4 mx-2" />

                    <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 px-2">App Settings</h2>
                    <button
                        onClick={() => setActiveTab('voice')}
                        className={`text-left px-3 py-2 rounded-lg mb-1 font-medium text-sm transition-colors ${activeTab === 'voice' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}
                    >
                        Voice & Video
                    </button>

                    <div className="mt-auto">
                        <button onClick={onClose} className="flex items-center gap-2 text-slate-400 hover:text-white px-3 py-2 transition-colors">
                            <X size={16} /> Close Esc
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-10 bg-slate-900 overflow-y-auto">
                    {/* Close Button Mobile */}
                    <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 md:hidden">
                        <X size={24} />
                    </button>

                    {activeTab === 'profile' && (
                        <div className="animate-fade-in">
                            <h2 className="text-xl font-bold text-white mb-6">My Account</h2>

                            <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-6 mb-8 border border-slate-700">
                                <div className="flex items-start gap-6">
                                    <div className="relative group">
                                        <div className="w-24 h-24 rounded-full bg-slate-700 overflow-hidden border-4 border-slate-900 shadow-xl flex items-center justify-center">
                                            {previewImage ? (
                                                <img src={previewImage} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="text-4xl font-bold text-white">{user?.username?.[0] || 'U'}</div>
                                            )}
                                        </div>
                                        <label className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                                            {uploading ? <Loader className="animate-spin text-white" /> : <Upload className="text-white" size={24} />}
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                                        </label>
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-2xl font-bold text-white">{user?.username || 'User'}</h3>
                                                <p className="text-slate-400 text-sm">#{user?.id?.slice(0, 4) || '0000'}</p>
                                            </div>
                                            <button
                                                onClick={handleSaveProfile}
                                                disabled={saving}
                                                className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 text-white text-sm font-bold rounded-md transition-colors"
                                            >
                                                {saving ? 'Saving...' : <><Save size={16} /> Save Changes</>}
                                            </button>
                                        </div>

                                        <div className="mt-4">
                                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">About Me</label>
                                            <textarea
                                                value={bio}
                                                onChange={(e) => setBio(e.target.value)}
                                                placeholder="Write something about yourself..."
                                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500 transition-colors h-24 resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="h-px bg-slate-800 mb-8" />

                            <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">Online Status</h3>
                            <div className="space-y-2">
                                {[
                                    { id: 'online', label: 'Online', color: 'bg-green-500', desc: 'Active & receiving notifications' },
                                    { id: 'idle', label: 'Idle', color: 'bg-yellow-500', desc: 'Away from keyboard' },
                                    { id: 'dnd', label: 'Do Not Disturb', color: 'bg-red-500', desc: 'Do not show desktop notifications' },
                                    { id: 'invisible', label: 'Invisible', color: 'bg-slate-500', desc: 'Appear offline but still have full access' },
                                ].map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => setStatus(option.id)}
                                        className={`w-full flex items-center p-3 rounded-lg border transition-all ${status === option.id ? 'bg-slate-800 border-slate-600' : 'border-transparent hover:bg-slate-800/50'}`}
                                    >
                                        <div className={`w-3 h-3 rounded-full mr-4 ${option.color}`} />
                                        <div className="text-left">
                                            <div className={`font-bold text-sm ${status === option.id ? 'text-white' : 'text-slate-300'}`}>{option.label}</div>
                                            <div className="text-xs text-slate-500">{option.desc}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'voice' && (
                        <div className="animate-fade-in">
                            <h2 className="text-xl font-bold text-white mb-6">Voice Settings</h2>

                            <div className="mb-8">
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Input Device</label>
                                <div className="relative">
                                    <select
                                        value={selectedDevice}
                                        onChange={(e) => setSelectedDevice(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white appearance-none focus:outline-none focus:border-cyan-500 transition-colors"
                                    >
                                        {devices.map(device => (
                                            <option key={device.deviceId} value={device.deviceId}>
                                                {device.label || `Microphone ${device.deviceId.slice(0, 5)}...`}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">▼</div>
                                </div>
                            </div>

                            <div className="h-px bg-slate-800 mb-8" />

                            <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">Mic Test</h3>
                            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
                                <p className="text-sm text-slate-400 mb-4">Speak into your microphone to verify input levels.</p>

                                <div className="h-4 bg-slate-800 rounded-full overflow-hidden relative">
                                    <div
                                        className="h-full bg-gradient-to-r from-green-500 via-yellow-400 to-red-500 transition-all duration-75 ease-out"
                                        style={{ width: `${Math.min(micLevel * 3, 100)}%` }} // Multiplier to make it more visible
                                    />
                                </div>
                                <div className="flex justify-between mt-2 text-xs text-slate-500 font-mono">
                                    <span>-60dB</span>
                                    <span>-30dB</span>
                                    <span>0dB</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
