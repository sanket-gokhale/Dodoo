import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { serverUrl } from "../App";
import Sidebar from "../components/Sidebar";
import Nav from "../components/Nav";
import MobileTopBar from "../components/MobileTopBar";
import VerifiedBadge from "../components/VerifiedBadge";
import dp from "../assets/dp.jpg";
import {
    MessageCircle,
    Lock,
    Send,
    UserPlus,
    Check,
    GraduationCap,
    ArrowLeft,
    ShieldAlert,
    Clock
} from "lucide-react";

export default function Messages() {
    const { targetUserId } = useParams();
    const navigate = useNavigate();
    const { userData } = useSelector((state) => state.user);

    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [activeContact, setActiveContact] = useState(null);
    const [isLocked, setIsLocked] = useState(false);
    const [lockMessage, setLockMessage] = useState("");
    const [newMessageText, setNewMessageText] = useState("");
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [loadingChat, setLoadingChat] = useState(false);
    const [sending, setSending] = useState(false);
    const [requestSent, setRequestSent] = useState(false);

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Fetch conversation list
    const fetchConversations = async () => {
        setLoadingConversations(true);
        try {
            const res = await axios.get(`${serverUrl}/api/messages/conversations`, { withCredentials: true });
            setConversations(res.data);

            // If no targetUserId selected, auto-select the first conversation if available (desktop only)
            if (!targetUserId && res.data.length > 0 && typeof window !== "undefined" && window.innerWidth >= 768) {
                navigate(`/messages/${res.data[0].contact._id}`, { replace: true });
            }
        } catch (error) {
            console.error("Fetch conversations error:", error);
        } finally {
            setLoadingConversations(false);
        }
    };

    useEffect(() => {
        fetchConversations();
    }, []);

    // Fetch chat history with target user (locked check)
    const fetchChat = async (userId) => {
        if (!userId) return;
        setLoadingChat(true);
        setIsLocked(false);
        setRequestSent(false);

        try {
            const res = await axios.get(`${serverUrl}/api/messages/${userId}`, { withCredentials: true });
            setMessages(res.data.messages || []);
            setActiveContact(res.data.targetUser);
            setIsLocked(false);
        } catch (error) {
            if (error.response?.status === 403) {
                setIsLocked(true);
                setLockMessage(error.response.data.message);
                setActiveContact(error.response.data.targetUser);
            } else {
                console.error("Chat error:", error);
            }
        } finally {
            setLoadingChat(false);
        }
    };

    useEffect(() => {
        if (targetUserId) {
            fetchChat(targetUserId);
        }
    }, [targetUserId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Send Message
    const handleSendMessage = async (e) => {
        e?.preventDefault();
        if (!newMessageText.trim() || sending || !targetUserId || isLocked) return;

        setSending(true);
        try {
            const res = await axios.post(
                `${serverUrl}/api/messages/send/${targetUserId}`,
                { text: newMessageText.trim() },
                { withCredentials: true }
            );
            setMessages((prev) => [...prev, res.data]);
            setNewMessageText("");
            fetchConversations();
        } catch (error) {
            console.error("Send message error:", error);
        } finally {
            setSending(false);
        }
    };

    // Send Connection Request from Lock Screen
    const handleSendRequest = async () => {
        if (!targetUserId) return;
        try {
            await axios.post(
                `${serverUrl}/api/connections/request/${targetUserId}`,
                {},
                { withCredentials: true }
            );
            setRequestSent(true);
        } catch (error) {
            console.error("Request error:", error);
        }
    };

    // Format message time
    const formatTime = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    return (
        <div className="w-full min-h-screen bg-slate-50 flex justify-center">
            <Sidebar />

            <div className="flex-1 min-h-screen max-w-5xl w-full flex bg-white border-r border-slate-200">
                {/* Conversations Sidebar (Left Column) */}
                <div
                    className={`w-full md:w-80 border-r border-slate-200 flex flex-col h-screen sticky top-0 ${
                        targetUserId ? "hidden md:flex" : "flex"
                    }`}
                >
                    {/* Mobile Header */}
                    <MobileTopBar title="Messages" subtitle="Direct chats with mutual connections" />

                    {/* Desktop Header */}
                    <div className="hidden md:block p-4 border-b border-slate-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <MessageCircle className="text-indigo-600" size={22} />
                                <span>Messages</span>
                            </h2>
                            <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full">
                                {conversations.length} {conversations.length === 1 ? "chat" : "chats"}
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                            Private messaging unlocked between connected students
                        </p>
                    </div>

                    {/* Conversation List */}
                    <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                        {loadingConversations ? (
                            <div className="p-4 space-y-3">
                                {[1, 2, 3].map((n) => (
                                    <div key={n} className="flex items-center gap-3 animate-pulse">
                                        <div className="w-10 h-10 rounded-full bg-slate-200" />
                                        <div className="space-y-1.5 flex-1">
                                            <div className="h-3.5 bg-slate-200 rounded w-1/2" />
                                            <div className="h-2.5 bg-slate-200 rounded w-3/4" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : conversations.length === 0 ? (
                            <div className="p-8 text-center text-slate-400">
                                <Lock size={28} className="mx-auto mb-2 text-slate-300" />
                                <p className="text-xs font-semibold text-slate-600 mb-1">No chats yet</p>
                                <p className="text-[11px] text-slate-400 mb-3">
                                    Accept connection requests to start messaging!
                                </p>
                                <button
                                    onClick={() => navigate("/requests")}
                                    className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-xl font-semibold cursor-pointer"
                                >
                                    View Requests
                                </button>
                            </div>
                        ) : (
                            conversations.map(({ contact, lastMessage, lastMessageTime }) => {
                                const isSelected = targetUserId === contact._id;
                                return (
                                    <div
                                        key={contact._id}
                                        onClick={() => navigate(`/messages/${contact._id}`)}
                                        className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors ${
                                            isSelected
                                                ? "bg-indigo-50/80 border-l-4 border-indigo-600"
                                                : "hover:bg-slate-50"
                                        }`}
                                    >
                                        <img
                                            src={contact.profileImage || dp}
                                            alt={contact.name}
                                            className="w-11 h-11 rounded-full object-cover border border-slate-200 shrink-0"
                                        />
                                        <div className="overflow-hidden flex-1">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <div className="flex items-center gap-1.5 truncate">
                                                    <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                                                        {contact.name}
                                                    </span>
                                                    {contact.verificationStatus === "Verified" && (
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                                    )}
                                                </div>
                                                <span className="text-[10px] text-slate-400 shrink-0">
                                                    {formatTime(lastMessageTime)}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 truncate">{lastMessage}</p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Active Chat Window (Right Column) */}
                <div
                    className={`flex-1 flex flex-col h-screen ${
                        !targetUserId ? "hidden md:flex items-center justify-center" : "flex"
                    }`}
                >
                    {!targetUserId ? (
                        <div className="text-center p-8 text-slate-400">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                                <MessageCircle size={32} />
                            </div>
                            <h3 className="font-bold text-slate-700 text-lg mb-1">Your Direct Messages</h3>
                            <p className="text-xs text-slate-400 max-w-sm">
                                Select a connected student from the left to start a private conversation.
                            </p>
                        </div>
                    ) : isLocked ? (
                        /* Connection Locked Screen */
                        <div className="flex-1 flex flex-col">
                            {/* Mobile Back Button */}
                            <div className="p-4 border-b border-slate-200 md:hidden flex items-center gap-2">
                                <button onClick={() => navigate("/messages")} className="p-1 text-slate-600">
                                    <ArrowLeft size={20} />
                                </button>
                                <span className="font-bold text-slate-800 text-sm">Back to Chats</span>
                            </div>

                            <div className="flex-1 flex items-center justify-center p-6 bg-slate-50/50">
                                <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 text-center shadow-lg">
                                    <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
                                        <Lock size={32} />
                                    </div>

                                    <h2 className="text-xl font-black text-slate-900 mb-2">
                                        Private Messaging Locked
                                    </h2>

                                    <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
                                        To maintain genuine student safety and eliminate unsolicited spam, private 1-on-1 messaging unlocks only after both students accept a mutual connection request.
                                    </p>

                                    {activeContact && (
                                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 mb-6 flex items-center gap-3 text-left">
                                            <img
                                                src={activeContact.profileImage || dp}
                                                alt={activeContact.name}
                                                className="w-12 h-12 rounded-full object-cover border border-slate-200"
                                            />
                                            <div className="overflow-hidden flex-1">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-bold text-sm text-slate-900">
                                                        {activeContact.name}
                                                    </span>
                                                    <VerifiedBadge
                                                        status={activeContact.verificationStatus}
                                                        college={activeContact.college}
                                                        size="sm"
                                                    />
                                                </div>
                                                <span className="text-xs text-slate-400 block truncate">
                                                    {activeContact.college || `@${activeContact.userName}`}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {requestSent ? (
                                        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
                                            <Check size={16} />
                                            <span>Connection Request Sent! Messaging unlocks upon acceptance.</span>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={handleSendRequest}
                                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-100 flex items-center justify-center gap-2 transition-all cursor-pointer"
                                        >
                                            <UserPlus size={18} />
                                            <span>Send Connection Request to Message</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Unlocked Chat View */
                        <div className="flex-1 flex flex-col h-full">
                            {/* Chat Header */}
                            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-white z-10 shadow-2xs">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => navigate("/messages")}
                                        className="md:hidden p-1 text-slate-600 hover:text-slate-900 cursor-pointer"
                                    >
                                        <ArrowLeft size={20} />
                                    </button>

                                    <div
                                        onClick={() => activeContact && navigate(`/profile/${activeContact.userName}`)}
                                        className="flex items-center gap-3 cursor-pointer group"
                                    >
                                        <img
                                            src={activeContact?.profileImage || dp}
                                            alt={activeContact?.name || "Student"}
                                            className="w-10 h-10 rounded-full object-cover border border-slate-200"
                                        />
                                        <div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                                                    {activeContact?.name || "Student"}
                                                </span>
                                                <VerifiedBadge
                                                    status={activeContact?.verificationStatus}
                                                    college={activeContact?.college}
                                                    size="sm"
                                                />
                                            </div>
                                            <span className="text-[11px] text-slate-400 block">
                                                {activeContact?.college || "Connected Member"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Chat Messages Thread */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/40">
                                {loadingChat ? (
                                    <div className="text-center text-xs text-slate-400 py-10">
                                        Loading messages...
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="text-center py-16 text-slate-400">
                                        <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2">
                                            <MessageCircle size={22} />
                                        </div>
                                        <p className="text-xs font-semibold text-slate-600">
                                            Connection accepted!
                                        </p>
                                        <p className="text-[11px] text-slate-400">
                                            Say hello to your fellow student 👋
                                        </p>
                                    </div>
                                ) : (
                                    messages.map((msg) => {
                                        const isMine =
                                            (msg.sender?._id || msg.sender)?.toString() === userData?._id?.toString();

                                        return (
                                            <div
                                                key={msg._id}
                                                className={`flex flex-col ${
                                                    isMine ? "items-end" : "items-start"
                                                }`}
                                            >
                                                <div
                                                    className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                                                        isMine
                                                            ? "bg-indigo-600 text-white rounded-br-xs shadow-xs"
                                                            : "bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs shadow-2xs"
                                                    }`}
                                                >
                                                    {msg.text}
                                                </div>
                                                <span className="text-[10px] text-slate-400 mt-1 px-1">
                                                    {formatTime(msg.createdAt)}
                                                </span>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input Box */}
                            <form
                                onSubmit={handleSendMessage}
                                className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2"
                            >
                                <input
                                    type="text"
                                    value={newMessageText}
                                    onChange={(e) => setNewMessageText(e.target.value)}
                                    placeholder={`Message ${activeContact?.name?.split(" ")[0] || "student"}...`}
                                    className="flex-1 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-full px-4 py-2.5 text-xs sm:text-sm text-slate-800 outline-none transition-all shadow-2xs"
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    disabled={sending || !newMessageText.trim()}
                                    className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white flex items-center justify-center transition-colors cursor-pointer shadow-xs shrink-0"
                                >
                                    <Send size={16} />
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            <Nav />
        </div>
    );
}
