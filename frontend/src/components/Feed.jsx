import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../App";
import PostCard from "./PostCard";
import StoryDp from "./StoryDp";
import Nav from "./Nav";
import MobileTopBar from "./MobileTopBar";
import dp from "../assets/dp.jpg";
import {
    Sparkles,
    Image,
    Send,
    Users,
    GraduationCap,
    RefreshCw,
    Filter
} from "lucide-react";

export default function Feed() {
    const navigate = useNavigate();
    const { userData, suggestedUsers = [] } = useSelector((state) => state.user);

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterTab, setFilterTab] = useState("all"); // 'all' | 'teammates' | 'college'

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${serverUrl}/api/post/getAll`, { withCredentials: true });
            setPosts(res.data);
        } catch (error) {
            console.error("Fetch posts error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    // Filter posts based on active tab
    const filteredPosts = posts.filter((p) => {
        if (filterTab === "teammates") return p.isProjectTeammateSearch;
        if (filterTab === "college") {
            return p.author?.college && userData?.college && p.author.college.toLowerCase() === userData.college.toLowerCase();
        }
        return true;
    });

    return (
        <main className="flex-1 min-h-screen bg-slate-100/60 max-w-2xl w-full border-r border-slate-200/80 pb-24 lg:pb-10">
            {/* Mobile Top Navigation */}
            <MobileTopBar title="Dodoo Campus" />

            {/* Stories / Active Student Circles Carousel */}
            <div className="bg-white border-b border-slate-200/80 px-4 py-3.5 mb-4">
                <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
                    {/* Current User Story */}
                    <div className="flex flex-col items-center gap-1 shrink-0 cursor-pointer" onClick={() => navigate(`/profile/${userData?.userName}`)}>
                        <div className="w-14 h-14 rounded-full p-0.5 border-2 border-dashed border-indigo-400 flex items-center justify-center">
                            <img
                                src={userData?.profileImage || dp}
                                alt="You"
                                className="w-full h-full rounded-full object-cover"
                            />
                        </div>
                        <span className="text-[11px] font-medium text-slate-600">Your Story</span>
                    </div>

                    {/* Suggested / Connected Student Circles */}
                    {suggestedUsers && suggestedUsers.map((user) => (
                        <div
                            key={user._id}
                            className="flex flex-col items-center gap-1 shrink-0 cursor-pointer"
                            onClick={() => navigate(`/profile/${user.userName}`)}
                        >
                            <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-600 flex items-center justify-center shadow-xs">
                                <img
                                    src={user.profileImage || dp}
                                    alt={user.name}
                                    className="w-full h-full rounded-full object-cover border-2 border-white"
                                />
                            </div>
                            <span className="text-[11px] font-medium text-slate-700 truncate max-w-[65px]">
                                {user.name.split(" ")[0]}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Feed Feed Tabs / Category Filters */}
            <div className="px-4 mb-4">
                <div className="flex items-center justify-between bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                    <button
                        onClick={() => setFilterTab("all")}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                            filterTab === "all"
                                ? "bg-indigo-600 text-white shadow-xs"
                                : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                        All Campus
                    </button>
                    <button
                        onClick={() => setFilterTab("teammates")}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                            filterTab === "teammates"
                                ? "bg-indigo-600 text-white shadow-xs"
                                : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                        <Sparkles size={13} />
                        <span>Teammates</span>
                    </button>
                    <button
                        onClick={() => setFilterTab("college")}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                            filterTab === "college"
                                ? "bg-indigo-600 text-white shadow-xs"
                                : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                        My College
                    </button>
                </div>
            </div>

            {/* Quick Create Post Bar */}
            <div className="px-4 mb-4">
                <div
                    onClick={() => navigate("/upload")}
                    className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-indigo-300 transition-all cursor-pointer flex items-center gap-3"
                >
                    <img
                        src={userData?.profileImage || dp}
                        alt="You"
                        className="w-9 h-9 rounded-full object-cover border border-slate-200"
                    />
                    <div className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-400 text-xs sm:text-sm px-4 py-2 rounded-full border border-slate-200">
                        Share a project update or look for teammates...
                    </div>
                    <div className="text-indigo-600 p-2 hover:bg-indigo-50 rounded-full">
                        <Image size={18} />
                    </div>
                </div>
            </div>

            {/* Posts List */}
            <div className="px-4">
                {loading ? (
                    <div className="space-y-4 py-6">
                        {[1, 2].map((n) => (
                            <div key={n} className="bg-white rounded-2xl p-5 border border-slate-200 animate-pulse">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-200" />
                                    <div className="space-y-2 flex-1">
                                        <div className="h-4 bg-slate-200 rounded w-1/3" />
                                        <div className="h-3 bg-slate-200 rounded w-1/4" />
                                    </div>
                                </div>
                                <div className="h-20 bg-slate-100 rounded-xl mb-3" />
                            </div>
                        ))}
                    </div>
                ) : filteredPosts.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
                        <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center mb-3">
                            <GraduationCap size={24} />
                        </div>
                        <h3 className="font-bold text-slate-800 text-base mb-1">No posts found</h3>
                        <p className="text-xs text-slate-500 mb-4">
                            {filterTab === "college"
                                ? "No posts from your college yet. Be the first to start the conversation!"
                                : filterTab === "teammates"
                                ? "No teammate searches active right now. Post your project opening!"
                                : "Start connecting with students to fill your feed."}
                        </p>
                        <button
                            onClick={() => navigate("/upload")}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs cursor-pointer"
                        >
                            Create First Post
                        </button>
                    </div>
                ) : (
                    filteredPosts
                        .filter((p) => p && p._id)
                        .map((post, idx) => (
                            <PostCard
                                key={post._id?.toString() || `feed-post-${idx}`}
                                post={post}
                                onPostUpdated={(updatedPost) => {
                                    setPosts((prev) =>
                                        prev.map((p) => (p._id === updatedPost._id ? updatedPost : p))
                                    );
                                }}
                            />
                        ))
                )}
            </div>

            {/* Mobile Bottom Navigation */}
            <Nav />
        </main>
    );
}