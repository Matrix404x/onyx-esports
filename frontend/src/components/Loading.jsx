import { Loader2 } from 'lucide-react';

export default function Loading({ fullScreen = true, text = "Loading..." }) {
    const content = (
        <div className="flex flex-col items-center justify-center gap-4">
            <div className="relative">
                {/* Outer pulsing ring */}
                <div className="absolute inset-0 bg-cyan-500 rounded-full animate-ping opacity-20"></div>

                {/* Rotating gradient ring */}
                <div className="w-16 h-16 rounded-full border-4 border-slate-800 border-t-cyan-500 border-r-blue-600 animate-spin shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>

                {/* Inner Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse shadow-[0_0_10px_white]"></div>
                </div>
            </div>

            <div className="flex flex-col items-center gap-1">
                <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent animate-pulse tracking-wider">
                    {text}
                </span>
                <span className="text-xs text-slate-500 uppercase tracking-[0.2em] animate-pulse delay-75">
                    Please Wait
                </span>
            </div>
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-slate-950 flex items-center justify-center z-50 backdrop-blur-sm">
                {content}
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center p-8">
            {content}
        </div>
    );
}
