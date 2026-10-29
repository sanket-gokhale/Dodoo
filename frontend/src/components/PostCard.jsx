import React, { useState } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../App";
import { setUserData } from "../redux/userSlice";
import VerifiedBadge from "./VerifiedBadge";
import RedditComments from "./RedditComments";
import dp from "../assets/dp.jpg";
import {
    Heart,
    MessageSquare,
    Bookmark,
    Share2,
    Users,
    Sparkles,
    Check,
    MoreHorizontal,
    Flag,
    Ban
} from "lucide-react";

export default function PostCard({ post, onPostUpdated }) {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { userData } = useSelector((state) => state.user);

    const [showComments, setShowComments] = useState(false);
    const [currentPost, setCurrentPost] = useState(post);
    const [likeLoading, setLikeLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [reportReason, setReportReason] = useState("Inappropriate content");
    const [toastMsg, setToastMsg] = useState("");

    const author = currentPost.author || {};
    const isLiked = currentPost.likes?.some((id) => id.toString() === userData?._id?.toString());
    const isSaved = userData?.saved?.some(
        (item) => (typeof item === "string" ? item : item._id)?.toString() === currentPost._id?.toString()
    );

    // Format relative time
    const formatTime = (dateStr) => {
        if (!dateStr) return "";
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "just now";
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    // Like Post
    const handleLike = async () => {
        if (likeLoading) return;
        setLikeLoading(true);
        try {
            const res = await axios.get(`${serverUrl}/api/post/like/${currentPost._id}`, { withCredentials: true });
            setCurrentPost(res.data);
            if (onPostUpdated) onPostUpdated(res.data);
        } catch (error) {
            console.error("Like error:", error);
        } finally {
            setLikeLoading(false);
        }
    };

    // Save Post
    const handleSave = async () => {
        try {
            const res = await axios.get(`${serverUrl}/api/post/saved/${currentPost._id}`, { withCredentials: true });
            dispatch(setUserData(res.data));
        } catch (error) {
            console.error("Save error:", error);
        }
    };

    // Share link
    const handleShare = () => {
        navigator.clipboard?.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Report Post (Inappropriate content reporting)
    const handleReportPost = async () => {
        try {
            await axios.post(
                `${serverUrl}/api/post/report/${currentPost._id}`,
                { reason: reportReason },
                { withCredentials: true }
            );
            setReportModalOpen(false);
            setToastMsg("Post reported to campus moderators for review.");
            setTimeout(() => setToastMsg(""), 3500);
        } catch (error) {
            console.error("Report post error:", error);
        }
    };

    // Block Author
    const handleBlockAuthor = async () => {
        if (!author._id) return;
        if (!window.confirm(`Are you sure you want to block ${author.name}? You will no longer see their posts or comments.`)) {
            return;
        }
        try {
            await axios.post(`${serverUrl}/api/user/block/${author._id}`, {}, { withCredentials: true });
            const userRes = await axios.get(`${serverUrl}/api/user/current`, { withCredentials: true });
            dispatch(setUserData(userRes.data));
            setMenuOpen(false);
            setToastMsg(`Blocked @${author.userName}`);
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            console.error("Block error:", error);
        }
    };

    return (
        <article className="w-full bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow duration-200 overflow-hidden mb-5 relative">
            {/* Action Feedback Toast */}
            {toastMsg && (
                <div className="p-3 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
                    <span>{toastMsg}</span>
                    <button onClick={() => setToastMsg("")}>✕</button>
                </div>
            )}

            {/* Post Header */}
            <div className="p-4 sm:p-5 flex items-start justify-between gap-3">
                <div
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => navigate(`/profile/${author.userName}`)}
                >
                    <div className="relative">
                        <img
                            src={author.profileImage || dp}
                            alt={author.name || "Student"}
                            className="w-11 h-11 rounded-full object-cover border-2 border-indigo-100 group-hover:border-indigo-500 transition-colors"
                        />
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors text-sm sm:text-base">
                                {author.name || "Student Member"}
                            </span>
                            {author.verificationStatus && (
                                <VerifiedBadge status={author.verificationStatus} college={author.college} size="sm" />
                            )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 flex-wrap">
                            <span>@{author.userName || "student"}</span>
                            {author.college && (
                                <>
                                    <span>•</span>
                                    <span className="font-medium text-slate-600 truncate max-w-[200px]">
                                        {author.college}
                                    </span>
                                </>
                            )}
                            {author.degree && (
                                <>
                                    <span>•</span>
                                    <span className="truncate max-w-[150px]">{author.degree}</span>
                                </>
                            )}
                            <span>•</span>
                            <span>{formatTime(currentPost.createdAt)}</span>
                        </div>
                    </div>
                </div>

                {/* More options menu button */}
                <div className="relative">
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Post options"
                    >
                        <MoreHorizontal size={18} />
                    </button>

                    {menuOpen && (
                        <div className="absolute right-0 top-8 z-30 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1 text-xs">
                            <button
                                onClick={() => {
                                    setReportModalOpen(true);
                                    setMenuOpen(false);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-left text-amber-700 hover:bg-amber-50 cursor-pointer font-medium"
                            >
                                <Flag size={14} />
                                <span>Report inappropriate post</span>
                            </button>

                            {author._id && author._id !== userData?._id && (
                                <button
                                    onClick={handleBlockAuthor}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-rose-600 hover:bg-rose-50 cursor-pointer font-medium border-t border-slate-100"
                                >
                                    <Ban size={14} />
                                    <span>Block @{author.userName}</span>
                                </button>
                            )}

                            <button
                                onClick={() => {
                                    handleShare();
                                    setMenuOpen(false);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-left text-slate-700 hover:bg-slate-50 cursor-pointer border-t border-slate-100"
                            >
                                <Share2 size={14} />
                                <span>Copy link to post</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* LinkedIn-style Project Teammate Search Banner */}
            {currentPost.isProjectTeammateSearch && (
                <div className="mx-4 sm:mx-5 mb-3 p-3.5 bg-gradient-to-r from-indigo-50/90 via-purple-50/80 to-blue-50/90 border border-indigo-200/70 rounded-xl">
                    <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wider mb-1">
                        <Sparkles size={15} className="text-indigo-600 animate-pulse" />
                        <span>Seeking Project Teammate</span>
                    </div>
                    {currentPost.projectRole && (
                        <div className="text-slate-800 font-semibold text-sm mb-2">
                            Role: <span className="text-indigo-900">{currentPost.projectRole}</span>
                        </div>
                    )}
                    {currentPost.requiredSkills && currentPost.requiredSkills.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs text-slate-600 font-medium">Desired Skills:</span>
                            {currentPost.requiredSkills.map((skill, idx) => (
                                <span
                                    key={idx}
                                    className="bg-white/90 text-indigo-700 border border-indigo-200 text-xs px-2.5 py-0.5 rounded-full font-medium shadow-2xs"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Caption Body */}
            {currentPost.caption && (
                <div className="px-4 sm:px-5 pb-3">
                    <p className="text-slate-800 text-sm sm:text-[15px] whitespace-pre-line leading-relaxed">
                        {currentPost.caption}
                    </p>
                </div>
            )}

            {/* Media Image / Video */}
            {currentPost.media && (
                <div className="w-full bg-slate-900 max-h-[500px] flex items-center justify-center overflow-hidden">
                    {currentPost.mediaType === "video" ? (
                        <video
                            src={currentPost.media}
                            controls
                            className="w-full max-h-[500px] object-contain"
                        />
                    ) : (
                        <img
                            src={currentPost.media}
                            alt="Post media"
                            className="w-full max-h-[500px] object-cover hover:scale-[1.01] transition-transform duration-300"
                            loading="lazy"
                        />
                    )}
                </div>
            )}

            {/* Post Metrics / Counters */}
            <div className="px-4 sm:px-5 py-2.5 flex items-center justify-between text-xs text-slate-500 border-b border-slate-100">
                <div className="flex items-center gap-1">
                    <span className="font-semibold text-slate-700">{currentPost.likes?.length || 0}</span>
                    <span>{currentPost.likes?.length === 1 ? "like" : "likes"}</span>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowComments(!showComments)}
                        className="hover:underline cursor-pointer"
                    >
                        <span className="font-semibold text-slate-700">{currentPost.comments?.length || 0}</span>{" "}
                        {currentPost.comments?.length === 1 ? "comment" : "comments"}
                    </button>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="px-3 sm:px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-1 sm:gap-2">
                    {/* Like Button */}
                    <button
                        onClick={handleLike}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium text-xs sm:text-sm transition-all cursor-pointer ${
                            isLiked
                                ? "text-rose-600 bg-rose-50"
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                    >
                        <Heart
                            size={18}
                            className={`${isLiked ? "fill-rose-600 text-rose-600" : ""}`}
                        />
                        <span>{isLiked ? "Liked" : "Like"}</span>
                    </button>

                    {/* Comment Toggle */}
                    <button
                        onClick={() => setShowComments(!showComments)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium text-xs sm:text-sm transition-all cursor-pointer ${
                            showComments
                                ? "text-indigo-600 bg-indigo-50"
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                    >
                        <MessageSquare size={18} />
                        <span>Discuss</span>
                    </button>

                    {/* Share */}
                    <button
                        onClick={handleShare}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium text-xs sm:text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer"
                        title="Copy post link"
                    >
                        {copied ? <Check size={18} className="text-emerald-600" /> : <Share2 size={18} />}
                        <span>{copied ? "Copied!" : "Share"}</span>
                    </button>
                </div>

                {/* Save Post */}
                <button
                    onClick={handleSave}
                    className={`p-2 rounded-xl transition-all cursor-pointer ${
                        isSaved
                            ? "text-indigo-600 bg-indigo-50"
                            : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                    title={isSaved ? "Saved in collection" : "Save post"}
                >
                    <Bookmark size={18} className={isSaved ? "fill-indigo-600" : ""} />
                </button>
            </div>

            {/* Reddit-style Nested Comments Section */}
            {showComments && (
                <div className="px-4 sm:px-5 pb-4 bg-slate-50/50">
                    <RedditComments
                        postId={currentPost._id}
                        comments={currentPost.comments || []}
                        onCommentUpdated={(updatedPost) => setCurrentPost(updatedPost)}
                    />
                </div>
            )}

            {/* Report Post Modal */}
            {reportModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
                        <div className="flex items-center gap-2 text-amber-600 mb-2">
                            <Flag size={20} />
                            <h3 className="font-bold text-slate-800 text-base">Report Inappropriate Post</h3>
                        </div>
                        <p className="text-slate-600 text-xs mb-4">
                            Help keep Dodoo Campus safe. Select a reason for reporting this post by @{author.userName}:
                        </p>

                        <div className="space-y-2 mb-4">
                            {[
                                "Inappropriate or offensive content",
                                "Spam or promotional advertising",
                                "Harassment or hate speech",
                                "Academic dishonesty / Cheating",
                                "Misinformation"
                            ].map((reason) => (
                                <label
                                    key={reason}
                                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                                        reportReason === reason
                                            ? "border-amber-500 bg-amber-50 text-amber-900 font-medium"
                                            : "border-slate-200 hover:bg-slate-50 text-slate-700"
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="postReportReason"
                                        checked={reportReason === reason}
                                        onChange={() => setReportReason(reason)}
                                        className="text-amber-600 focus:ring-amber-500"
                                    />
                                    <span>{reason}</span>
                                </label>
                            ))}
                        </div>

                        <div className="flex items-center justify-end gap-2">
                            <button
                                onClick={() => setReportModalOpen(false)}
                                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 font-medium cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReportPost}
                                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-colors"
                            >
                                Submit Moderation Report
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </article>
    );
}
