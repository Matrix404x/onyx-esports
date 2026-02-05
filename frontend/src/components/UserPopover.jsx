import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
import FriendRequestButton from './FriendRequestButton';

export default function UserPopover({ userId, username, children }) {
    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef(null);
    const triggerRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                popoverRef.current &&
                !popoverRef.current.contains(event.target) &&
                triggerRef.current &&
                !triggerRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="relative inline-block">
            <div
                ref={triggerRef}
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className="cursor-pointer"
            >
                {children}
            </div>

            {isOpen && (
                <div
                    ref={popoverRef}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute bottom-full mb-2 left-0 z-50 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-200"
                    style={{ minWidth: '200px' }}
                >
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center font-bold text-2xl text-white overflow-hidden">
                            {username?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="text-center">
                            <h3 className="font-bold text-lg text-white">{username}</h3>
                            <p className="text-xs text-slate-400">User</p>
                        </div>

                        <div className="flex flex-col w-full gap-2 mt-2">
                            <Link
                                to={`/profile/${userId}`}
                                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors border border-slate-700"
                            >
                                <User size={16} /> View Profile
                            </Link>
                            <div className="w-full flex justify-center [&>button]:w-full [&>button]:justify-center">
                                <FriendRequestButton targetUserId={userId} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
