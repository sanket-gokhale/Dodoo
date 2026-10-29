import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { serverUrl } from "../App";
import {
    ArrowLeft,
    Image,
    Sparkles,
    Send,
    Plus,
    X,
    Upload as UploadIcon,
    GraduationCap
} from "lucide-react";
import { ThreeDots } from "react-loader-spinner";
import dp from "../assets/dp.jpg";
import Nav from "../components/Nav";

export default function UploadPage() {
    const navigate = useNavigate();
    const { userData } = useSelector((state) => state.user);

    const [postType, setPostType] = useState("all"); // 'all' (text + optional image)
    const [caption, setCaption] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isTeammateSearch, setIsTeammateSearch] = useState(false);
    const [projectRole, setProjectRole] = useState("");
    const [skillsInput, setSkillsInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!caption.trim() && !selectedFile) {
            setErrorMsg("Please provide text or an image for your post.");
            return;
        }

        setLoading(true);
        setErrorMsg("");

        try {
            const formData = new FormData();
            formData.append("caption", caption.trim());
            formData.append("mediaType", selectedFile ? "image" : "text");
            formData.append("isProjectTeammateSearch", isTeammateSearch);

            if (isTeammateSearch) {
                formData.append("projectRole", projectRole.trim());
                const parsedSkills = skillsInput
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean);
                formData.append("requiredSkills", JSON.stringify(parsedSkills));
            }

            if (selectedFile) {
                formData.append("media", selectedFile);
            }

            await axios.post(`${serverUrl}/api/post/upload`, formData, {
                withCredentials: true
            });

            navigate("/");
        } catch (error) {
            console.error("Create post error:", error);
            setErrorMsg(error.response?.data?.message || "Failed to create post. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen bg-slate-50 flex justify-center py-3 px-3 sm:py-6 sm:px-4 pb-28 sm:pb-8">
            <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-8 flex flex-col justify-between">
                <div>
                    {/* Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full cursor-pointer transition-colors"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">Create Campus Post</h1>
                                <p className="text-xs text-slate-500">
                                    Share text, project updates, or look for hackathon teammates
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Author Preview Card */}
                    <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                        <img
                            src={userData?.profileImage || dp}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover border border-slate-300"
                        />
                        <div>
                            <span className="font-bold text-xs sm:text-sm text-slate-900 block">
                                {userData?.name}
                            </span>
                            <span className="text-[11px] text-slate-500">
                                {userData?.college ? `${userData.college} • ` : ""}
                                {userData?.verificationStatus === "Verified" ? "Verified Student 🎓" : "Student Member"}
                            </span>
                        </div>
                    </div>

                    {errorMsg && (
                        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-semibold">
                            {errorMsg}
                        </div>
                    )}

                    <form onSubmit={handleCreatePost} className="space-y-4">
                        {/* Caption Textarea */}
                        <div>
                            <textarea
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                placeholder="What's happening on campus? Share insights, questions, or project announcements..."
                                rows={4}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-indigo-500 resize-none"
                                autoFocus
                            />
                        </div>

                        {/* LinkedIn-style Project Teammate Search Toggle */}
                        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50/70 to-purple-50/70 border border-indigo-100 space-y-3">
                            <label className="flex items-center justify-between cursor-pointer">
                                <div className="flex items-center gap-2">
                                    <Sparkles size={18} className="text-indigo-600" />
                                    <div>
                                        <div className="text-xs sm:text-sm font-bold text-slate-900">
                                            Recruit Project / Hackathon Teammates
                                        </div>
                                        <div className="text-[11px] text-slate-500">
                                            Adds a prominent teammate banner with desired skills matching
                                        </div>
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={isTeammateSearch}
                                    onChange={(e) => setIsTeammateSearch(e.target.checked)}
                                    className="w-4 h-4 text-indigo-600 rounded"
                                />
                            </label>

                            {isTeammateSearch && (
                                <div className="space-y-3 pt-2 border-t border-indigo-100">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">
                                            Role / Position Title
                                        </label>
                                        <input
                                            type="text"
                                            value={projectRole}
                                            onChange={(e) => setProjectRole(e.target.value)}
                                            placeholder="e.g. Frontend Developer, Computer Vision Specialist, Product Designer"
                                            className="w-full bg-white border border-indigo-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm outline-none focus:border-indigo-500"
                                            required={isTeammateSearch}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">
                                            Required Skills (comma separated)
                                        </label>
                                        <input
                                            type="text"
                                            value={skillsInput}
                                            onChange={(e) => setSkillsInput(e.target.value)}
                                            placeholder="e.g. React, WebRTC, Python, TailwindCSS"
                                            className="w-full bg-white border border-indigo-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm outline-none focus:border-indigo-500"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Image / Media Upload Section */}
                        {previewUrl ? (
                            <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-h-64 flex items-center justify-center bg-slate-900">
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="max-h-64 object-contain"
                                />
                                <button
                                    type="button"
                                    onClick={handleRemoveFile}
                                    className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors cursor-pointer"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <label className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                <Image size={28} className="text-slate-400 mb-2" />
                                <span className="text-xs font-bold text-slate-700">
                                    Attach an image or project screenshot (optional)
                                </span>
                                <span className="text-[11px] text-slate-400">
                                    Supports PNG, JPG, WebP
                                </span>
                            </label>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-100 flex items-center justify-center gap-2 transition-all cursor-pointer mt-4"
                        >
                            {loading ? (
                                <ThreeDots height="20" width="35" color="white" />
                            ) : (
                                <>
                                    <Send size={16} />
                                    <span>Publish Post</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            <Nav />
        </div>
    );
}
