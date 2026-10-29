import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    GraduationCap,
    ArrowLeft,
    MessageCircle,
    UserCheck,
    Search,
    ShieldCheck
} from "lucide-react";
import VerifiedBadge from "./VerifiedBadge";
import dp from "../assets/dp.jpg";

export default function MobileTopBar({
    title = "Dodoo Campus",
    subtitle = "",
    showBack = false,
    onBack,
    rightAction = null
}) {
    const navigate = useNavigate();
    const location = useLocation();
    const { userData, pendingRequestsCount = 0 } = useSelector((state) => state.user);

    const handleBackClick = () => {
        if (onBack) {
            onBack();
        } else {
            navigate(-1);
        }
    };

    return (
        <header className="lg:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md px-4 py-2.5 border-b border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between gap-3">
                {/* Left: Back button or Brand logo */}
                <div className="flex items-center gap-2.5 min-w-0">
                    {showBack ? (
                        <button
                            onClick={handleBackClick}
                            className="p-1.5 -ml-1 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shrink-0"
                            aria-label="Go back"
                        >
                            <ArrowLeft size={20} />
                        </button>
                    ) : (
                        <div
                            onClick={() => navigate("/")}
                            className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-100 shrink-0 cursor-pointer"
                        >
                            <GraduationCap size={20} />
                        </div>
                    )}

                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                            <h1 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight truncate leading-tight">
                                {title}
                            </h1>
                            {!showBack && userData?.verificationStatus === "Verified" && (
                                <span className="shrink-0">
                                    <VerifiedBadge status="Verified" size="sm" />
                                </span>
                            )}
                        </div>
                        {subtitle ? (
                            <p className="text-[11px] text-slate-500 truncate leading-none mt-0.5">
                                {subtitle}
                            </p>
                        ) : !showBack && userData?.college ? (
                            <p className="text-[11px] text-indigo-600 font-medium truncate leading-none mt-0.5">
                                {userData.college}
                            </p>
                        ) : null}
                    </div>
                </div>

                {/* Right: Quick action shortcuts */}
                <div className="flex items-center gap-1 shrink-0">
                    {rightAction ? (
                        rightAction
                    ) : (
                        <>
                            {/* Discover / Search shortcut */}
                            {location.pathname !== "/discover" && (
                                <button
                                    onClick={() => navigate("/discover")}
                                    className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100/80 rounded-xl transition-colors cursor-pointer"
                                    title="Discover students"
                                >
                                    <Search size={19} />
                                </button>
                            )}

                            {/* Requests shortcut with badge */}
                            {location.pathname !== "/requests" && (
                                <button
                                    onClick={() => navigate("/requests")}
                                    className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100/80 rounded-xl transition-colors cursor-pointer relative"
                                    title="Connection requests"
                                >
                                    <UserCheck size={19} />
                                    {pendingRequestsCount > 0 && (
                                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse ring-2 ring-white" />
                                    )}
                                </button>
                            )}

                            {/* Messages shortcut */}
                            {location.pathname !== "/messages" && !location.pathname.startsWith("/messages/") && (
                                <button
                                    onClick={() => navigate("/messages")}
                                    className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100/80 rounded-xl transition-colors cursor-pointer"
                                    title="Direct messages"
                                >
                                    <MessageCircle size={19} />
                                </button>
                            )}

                            {/* User Avatar */}
                            {userData && (
                                <button
                                    onClick={() => navigate(`/profile/${userData.userName}`)}
                                    className="ml-1 p-0.5 rounded-full border border-slate-300 hover:border-indigo-500 transition-colors cursor-pointer"
                                    title="Your Profile"
                                >
                                    <img
                                        src={userData.profileImage || dp}
                                        alt={userData.name}
                                        className="w-7 h-7 rounded-full object-cover"
                                    />
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
