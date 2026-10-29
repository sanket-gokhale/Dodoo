import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";
import { setUserData } from "../redux/userSlice";
import VerifiedBadge from "./VerifiedBadge";
import dp from "../assets/dp.jpg";
import {
    ShieldCheck,
    Users,
    UserPlus,
    Check,
    Sparkles,
    ArrowRight,
    GraduationCap
} from "lucide-react";

export default function RightHome() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { userData, suggestedUsers = [] } = useSelector((state) => state.user);

    const [sentMap, setSentMap] = useState({});

    if (!userData) return null;

    // Send connection request
    const handleConnect = async (targetUserId) => {
        try {
            await axios.post(
                `${serverUrl}/api/connections/request/${targetUserId}`,
                {},
                { withCredentials: true }
            );
            setSentMap((prev) => ({ ...prev, [targetUserId]: true }));
        } catch (error) {
            console.error("Connect error:", error);
        }
    };



    return (
        <aside className="w-80 h-screen border-l border-slate-200/90 bg-white/70 backdrop-blur-md p-5 flex flex-col gap-6 hidden xl:block sticky top-0 overflow-y-auto">
            {/* Student Verification Status Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/70 border border-indigo-100 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                        <ShieldCheck size={16} />
                        College Status
                    </span>
                    <VerifiedBadge status={userData.verificationStatus} college={userData.college} size="sm" showLabel />
                </div>

                <div className="text-sm font-bold text-slate-800 truncate mb-0.5">
                    {userData.college || "No College Added"}
                </div>
                <div className="text-xs text-slate-500 mb-3 truncate">
                    {userData.degree ? `${userData.degree} • ${userData.year || ""}` : "Update your academic details"}
                </div>

                <button
                    onClick={() => navigate("/verification")}
                    className="w-full py-2 px-3 text-xs font-semibold rounded-xl bg-white hover:bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center gap-1 transition-all cursor-pointer shadow-2xs"
                >
                    <span>{userData.verificationStatus === "Verified" ? "View College Badge" : "Verify College Member"}</span>
                    <ArrowRight size={13} />
                </button>
            </div>

            {/* Suggested Classmates & Teammates */}
            <div>
                <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                        <Users size={16} className="text-indigo-600" />
                        <span>Find Classmates</span>
                    </h3>
                    <button
                        onClick={() => navigate("/discover")}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                    >
                        View All
                    </button>
                </div>

                <div className="space-y-3">
                    {suggestedUsers && suggestedUsers.slice(0, 4).map((user) => {
                        const isConnected = userData.connections?.some(
                            (id) => (typeof id === "string" ? id : id._id)?.toString() === user._id.toString()
                        );
                        const isSent = sentMap[user._id];

                        return (
                            <div
                                key={user._id}
                                className="p-3 rounded-xl bg-slate-50/70 hover:bg-slate-100/80 border border-slate-200/60 transition-all flex items-center justify-between gap-2"
                            >
                                <div
                                    onClick={() => navigate(`/profile/${user.userName}`)}
                                    className="flex items-center gap-2.5 overflow-hidden cursor-pointer flex-1"
                                >
                                    <img
                                        src={user.profileImage || dp}
                                        alt={user.name}
                                        className="w-9 h-9 rounded-full object-cover border border-slate-200"
                                    />
                                    <div className="overflow-hidden">
                                        <div className="flex items-center gap-1">
                                            <span className="text-xs font-bold text-slate-800 truncate">
                                                {user.name}
                                            </span>
                                            {user.verificationStatus === "Verified" && (
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            )}
                                        </div>
                                        <span className="text-[11px] text-slate-500 block truncate">
                                            {user.college || `@${user.userName}`}
                                        </span>
                                    </div>
                                </div>

                                {isConnected ? (
                                    <span className="text-[11px] text-emerald-600 font-semibold px-2 py-1 bg-emerald-50 rounded-lg">
                                        Connected
                                    </span>
                                ) : isSent ? (
                                    <span className="text-[11px] text-indigo-600 font-medium px-2 py-1 bg-indigo-50 rounded-lg">
                                        Requested
                                    </span>
                                ) : (
                                    <button
                                        onClick={() => handleConnect(user._id)}
                                        className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors cursor-pointer"
                                        title="Send connection request"
                                    >
                                        <UserPlus size={14} />
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Campus Safety & Privacy Guidelines */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-md">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider mb-2">
                    <ShieldCheck size={16} />
                    <span>Campus Community Safety</span>
                </div>
                <div className="space-y-2.5 text-[11px] text-slate-300">
                    <div className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>Official verification badges are confirmed through college domain or ID review.</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>Private messaging unlocks strictly after mutual connection acceptance.</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>Reddit-style comment privacy: collapse, hide locally, or report inappropriate posts.</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}