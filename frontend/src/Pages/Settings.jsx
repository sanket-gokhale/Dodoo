import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../App";
import { setUserData, resetHiddenComments } from "../redux/userSlice";
import Sidebar from "../components/Sidebar";
import RightHome from "../components/RightHome";
import Nav from "../components/Nav";
import MobileTopBar from "../components/MobileTopBar";
import dp from "../assets/dp.jpg";
import {
    Settings as SettingsIcon,
    Shield,
    Ban,
    EyeOff,
    Eye,
    Lock,
    LogOut,
    Check,
    RefreshCw,
    UserX,
    UserCheck,
    Globe
} from "lucide-react";

export default function Settings() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { userData, hiddenComments = [] } = useSelector((state) => state.user);

    const [blockedList, setBlockedList] = useState([]);
    const [loadingBlocked, setLoadingBlocked] = useState(true);
    const [toast, setToast] = useState("");
    const [profileVisibility, setProfileVisibility] = useState(userData?.profileVisibility || "public");

    // Privacy toggles state
    const [privacySettings, setPrivacySettings] = useState({
        onlyVerifiedRequests: userData?.privacySettings?.onlyVerifiedRequests ?? false,
        showCollegePublicly: userData?.privacySettings?.showCollegePublicly ?? true,
        notifyOnMessage: userData?.privacySettings?.notifyOnMessage ?? true
    });

    const fetchBlockedUsers = async () => {
        setLoadingBlocked(true);
        try {
            const res = await axios.get(`${serverUrl}/api/user/blocked`, { withCredentials: true });
            setBlockedList(res.data);
        } catch (error) {
            console.error("Fetch blocked error:", error);
        } finally {
            setLoadingBlocked(false);
        }
    };

    useEffect(() => {
        fetchBlockedUsers();
    }, []);

    // Save Privacy & Visibility Settings to Backend
    const handleSavePrivacy = async (updatedVisibility, updatedSettings) => {
        const vis = updatedVisibility !== undefined ? updatedVisibility : profileVisibility;
        const sett = updatedSettings !== undefined ? updatedSettings : privacySettings;

        try {
            const res = await axios.put(
                `${serverUrl}/api/user/privacy`,
                { profileVisibility: vis, privacySettings: sett },
                { withCredentials: true }
            );
            dispatch(setUserData(res.data.user));
            setToast("Privacy settings saved successfully.");
            setTimeout(() => setToast(""), 3500);
        } catch (error) {
            console.error("Save privacy error:", error);
        }
    };

    const handleUnblock = async (targetUserId, name) => {
        try {
            await axios.post(`${serverUrl}/api/user/unblock/${targetUserId}`, {}, { withCredentials: true });
            setToast(`Unblocked ${name}`);
            setTimeout(() => setToast(""), 3500);
            fetchBlockedUsers();
        } catch (error) {
            console.error("Unblock error:", error);
        }
    };

    const handleResetHidden = () => {
        dispatch(resetHiddenComments());
        setToast("Locally hidden comments reset. All comments are now visible.");
        setTimeout(() => setToast(""), 3500);
    };

    const handleLogOut = async () => {
        try {
            await axios.get(`${serverUrl}/api/auth/signout`, { withCredentials: true });
            dispatch(setUserData(null));
            navigate("/signin");
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    return (
        <div className="w-full min-h-screen bg-slate-50 flex justify-center">
            <Sidebar />

            <main className="flex-1 min-h-screen max-w-3xl w-full border-r border-slate-200/80 pb-24 lg:pb-12 bg-white">
                {/* Mobile Top Navigation */}
                <MobileTopBar title="Settings" subtitle="Privacy & Account" showBack />

                {/* Desktop Header */}
                <div className="hidden lg:block p-5 sm:p-6 border-b border-slate-200">
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <SettingsIcon className="text-indigo-600" size={26} />
                        <span>Settings & Privacy Controls</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Step 8: Manage privacy, block users, report content, and control profile visibility
                    </p>
                </div>

                {toast && (
                    <div className="mx-5 sm:mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-between shadow-2xs">
                        <span>{toast}</span>
                        <button onClick={() => setToast("")} className="text-emerald-600 font-bold ml-2">
                            ✕
                        </button>
                    </div>
                )}

                <div className="p-5 sm:p-6 space-y-8">
                    {/* Profile Visibility Controls */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm sm:text-base border-b border-slate-100 pb-2">
                            <Globe className="text-indigo-600" size={18} />
                            <span>Profile Visibility</span>
                        </div>
                        <p className="text-xs text-slate-500">
                            Determine who can view your academic profile, project skills, and course information:
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            {[
                                {
                                    value: "public",
                                    label: "Public (All)",
                                    desc: "Visible to all verified & registered students"
                                },
                                {
                                    value: "campus_only",
                                    label: "Campus Only",
                                    desc: "Visible only to students at your university"
                                },
                                {
                                    value: "connections_only",
                                    label: "Connections Only",
                                    desc: "Visible strictly to accepted mutual connections"
                                }
                            ].map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => {
                                        setProfileVisibility(opt.value);
                                        handleSavePrivacy(opt.value, privacySettings);
                                    }}
                                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                                        profileVisibility === opt.value
                                            ? "border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20"
                                            : "border-slate-200 hover:bg-slate-50"
                                    }`}
                                >
                                    <div className="font-bold text-xs sm:text-sm text-slate-900 mb-1">
                                        {opt.label}
                                    </div>
                                    <div className="text-[11px] text-slate-500 leading-snug">
                                        {opt.desc}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Privacy & Safety Settings */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm sm:text-base border-b border-slate-100 pb-2">
                            <Shield className="text-indigo-600" size={18} />
                            <span>Privacy & Safety Preferences</span>
                        </div>

                        <div className="space-y-3">
                            <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 cursor-pointer">
                                <div>
                                    <div className="text-xs sm:text-sm font-bold text-slate-800">
                                        Verified Connection Preference
                                    </div>
                                    <div className="text-[11px] text-slate-500">
                                        Highlight connection requests coming from verified college students
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={privacySettings.onlyVerifiedRequests}
                                    onChange={(e) => {
                                        const newSettings = { ...privacySettings, onlyVerifiedRequests: e.target.checked };
                                        setPrivacySettings(newSettings);
                                        handleSavePrivacy(profileVisibility, newSettings);
                                    }}
                                    className="w-4 h-4 text-indigo-600 rounded"
                                />
                            </label>

                            <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 cursor-pointer">
                                <div>
                                    <div className="text-xs sm:text-sm font-bold text-slate-800">
                                        Public College Badge
                                    </div>
                                    <div className="text-[11px] text-slate-500">
                                        Display your college verification badge publicly on posts and search
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={privacySettings.showCollegePublicly}
                                    onChange={(e) => {
                                        const newSettings = { ...privacySettings, showCollegePublicly: e.target.checked };
                                        setPrivacySettings(newSettings);
                                        handleSavePrivacy(profileVisibility, newSettings);
                                    }}
                                    className="w-4 h-4 text-indigo-600 rounded"
                                />
                            </label>

                            <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 cursor-pointer">
                                <div>
                                    <div className="text-xs sm:text-sm font-bold text-slate-800">
                                        Message Protection Rule
                                    </div>
                                    <div className="text-[11px] text-slate-500">
                                        Private messaging locked strictly to mutual accepted connections
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={true}
                                    disabled
                                    className="w-4 h-4 text-indigo-600 rounded opacity-60 cursor-not-allowed"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Blocked Users Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm sm:text-base">
                                <Ban className="text-rose-600" size={18} />
                                <span>Blocked Members ({blockedList.length})</span>
                            </div>
                        </div>

                        <p className="text-xs text-slate-500">
                            Blocked members cannot see your profile, your posts, or send you connection requests.
                        </p>

                        {loadingBlocked ? (
                            <div className="p-4 text-center text-xs text-slate-400">Loading blocked list...</div>
                        ) : blockedList.length === 0 ? (
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                                You haven't blocked any members.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {blockedList.map((blockedUser) => (
                                    <div
                                        key={blockedUser._id}
                                        className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <img
                                                src={blockedUser.profileImage || dp}
                                                alt=""
                                                className="w-8 h-8 rounded-full object-cover border"
                                            />
                                            <div>
                                                <span className="font-bold text-xs text-slate-800 block">
                                                    {blockedUser.name}
                                                </span>
                                                <span className="text-[10px] text-slate-400 block">
                                                    @{blockedUser.userName}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleUnblock(blockedUser._id, blockedUser.name)}
                                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
                                        >
                                            Unblock
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Comment Moderation / Locally Hidden Comments */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm sm:text-base border-b border-slate-100 pb-2">
                            <EyeOff className="text-indigo-600" size={18} />
                            <span>Comment Preferences & Hidden Threads</span>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <div className="text-xs sm:text-sm font-bold text-slate-800">
                                    Locally Hidden Comments
                                </div>
                                <div className="text-[11px] text-slate-500">
                                    You have hidden {hiddenComments.length} comment{hiddenComments.length === 1 ? "" : "s"} locally on your device.
                                </div>
                            </div>

                            <button
                                onClick={handleResetHidden}
                                disabled={hiddenComments.length === 0}
                                className="px-3.5 py-1.5 bg-white hover:bg-indigo-50 border border-slate-200 text-slate-700 hover:text-indigo-600 disabled:opacity-40 text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-2xs shrink-0"
                            >
                                Reset All Hidden Comments
                            </button>
                        </div>
                    </div>

                    {/* Account Session & Sign Out */}
                    <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="text-xs font-bold text-slate-700">Signed in as:</div>
                            <div className="text-sm font-bold text-slate-900">
                                {userData?.name} (@{userData?.userName})
                            </div>
                            <div className="text-xs text-slate-400">{userData?.email}</div>
                        </div>

                        <button
                            onClick={handleLogOut}
                            className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                        >
                            <LogOut size={16} />
                            <span>Sign Out of Dodoo</span>
                        </button>
                    </div>
                </div>
            </main>

            <RightHome />
            <Nav />
        </div>
    );
}
