import React from "react";
import {
    Home,
    Compass,
    UserCheck,
    MessageCircle,
    Plus,
    User
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import dp from "../assets/dp.jpg";

export default function Nav() {
    const navigate = useNavigate();
    const location = useLocation();
    const { userData, pendingRequestsCount = 0 } = useSelector((state) => state.user);

    if (!userData) return null;

    // Hide bottom navigation when in active 1-on-1 mobile chat
    const isInActiveMobileChat = location.pathname.startsWith("/messages/") && location.pathname !== "/messages";
    if (isInActiveMobileChat) return null;

    const navItems = [
        {
            label: "Feed",
            icon: (active) => <Home size={20} className={active ? "text-indigo-600 stroke-[2.5]" : "text-slate-500"} />,
            path: "/"
        },
        {
            label: "Discover",
            icon: (active) => <Compass size={20} className={active ? "text-indigo-600 stroke-[2.5]" : "text-slate-500"} />,
            path: "/discover"
        },
        {
            label: "Post",
            icon: () => <Plus size={22} className="text-white stroke-[2.5]" />,
            path: "/upload",
            isAction: true
        },
        {
            label: "Network",
            icon: (active) => <UserCheck size={20} className={active ? "text-indigo-600 stroke-[2.5]" : "text-slate-500"} />,
            path: "/requests",
            badge: pendingRequestsCount > 0 ? pendingRequestsCount : null
        },
        {
            label: "Chats",
            icon: (active) => <MessageCircle size={20} className={active ? "text-indigo-600 stroke-[2.5]" : "text-slate-500"} />,
            path: "/messages"
        },
        {
            label: "Profile",
            icon: (active) => (
                <div className={`w-5 h-5 rounded-full overflow-hidden border ${active ? "border-indigo-600 ring-2 ring-indigo-500/30" : "border-slate-300"}`}>
                    <img
                        src={userData.profileImage || dp}
                        alt=""
                        className="w-full h-full object-cover"
                    />
                </div>
            ),
            path: `/profile/${userData.userName}`
        }
    ];

    return (
        <nav
            aria-label="Mobile Navigation"
            className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-2 pt-1.5 pb-2.5 sm:pb-3 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
        >
            {navItems.map((item, idx) => {
                const isActive =
                    item.path === "/"
                        ? location.pathname === "/"
                        : location.pathname.startsWith(item.path);

                if (item.isAction) {
                    return (
                        <button
                            key={idx}
                            onClick={() => navigate(item.path)}
                            className="flex flex-col items-center justify-center -mt-5 group cursor-pointer focus:outline-none"
                            aria-label="Create Post"
                        >
                            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-300/60 active:scale-95 group-hover:scale-105 transition-all">
                                {item.icon()}
                            </div>
                            <span className="text-[10px] font-bold text-indigo-700 mt-1">
                                {item.label}
                            </span>
                        </button>
                    );
                }

                return (
                    <button
                        key={idx}
                        onClick={() => navigate(item.path)}
                        className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer relative min-w-[50px] focus:outline-none ${
                            isActive ? "text-indigo-600 font-bold" : "text-slate-500 hover:text-slate-800"
                        }`}
                        aria-label={item.label}
                    >
                        <div className="relative">
                            {item.icon(isActive)}
                            {item.badge && (
                                <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full min-w-[16px] text-center shadow-xs">
                                    {item.badge}
                                </span>
                            )}
                        </div>
                        <span
                            className={`text-[10px] tracking-tight mt-1 truncate ${
                                isActive ? "font-bold text-indigo-600" : "font-medium text-slate-500"
                            }`}
                        >
                            {item.label}
                        </span>
                    </button>
                );
            })}
        </nav>
    );
}