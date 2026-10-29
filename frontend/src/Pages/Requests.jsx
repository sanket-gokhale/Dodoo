import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../App";
import { setUserData, setPendingRequestsCount } from "../redux/userSlice";
import Sidebar from "../components/Sidebar";
import RightHome from "../components/RightHome";
import Nav from "../components/Nav";
import MobileTopBar from "../components/MobileTopBar";
import VerifiedBadge from "../components/VerifiedBadge";
import dp from "../assets/dp.jpg";
import {
    UserCheck,
    Clock,
    Users,
    Check,
    X,
    MessageCircle,
    UserX,
    GraduationCap,
    BookOpen
} from "lucide-react";

export default function Requests() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { userData } = useSelector((state) => state.user);

    const [activeTab, setActiveTab] = useState("incoming"); // 'incoming' | 'sent' | 'connections'
    const [incomingList, setIncomingList] = useState([]);
    const [sentList, setSentList] = useState([]);
    const [connectionsList, setConnectionsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionMsg, setActionMsg] = useState("");

    const fetchAllConnectionData = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${serverUrl}/api/connections/all`, { withCredentials: true });
            setIncomingList(res.data.incomingRequests || []);
            setSentList(res.data.sentRequests || []);
            setConnectionsList(res.data.connections || []);
            dispatch(setPendingRequestsCount(res.data.incomingRequests?.length || 0));
        } catch (error) {
            console.error("Fetch connections error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllConnectionData();
    }, []);

    // Accept request
    const handleAccept = async (targetUserId, studentName) => {
        try {
            const res = await axios.post(
                `${serverUrl}/api/connections/accept/${targetUserId}`,
                {},
                { withCredentials: true }
            );
            dispatch(setUserData(res.data.user));
            setActionMsg(`Connected with ${studentName}! Private messaging is now unlocked 💬`);
            setTimeout(() => setActionMsg(""), 4000);
            fetchAllConnectionData();
        } catch (error) {
            console.error("Accept error:", error);
        }
    };

    // Reject request
    const handleReject = async (targetUserId, studentName) => {
        try {
            await axios.post(
                `${serverUrl}/api/connections/reject/${targetUserId}`,
                {},
                { withCredentials: true }
            );
            setActionMsg(`Request from ${studentName} declined.`);
            setTimeout(() => setActionMsg(""), 3500);
            fetchAllConnectionData();
        } catch (error) {
            console.error("Reject error:", error);
        }
    };

    // Remove connection
    const handleRemove = async (targetUserId, studentName) => {
        if (!window.confirm(`Are you sure you want to disconnect from ${studentName}? Private messaging will be locked.`)) {
            return;
        }
        try {
            await axios.post(
                `${serverUrl}/api/connections/remove/${targetUserId}`,
                {},
                { withCredentials: true }
            );
            setActionMsg(`Removed ${studentName} from connections.`);
            setTimeout(() => setActionMsg(""), 3500);
            fetchAllConnectionData();
        } catch (error) {
            console.error("Remove error:", error);
        }
    };

    return (
        <div className="w-full min-h-screen bg-slate-50 flex justify-center">
            <Sidebar />

            <main className="flex-1 min-h-screen max-w-3xl w-full border-r border-slate-200/80 pb-24 lg:pb-12 bg-white">
                {/* Mobile Top Navigation */}
                <MobileTopBar title="Network" subtitle="Peer Requests & Connections" />

                {/* Header & Tabs */}
                <div className="p-3.5 sm:p-6 border-b border-slate-200 bg-white">
                    <div className="hidden lg:flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                                <UserCheck className="text-indigo-600" size={24} />
                                <span>Connection Network</span>
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                                Manage peer requests and your genuine student network
                            </p>
                        </div>
                    </div>

                    {/* Tabs Bar */}
                    <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                        <button
                            onClick={() => setActiveTab("incoming")}
                            className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                activeTab === "incoming"
                                    ? "bg-white text-indigo-700 shadow-2xs"
                                    : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            <span>Incoming</span>
                            {incomingList.length > 0 && (
                                <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                                    {incomingList.length}
                                </span>
                            )}
                        </button>

                        <button
                            onClick={() => setActiveTab("sent")}
                            className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                activeTab === "sent"
                                    ? "bg-white text-indigo-700 shadow-2xs"
                                    : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            <span className="hidden sm:inline">Sent Requests</span>
                            <span className="sm:hidden">Sent</span>
                            <span className="text-slate-400 text-xs">({sentList.length})</span>
                        </button>

                        <button
                            onClick={() => setActiveTab("connections")}
                            className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                activeTab === "connections"
                                    ? "bg-white text-indigo-700 shadow-2xs"
                                    : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            <span className="hidden sm:inline">My Connections</span>
                            <span className="sm:hidden">Connected</span>
                            <span className="text-slate-400 text-xs">({connectionsList.length})</span>
                        </button>
                    </div>
                </div>

                {/* Status Toast */}
                {actionMsg && (
                    <div className="mx-5 mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-between shadow-2xs animate-fade-in">
                        <span>{actionMsg}</span>
                        <button onClick={() => setActionMsg("")} className="text-emerald-600 font-bold ml-2">
                            ✕
                        </button>
                    </div>
                )}

                {/* Content */}
                <div className="p-5">
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((n) => (
                                <div key={n} className="p-4 rounded-2xl border border-slate-200 animate-pulse flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-slate-200" />
                                    <div className="space-y-2 flex-1">
                                        <div className="h-4 bg-slate-200 rounded w-1/3" />
                                        <div className="h-3 bg-slate-200 rounded w-1/4" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : activeTab === "incoming" ? (
                        /* Incoming Requests */
                        incomingList.length === 0 ? (
                            <div className="py-16 text-center">
                                <div className="w-14 h-14 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                                    <UserCheck size={24} />
                                </div>
                                <h3 className="font-bold text-slate-800 text-base mb-1">No pending requests</h3>
                                <p className="text-xs text-slate-500 mb-4">
                                    When other students send you connection requests, they'll show up here.
                                </p>
                                <button
                                    onClick={() => navigate("/discover")}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
                                >
                                    Discover Students to Connect
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {incomingList.map((req) => {
                                    const student = req.from || {};
                                    return (
                                        <div
                                            key={req._id || student._id}
                                            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-indigo-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                        >
                                            <div
                                                onClick={() => navigate(`/profile/${student.userName}`)}
                                                className="flex items-start gap-3 cursor-pointer overflow-hidden flex-1"
                                            >
                                                <img
                                                    src={student.profileImage || dp}
                                                    alt={student.name}
                                                    className="w-12 h-12 rounded-full object-cover border-2 border-indigo-100 shrink-0"
                                                />
                                                <div className="overflow-hidden">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span className="font-bold text-slate-900 hover:text-indigo-600 text-sm">
                                                            {student.name}
                                                        </span>
                                                        <VerifiedBadge
                                                            status={student.verificationStatus}
                                                            college={student.college}
                                                            size="sm"
                                                        />
                                                    </div>
                                                    <span className="text-xs text-slate-400 block truncate">
                                                        @{student.userName}
                                                    </span>
                                                    {student.college && (
                                                        <span className="text-xs text-slate-600 font-medium block truncate mt-0.5">
                                                            {student.college} {student.degree ? `• ${student.degree}` : ""}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Accept / Reject Buttons */}
                                            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                                <button
                                                    onClick={() => handleAccept(student._id, student.name)}
                                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                                                >
                                                    <Check size={14} />
                                                    <span>Accept</span>
                                                </button>
                                                <button
                                                    onClick={() => handleReject(student._id, student.name)}
                                                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-semibold transition-colors cursor-pointer"
                                                >
                                                    <X size={14} />
                                                    <span>Decline</span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )
                    ) : activeTab === "sent" ? (
                        /* Sent Requests */
                        sentList.length === 0 ? (
                            <div className="py-16 text-center text-slate-400 text-xs">
                                You haven't sent any pending requests.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {sentList.map((req) => {
                                    const student = req.to || {};
                                    return (
                                        <div
                                            key={req._id || student._id}
                                            className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-4"
                                        >
                                            <div
                                                onClick={() => navigate(`/profile/${student.userName}`)}
                                                className="flex items-center gap-3 cursor-pointer overflow-hidden flex-1"
                                            >
                                                <img
                                                    src={student.profileImage || dp}
                                                    alt={student.name}
                                                    className="w-11 h-11 rounded-full object-cover border border-slate-200 shrink-0"
                                                />
                                                <div className="overflow-hidden">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span className="font-bold text-slate-900 text-sm">
                                                            {student.name}
                                                        </span>
                                                        <VerifiedBadge
                                                            status={student.verificationStatus}
                                                            college={student.college}
                                                            size="sm"
                                                        />
                                                    </div>
                                                    <span className="text-xs text-slate-400 block truncate">
                                                        {student.college || `@${student.userName}`}
                                                    </span>
                                                </div>
                                            </div>

                                            {req.status === "rejected" ? (
                                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 text-xs font-medium">
                                                    <X size={14} />
                                                    <span>Declined</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-500 text-xs font-medium">
                                                    <Clock size={14} />
                                                    <span>Pending Acceptance</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )
                    ) : (
                        /* My Connections */
                        connectionsList.length === 0 ? (
                            <div className="py-16 text-center">
                                <div className="w-14 h-14 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                                    <Users size={24} />
                                </div>
                                <h3 className="font-bold text-slate-800 text-base mb-1">No connections yet</h3>
                                <p className="text-xs text-slate-500 mb-4">
                                    Connect with classmates to unlock private 1-to-1 messaging!
                                </p>
                                <button
                                    onClick={() => navigate("/discover")}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
                                >
                                    Find Students
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {connectionsList.map((student) => (
                                    <div
                                        key={student._id}
                                        className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-indigo-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                    >
                                        <div
                                            onClick={() => navigate(`/profile/${student.userName}`)}
                                            className="flex items-start gap-3 cursor-pointer overflow-hidden flex-1"
                                        >
                                            <img
                                                src={student.profileImage || dp}
                                                alt={student.name}
                                                className="w-12 h-12 rounded-full object-cover border-2 border-indigo-100 shrink-0"
                                            />
                                            <div className="overflow-hidden">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <span className="font-bold text-slate-900 text-sm">
                                                        {student.name}
                                                    </span>
                                                    <VerifiedBadge
                                                        status={student.verificationStatus}
                                                        college={student.college}
                                                        size="sm"
                                                    />
                                                </div>
                                                <span className="text-xs text-slate-400 block truncate">
                                                    @{student.userName}
                                                </span>
                                                {student.college && (
                                                    <span className="text-xs text-slate-600 font-medium block truncate mt-0.5">
                                                        {student.college} {student.degree ? `• ${student.degree}` : ""}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                            {/* Message button: Private messaging unlocked */}
                                            <button
                                                onClick={() => navigate(`/messages/${student._id}`)}
                                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors cursor-pointer"
                                            >
                                                <MessageCircle size={15} />
                                                <span>Message</span>
                                            </button>

                                            {/* Disconnect option */}
                                            <button
                                                onClick={() => handleRemove(student._id, student.name)}
                                                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                                title="Remove Connection"
                                            >
                                                <UserX size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>
            </main>

            <RightHome />
            <Nav />
        </div>
    );
}
