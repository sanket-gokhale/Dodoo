import React, { useState } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { serverUrl } from "../App";
import {
    hideCommentLocally,
    unhideCommentLocally,
    setUserData
} from "../redux/userSlice";
import VerifiedBadge from "./VerifiedBadge";
import dp from "../assets/dp.jpg";
import {
    Heart,
    MessageSquare,
    CornerDownRight,
    EyeOff,
    Eye,
    Flag,
    Ban,
    ChevronDown,
    ChevronRight,
    Send,
    MoreHorizontal
} from "lucide-react";

export default function RedditComments({ postId, comments = [], onCommentUpdated }) {
    const dispatch = useDispatch();
    const { userData, hiddenComments = [] } = useSelector((state) => state.user);

    const [newCommentText, setNewCommentText] = useState("");
    const [replyingToId, setReplyingToId] = useState(null);
    const [replyText, setReplyText] = useState("");
    const [collapsedThreads, setCollapsedThreads] = useState({});
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [reportModalData, setReportModalData] = useState(null); // { commentId, authorName }
    const [reportReason, setReportReason] = useState("Inappropriate content");
    const [reportToast, setReportToast] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Build comment tree (parentId -> children)
    const commentMap = {};
    const rootComments = [];

    comments.forEach((c) => {
        commentMap[c._id] = { ...c, children: [] };
    });

    comments.forEach((c) => {
        if (c.parentId && commentMap[c.parentId]) {
            commentMap[c.parentId].children.push(commentMap[c._id]);
        } else {
            rootComments.push(commentMap[c._id]);
        }
    });

    // Add Top-level Comment
    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newCommentText.trim() || submitting) return;

        setSubmitting(true);
        try {
            const res = await axios.post(
                `${serverUrl}/api/post/comment/${postId}`,
                { message: newCommentText.trim(), parentId: null },
                { withCredentials: true }
            );
            setNewCommentText("");
            if (onCommentUpdated) onCommentUpdated(res.data);
        } catch (error) {
            console.error("Add comment error:", error);
        } finally {
            setSubmitting(false);
        }
    };

    // Add Nested Reply
    const handleAddReply = async (parentId) => {
        if (!replyText.trim() || submitting) return;

        setSubmitting(true);
        try {
            const res = await axios.post(
                `${serverUrl}/api/post/comment/${postId}`,
                { message: replyText.trim(), parentId },
                { withCredentials: true }
            );
            setReplyText("");
            setReplyingToId(null);
            if (onCommentUpdated) onCommentUpdated(res.data);
        } catch (error) {
            console.error("Add reply error:", error);
        } finally {
            setSubmitting(false);
        }
    };

    // Like Comment
    const handleLikeComment = async (commentId) => {
        try {
            const res = await axios.post(
                `${serverUrl}/api/post/comment/${postId}/like/${commentId}`,
                {},
                { withCredentials: true }
            );
            if (onCommentUpdated) onCommentUpdated(res.data);
        } catch (error) {
            console.error("Like comment error:", error);
        }
    };

    // Toggle Collapse Replies (keep parent visible, collapse child tree)
    const toggleCollapseReplies = (commentId) => {
        setCollapsedThreads((prev) => ({
            ...prev,
            [commentId]: !prev[commentId]
        }));
    };

    // Submit Report
    const handleSubmitReport = async () => {
        if (!reportModalData) return;
        try {
            await axios.post(
                `${serverUrl}/api/post/comment/${postId}/report/${reportModalData.commentId}`,
                { reason: reportReason },
                { withCredentials: true }
            );
            setReportToast("Comment reported for moderator review.");
            setReportModalData(null);
            setTimeout(() => setReportToast(""), 3500);
        } catch (error) {
            console.error("Report comment error:", error);
        }
    };

    // Block Member
    const handleBlockUser = async (targetUserId, targetName) => {
        if (!window.confirm(`Are you sure you want to block ${targetName}? Their posts and comments will no longer be visible to you.`)) {
            return;
        }
        try {
            await axios.post(
                `${serverUrl}/api/user/block/${targetUserId}`,
                {},
                { withCredentials: true }
            );
            // Refresh current user
            const userRes = await axios.get(`${serverUrl}/api/user/current`, { withCredentials: true });
            dispatch(setUserData(userRes.data));
            setReportToast(`${targetName} has been blocked.`);
            setTimeout(() => setReportToast(""), 3500);
            window.location.reload();
        } catch (error) {
            console.error("Block user error:", error);
        }
    };

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

    // Recursive Comment Component
    const renderCommentItem = (node, depth = 0) => {
        const isHiddenLocally = hiddenComments.includes(node._id);
        const isCollapsed = collapsedThreads[node._id];
        const hasChildren = node.children && node.children.length > 0;
        const isLiked = node.likes?.some((id) => id.toString() === userData?._id?.toString());
        const likeCount = node.likes?.length || 0;
        const author = node.author || {};

        return (
            <div
                key={node._id}
                className={`group relative text-sm ${
                    depth > 0 ? "ml-4 sm:ml-7 pl-3 border-l-2 border-indigo-100 hover:border-indigo-400 transition-colors" : "mt-4"
                }`}
            >
                {/* Comment Container */}
                <div className="bg-slate-50/80 hover:bg-slate-100/80 p-3 rounded-xl border border-slate-200/70 transition-all">
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                            <img
                                src={author.profileImage || dp}
                                alt={author.name || "Student"}
                                className="w-6 h-6 rounded-full object-cover border border-slate-300"
                            />
                            <span className="font-semibold text-slate-800 text-xs sm:text-sm">
                                {author.name || "Student"}
                            </span>
                            <span className="text-slate-400 text-xs">
                                @{author.userName || "user"}
                            </span>
                            {author.verificationStatus && (
                                <VerifiedBadge status={author.verificationStatus} college={author.college} size="sm" />
                            )}
                            <span className="text-slate-400 text-xs font-normal">
                                • {formatTime(node.createdAt)}
                            </span>
                        </div>

                        {/* Dropdown Menu Toggle */}
                        <div className="relative">
                            <button
                                onClick={() => setActiveMenuId(activeMenuId === node._id ? null : node._id)}
                                className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-200/60 cursor-pointer"
                                title="Comment options"
                            >
                                <MoreHorizontal size={15} />
                            </button>

                            {activeMenuId === node._id && (
                                <div className="absolute right-0 top-6 z-30 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1 text-xs">
                                    {/* Hide locally */}
                                    <button
                                        onClick={() => {
                                            if (isHiddenLocally) {
                                                dispatch(unhideCommentLocally(node._id));
                                            } else {
                                                dispatch(hideCommentLocally(node._id));
                                            }
                                            setActiveMenuId(null);
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-left text-slate-700 hover:bg-slate-50 cursor-pointer"
                                    >
                                        {isHiddenLocally ? (
                                            <>
                                                <Eye size={13} className="text-blue-600" /> Unhide comment
                                            </>
                                        ) : (
                                            <>
                                                <EyeOff size={13} className="text-slate-500" /> Hide for me
                                            </>
                                        )}
                                    </button>

                                    {/* Report */}
                                    <button
                                        onClick={() => {
                                            setReportModalData({
                                                commentId: node._id,
                                                authorName: author.name || "user"
                                            });
                                            setActiveMenuId(null);
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-left text-amber-700 hover:bg-amber-50 cursor-pointer"
                                    >
                                        <Flag size={13} /> Report comment
                                    </button>

                                    {/* Block user */}
                                    {author._id && author._id !== userData?._id && (
                                        <button
                                            onClick={() => {
                                                handleBlockUser(author._id, author.name);
                                                setActiveMenuId(null);
                                            }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-left text-rose-600 hover:bg-rose-50 cursor-pointer border-t border-slate-100"
                                        >
                                            <Ban size={13} /> Block @{author.userName}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content (or Hidden notice) */}
                    {isHiddenLocally ? (
                        <div className="flex items-center justify-between text-xs text-slate-500 italic py-1 bg-slate-100 px-2 rounded-lg">
                            <span>Comment hidden by you locally</span>
                            <button
                                onClick={() => dispatch(unhideCommentLocally(node._id))}
                                className="text-indigo-600 hover:underline font-medium not-italic ml-2 cursor-pointer"
                            >
                                Unhide
                            </button>
                        </div>
                    ) : (
                        <p className="text-slate-700 text-xs sm:text-sm whitespace-pre-line leading-relaxed">
                            {node.message}
                        </p>
                    )}

                    {/* Actions Bar */}
                    {!isHiddenLocally && (
                        <div className="flex items-center gap-4 mt-2 pt-1.5 text-xs text-slate-500 font-medium">
                            {/* Upvote / Like */}
                            <button
                                onClick={() => handleLikeComment(node._id)}
                                className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                                    isLiked ? "text-rose-600 font-semibold" : "hover:text-rose-500"
                                }`}
                            >
                                <Heart
                                    size={14}
                                    className={isLiked ? "fill-rose-600 text-rose-600" : ""}
                                />
                                <span>{likeCount}</span>
                            </button>

                            {/* Reply button */}
                            <button
                                onClick={() => {
                                    setReplyingToId(replyingToId === node._id ? null : node._id);
                                    setReplyText(`@${author.userName} `);
                                }}
                                className="flex items-center gap-1 hover:text-indigo-600 transition-colors cursor-pointer"
                            >
                                <CornerDownRight size={14} />
                                <span>Reply</span>
                            </button>

                            {/* Collapse replies button */}
                            {hasChildren && (
                                <button
                                    onClick={() => toggleCollapseReplies(node._id)}
                                    className="flex items-center gap-1 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer ml-auto text-xs bg-slate-200/70 hover:bg-slate-300/70 px-2 py-0.5 rounded-md"
                                >
                                    {isCollapsed ? (
                                        <>
                                            <ChevronRight size={13} />
                                            <span>Show {node.children.length} {node.children.length === 1 ? "reply" : "replies"}</span>
                                        </>
                                    ) : (
                                        <>
                                            <ChevronDown size={13} />
                                            <span>Collapse {node.children.length} {node.children.length === 1 ? "reply" : "replies"}</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Inline Reply Input Box */}
                {replyingToId === node._id && (
                    <div className="mt-2 ml-4 pl-2">
                        <div className="flex items-center gap-2 bg-white border border-indigo-200 rounded-xl p-2 shadow-xs">
                            <input
                                type="text"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder={`Reply to @${author.userName}...`}
                                className="flex-1 text-xs sm:text-sm outline-none px-2 text-slate-800"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleAddReply(node._id);
                                    }
                                }}
                                autoFocus
                            />
                            <button
                                onClick={() => handleAddReply(node._id)}
                                disabled={submitting || !replyText.trim()}
                                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white p-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                                <Send size={13} />
                            </button>
                            <button
                                onClick={() => setReplyingToId(null)}
                                className="text-slate-400 hover:text-slate-600 text-xs px-1 cursor-pointer"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Render Nested Children if not collapsed */}
                {hasChildren && !isCollapsed && (
                    <div className="space-y-2 mt-2">
                        {node.children.map((child) => renderCommentItem(child, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="w-full mt-3 pt-3 border-t border-slate-100">
            {/* Feedback Toast */}
            {reportToast && (
                <div className="mb-3 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between animate-fade-in">
                    <span>{reportToast}</span>
                    <button onClick={() => setReportToast("")} className="text-emerald-600 font-bold ml-2">
                        ✕
                    </button>
                </div>
            )}

            {/* Top-Level Add Comment Bar */}
            <form onSubmit={handleAddComment} className="flex items-center gap-2.5 mb-4">
                <img
                    src={userData?.profileImage || dp}
                    alt="User"
                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                />
                <div className="flex-1 flex items-center bg-slate-50 hover:bg-slate-100/80 focus-within:bg-white border border-slate-200 focus-within:border-indigo-500 rounded-full px-3 py-1.5 transition-all shadow-2xs">
                    <input
                        type="text"
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        placeholder="Join the discussion... (Reddit-style nested replies)"
                        className="flex-1 text-xs sm:text-sm bg-transparent outline-none px-1 text-slate-800 placeholder:text-slate-400"
                    />
                    <button
                        type="submit"
                        disabled={submitting || !newCommentText.trim()}
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                    >
                        <span>Post</span>
                        <Send size={12} />
                    </button>
                </div>
            </form>

            {/* Comments Thread List */}
            {rootComments.length === 0 ? (
                <div className="py-4 text-center text-slate-400 text-xs">
                    No comments yet. Start the conversation!
                </div>
            ) : (
                <div className="space-y-3">
                    {rootComments.map((root) => renderCommentItem(root, 0))}
                </div>
            )}

            {/* Report Moderation Modal */}
            {reportModalData && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
                        <div className="flex items-center gap-2 text-amber-600 mb-2">
                            <Flag size={20} />
                            <h3 className="font-bold text-slate-800 text-base">Report Inappropriate Comment</h3>
                        </div>
                        <p className="text-slate-600 text-xs mb-4">
                            Help keep Dodoo Campus safe and respectful. Select a reason for flagging this comment by @{reportModalData.authorName}:
                        </p>

                        <div className="space-y-2 mb-4">
                            {[
                                "Inappropriate or offensive language",
                                "Harassment or hate speech",
                                "Spam or promotional solicitation",
                                "Misleading academic or project info",
                                "Violates campus honor code"
                            ].map((reason) => (
                                <label
                                    key={reason}
                                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                                        reportReason === reason
                                            ? "border-indigo-600 bg-indigo-50/70 text-indigo-900 font-semibold"
                                            : "border-slate-200 hover:bg-slate-50 text-slate-700"
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="reportReason"
                                        checked={reportReason === reason}
                                        onChange={() => setReportReason(reason)}
                                        className="text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span>{reason}</span>
                                </label>
                            ))}
                        </div>

                        <div className="flex items-center justify-end gap-2">
                            <button
                                onClick={() => setReportModalData(null)}
                                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitReport}
                                className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs cursor-pointer"
                            >
                                Submit Report
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
