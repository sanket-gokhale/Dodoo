import React from "react";
import {
    Home,
    Compass,
    UserCheck,
    MessageCircle,
    ShieldCheck,
    User,
    Settings,
    Plus,
    LogOut,
    GraduationCap
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { serverUrl } from "../App";
import { setUserData } from "../redux/userSlice";
import VerifiedBadge from "./VerifiedBadge";
import dp from "../assets/dp.jpg";

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { userData, pendingRequestsCount = 0 } = useSelector((state) => state.user);

    const handleLogOut = async () => {
        try {
            await axios.get(`${serverUrl}/api/auth/signout`, { withCredentials: true });
            dispatch(setUserData(null));
            navigate("/signin");
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    if (!userData) return null;

    const navItems = [
        { icon: <Home size={20} />, label: "Home Feed", path: "/" },
        { icon: <Compass size={20} />, label: "Discover", path: "/discover" },
        {
            icon: <UserCheck size={20} />,
            label: "Requests",
            path: "/requests",
            badge: pendingRequestsCount > 0 ? pendingRequestsCount : null
        },
        { icon: <MessageCircle size={20} />, label: "Messages", path: "/messages" },
        {
            icon: <ShieldCheck size={20} />,
            label: "Verification",
            path: "/verification",
            statusBadge: userData.verificationStatus
        },
        { icon: <User size={20} />, label: "My Profile", path: `/profile/${userData.userName}` },
        { icon: <Settings size={20} />, label: "Settings", path: "/settings" }
    ];

    return (
        <aside className="w-64 h-screen border-r border-slate-200/90 bg-white/95 backdrop-blur-md px-4 py-5 flex-col justify-between hidden lg:flex sticky top-0 z-40 select-none">
            {/* Logo & Brand Header */}
            <div>
                <div
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2.5 px-3 mb-6 cursor-pointer group"
                >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
                        <GraduationCap size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
                            Dodoo
                        </h1>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Campus Network
                        </p>
                    </div>
                </div>

                {/* Create Post Button */}
                <button
                    onClick={() => navigate("/upload")}
                    className="w-full mb-5 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-sm shadow-md shadow-indigo-100 active:scale-[0.98] transition-all cursor-pointer"
                >
                    <Plus size={18} />
                    <span>Create Post</span>
                </button>

                {/* Navigation Links */}
                <nav className="flex flex-col gap-1">
                    {navItems.map((item) => {
                        const isActive =
                            item.path === "/"
                                ? location.pathname === "/"
                                : location.pathname.startsWith(item.path);

                        return (
                            <button
                                key={item.label}
                                onClick={() => navigate(item.path)}
                                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                                    isActive
                                        ? "bg-indigo-50 text-indigo-700 shadow-2xs font-bold"
                                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className={isActive ? "text-indigo-600" : "text-slate-400"}>
                                        {item.icon}
                                    </span>
                                    <span>{item.label}</span>
                                </div>

                                {item.badge && (
                                    <span className="bg-rose-500 text-white text-[11px] font-bold px-1.5 py-0.2 rounded-full min-w-[18px] text-center shadow-xs">
                                        {item.badge}
                                    </span>
                                )}

                                {item.statusBadge === "Verified" && (
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom Current User Card */}
            <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors">
                    <div
                        onClick={() => navigate(`/profile/${userData.userName}`)}
                        className="flex items-center gap-2.5 cursor-pointer overflow-hidden flex-1"
                    >
                        <img
                            src={userData.profileImage || dp}
                            alt={userData.name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200"
                        />
                        <div className="overflow-hidden">
                            <div className="flex items-center gap-1">
                                <span className="text-xs font-bold text-slate-800 truncate">
                                    {userData.name}
                                </span>
                            </div>
                            <span className="text-[11px] text-slate-400 block truncate">
                                @{userData.userName}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={handleLogOut}
                        className="text-slate-400 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Sign Out"
                    >
                        <LogOut size={17} />
                    </button>
                </div>
            </div>
        </aside>
    );
}
