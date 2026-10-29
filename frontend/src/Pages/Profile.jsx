import React, { useEffect, useState } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setProfileData, setUserData } from "../redux/userSlice";
import Sidebar from "../components/Sidebar";
import RightHome from "../components/RightHome";
import Nav from "../components/Nav";
import VerifiedBadge from "../components/VerifiedBadge";
import PostCard from "../components/PostCard";
import dp from "../assets/dp.jpg";
import {
    GraduationCap,
    BookOpen,
    Calendar,
    Sparkles,
    UserPlus,
    Check,
    MessageCircle,
    Edit3,
    Ban,
    ArrowLeft,
    Share2,
    ShieldCheck,
    Users,
    Grid,
    List,
    XCircle
} from "lucide-react";

export default function Profile() {
    const { userName } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { profileData, userData } = useSelector((state) => state.user);

    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("posts"); // 'posts' | 'about'
    const [isSent, setIsSent] = useState(false);
    const [actionMsg, setActionMsg] = useState("");

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${serverUrl}/api/user/getProfile/${userName}`, {
                withCredentials: true
            });
            dispatch(setProfileData(res.data));
        } catch (error) {
            console.error("Fetch profile error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [userName]);

    const isSelf = userData?._id === profileData?._id || userData?.userName === userName;

    // Check connection status
    const isConnected = userData?.connections?.some(
        (id) => (typeof id === "string" ? id : id._id)?.toString() === profileData?._id?.toString()
    );

    const hasPendingSent =
        isSent ||
        userData?.sentRequests?.some(
            (r) =>
                (typeof r.to === "string" ? r.to : r.to?._id)?.toString() === profileData?._id?.toString() &&
                r.status === "pending"
        );

    const isRejected = userData?.sentRequests?.some(
        (r) =>
            (typeof r.to === "string" ? r.to : r.to?._id)?.toString() === profileData?._id?.toString() &&
            r.status === "rejected"
    );

    // Send connection request
    const handleConnect = async () => {
        if (!profileData?._id) return;
        try {
            await axios.post(
                `${serverUrl}/api/connections/request/${profileData._id}`,
                {},
                { withCredentials: true }
            );
            setIsSent(true);
            setActionMsg("Connection request sent!");
            setTimeout(() => setActionMsg(""), 3500);
        } catch (error) {
            console.error("Connect error:", error);
            setActionMsg(error.response?.data?.message || "Could not send connection request.");
            setTimeout(() => setActionMsg(""), 4500);
        }
    };

    // Block Member
    const handleBlock = async () => {
        if (!window.confirm(`Are you sure you want to block ${profileData?.name}?`)) return;
        try {
            await axios.post(
                `${serverUrl}/api/user/block/${profileData._id}`,
                {},
                { withCredentials: true }
            );
            navigate("/");
        } catch (error) {
            console.error("Block error:", error);
        }
    };

    if (loading && !profileData) {
        return (
            <div className="w-full min-h-screen bg-slate-50 flex justify-center items-center">
                <div className="text-sm font-semibold text-slate-500">Loading student profile...</div>
            </div>
        );
    }

    if (!profileData) {
        return (
            <div className="w-full min-h-screen bg-slate-50 flex justify-center items-center">
                <div className="text-center p-6 bg-white rounded-2xl border border-slate-200">
                    <h2 className="text-lg font-bold text-slate-800">Student not found</h2>
                    <button
                        onClick={() => navigate("/")}
                        className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
                    >
                        Return Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-slate-50 flex justify-center">
            <Sidebar />

            <main className="flex-1 min-h-screen max-w-3xl w-full border-r border-slate-200/80 pb-24 lg:pb-12 bg-white">
                {/* Top Banner / Cover */}
                <div className="relative h-44 sm:h-52 bg-gradient-to-r from-indigo-700 via-purple-700 to-blue-700">
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute top-4 left-4 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full backdrop-blur-xs transition-colors cursor-pointer"
                    >
                        <ArrowLeft size={18} />
                    </button>
                </div>

                {/* Profile Header Details */}
                <div className="px-5 sm:px-8 relative pb-6 border-b border-slate-200">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-20 gap-4 mb-4">
                        {/* Profile Photo */}
                        <div className="relative">
                            <img
                                src={profileData.profileImage || dp}
                                alt={profileData.name}
                                className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-white shadow-md bg-white"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                            {isSelf ? (
                                <>
                                    <button
                                        onClick={() => navigate("/editprofile")}
                                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                                    >
                                        <Edit3 size={15} />
                                        <span>Edit Profile</span>
                                    </button>
                                    <button
                                        onClick={() => navigate("/verification")}
                                        className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                                    >
                                        <ShieldCheck size={16} />
                                        <span>Verification</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    {isConnected ? (
                                        <div className="flex items-center gap-2">
                                            <span className="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-xs">
                                                <Check size={16} />
                                                <span>Connected</span>
                                            </span>
                                            <button
                                                onClick={() => navigate(`/messages/${profileData._id}`)}
                                                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-md shadow-indigo-100 transition-all cursor-pointer"
                                            >
                                                <MessageCircle size={16} />
                                                <span>Message</span>
                                            </button>
                                        </div>
                                    ) : hasPendingSent ? (
                                        <span className="px-4 py-2 rounded-xl bg-slate-100 text-slate-500 text-xs sm:text-sm font-semibold flex items-center gap-1.5">
                                            <Check size={16} />
                                            <span>Request Sent</span>
                                        </span>
                                    ) : isRejected ? (
                                        <span
                                            className="px-4 py-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 text-xs sm:text-sm font-semibold flex items-center gap-1.5"
                                            title="Your previous connection request was declined."
                                        >
                                            <XCircle size={16} />
                                            <span>Request Declined</span>
                                        </span>
                                    ) : (
                                        <button
                                            onClick={handleConnect}
                                            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-md shadow-indigo-100 transition-all cursor-pointer"
                                        >
                                            <UserPlus size={16} />
                                            <span>Connect</span>
                                        </button>
                                    )}

                                    {/* Direct message button if not connected shows prompt */}
                                    {!isConnected && (
                                        <button
                                            onClick={() => navigate(`/messages/${profileData._id}`)}
                                            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                                            title="Message locked until connection is mutual"
                                        >
                                            <MessageCircle size={15} />
                                            <span>Message</span>
                                        </button>
                                    )}

                                    <button
                                        onClick={handleBlock}
                                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                        title="Block user"
                                    >
                                        <Ban size={16} />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Action Feedback Toast */}
                    {actionMsg && (
                        <div className="mb-4 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-semibold">
                            {actionMsg}
                        </div>
                    )}

                    {/* Student Name & Badges */}
                    <div className="mb-3">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                {profileData.name}
                            </h1>
                            <VerifiedBadge
                                status={profileData.verificationStatus}
                                college={profileData.college}
                                size="md"
                                showLabel
                            />
                        </div>
                        <span className="text-xs sm:text-sm text-slate-400 font-medium">
                            @{profileData.userName}
                        </span>
                        {profileData.profession && (
                            <span className="text-xs text-indigo-600 font-semibold block mt-0.5">
                                {profileData.profession}
                            </span>
                        )}
                    </div>

                    {/* Academic Details (LinkedIn-Style) */}
                    <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/70 mb-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                        {profileData.college && (
                            <div className="flex items-center gap-2">
                                <GraduationCap size={16} className="text-indigo-600 shrink-0" />
                                <span className="font-semibold truncate">{profileData.college}</span>
                            </div>
                        )}
                        {profileData.degree && (
                            <div className="flex items-center gap-2">
                                <BookOpen size={15} className="text-slate-500 shrink-0" />
                                <span className="truncate">{profileData.degree}</span>
                            </div>
                        )}
                        {profileData.year && (
                            <div className="flex items-center gap-2 text-slate-500">
                                <Calendar size={15} className="shrink-0" />
                                <span>{profileData.year}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-slate-500">
                            <Users size={15} className="shrink-0" />
                            <span>{profileData.connections?.length || 0} Connections</span>
                        </div>
                    </div>

                    {/* Bio */}
                    {profileData.bio && (
                        <p className="text-xs sm:text-sm text-slate-700 mb-4 whitespace-pre-line leading-relaxed">
                            {profileData.bio}
                        </p>
                    )}

                    {/* Skills Chips */}
                    {profileData.skills && profileData.skills.length > 0 && (
                        <div className="mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                                Skills & Technologies
                            </span>
                            <div className="flex items-center gap-1.5 flex-wrap">
                                {profileData.skills.map((skill, idx) => (
                                    <span
                                        key={idx}
                                        className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs px-2.5 py-1 rounded-lg font-semibold"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile Tabs */}
                <div className="px-5 border-b border-slate-200 flex items-center gap-6">
                    <button
                        onClick={() => setActiveTab("posts")}
                        className={`py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
                            activeTab === "posts"
                                ? "border-indigo-600 text-indigo-600"
                                : "border-transparent text-slate-500 hover:text-slate-800"
                        }`}
                    >
                        Posts ({profileData.posts?.length || 0})
                    </button>
                    <button
                        onClick={() => setActiveTab("about")}
                        className={`py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
                            activeTab === "about"
                                ? "border-indigo-600 text-indigo-600"
                                : "border-transparent text-slate-500 hover:text-slate-800"
                        }`}
                    >
                        Academic Info & Verification
                    </button>
                </div>

                {/* Tab Content */}
                <div className="p-5">
                    {activeTab === "posts" ? (
                        (() => {
                            const rawPosts = profileData.posts || [];
                            const validPosts = [];
                            const seenIds = new Set();

                            for (let i = 0; i < rawPosts.length; i++) {
                                const p = rawPosts[i];
                                if (!p) continue;
                                const id = (typeof p === "string" ? p : p._id)?.toString() || `post-${i}`;
                                if (!seenIds.has(id)) {
                                    seenIds.add(id);
                                    validPosts.push({ item: p, key: id });
                                }
                            }

                            if (validPosts.length === 0) {
                                return (
                                    <div className="py-16 text-center text-slate-400 text-xs">
                                        No posts shared yet.
                                    </div>
                                );
                            }

                            return (
                                <div className="space-y-4">
                                    {validPosts.map(({ item, key }) => {
                                        const postObj = typeof item === "object" ? {
                                            ...item,
                                            author: item.author || profileData
                                        } : {
                                            _id: key,
                                            author: profileData
                                        };

                                        return (
                                            <PostCard
                                                key={key}
                                                post={postObj}
                                                onPostUpdated={() => fetchProfile()}
                                            />
                                        );
                                    })}
                                </div>
                            );
                        })()
                    ) : (
                        <div className="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-700">
                            <div>
                                <h3 className="font-bold text-slate-900 mb-1">College & Degree</h3>
                                <p>{profileData.college || "Not specified"}</p>
                                <p className="text-slate-500">{profileData.degree || "Degree not specified"}</p>
                            </div>

                            <div className="pt-3 border-t border-slate-200">
                                <h3 className="font-bold text-slate-900 mb-1">Verification Status</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <VerifiedBadge
                                        status={profileData.verificationStatus}
                                        college={profileData.college}
                                        size="md"
                                        showLabel
                                    />
                                    <span className="text-xs text-slate-500">
                                        Method: {profileData.verificationMethod || "None"}
                                    </span>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-slate-200">
                                <h3 className="font-bold text-slate-900 mb-1">Student Network</h3>
                                <p>{profileData.connections?.length || 0} mutual verified student connections</p>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <RightHome />
            <Nav />
        </div>
    );
}