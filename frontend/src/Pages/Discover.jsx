import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../App";
import Sidebar from "../components/Sidebar";
import RightHome from "../components/RightHome";
import Nav from "../components/Nav";
import MobileTopBar from "../components/MobileTopBar";
import VerifiedBadge from "../components/VerifiedBadge";
import dp from "../assets/dp.jpg";
import {
    Search,
    GraduationCap,
    BookOpen,
    Calendar,
    Sparkles,
    UserPlus,
    Check,
    MessageCircle,
    Filter,
    ShieldCheck,
    X,
    XCircle
} from "lucide-react";

export default function Discover() {
    const navigate = useNavigate();
    const { userData } = useSelector((state) => state.user);

    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [collegeFilter, setCollegeFilter] = useState("all");
    const [courseFilter, setCourseFilter] = useState("all");
    const [yearFilter, setYearFilter] = useState("all");
    const [skillFilter, setSkillFilter] = useState("all");
    const [verificationFilter, setVerificationFilter] = useState("all");
    const [sentMap, setSentMap] = useState({});
    const [actionMsg, setActionMsg] = useState("");

    const popularSkills = [
        "React",
        "Python",
        "Node.js",
        "UI/UX Design",
        "AI/ML",
        "Figma",
        "TypeScript",
        "Data Science",
        "WebRTC"
    ];

    const colleges = [
        "Stanford University",
        "Massachusetts Institute of Technology (MIT)",
        "IIT Bombay",
        "UC Berkeley",
        "Harvard University"
    ];

    const courses = [
        "B.S. Computer Science",
        "B.S. Artificial Intelligence & Robotics",
        "B.Tech Electrical & CS",
        "B.A. Data Science & Economics",
        "B.S. Bioengineering"
    ];

    const years = [
        "Class of 2024",
        "Class of 2025",
        "Class of 2026",
        "Class of 2027",
        "Class of 2028"
    ];

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const params = {};
            if (searchQuery.trim()) params.search = searchQuery.trim();
            if (collegeFilter !== "all") params.college = collegeFilter;
            if (courseFilter !== "all") params.degree = courseFilter;
            if (yearFilter !== "all") params.year = yearFilter;
            if (skillFilter !== "all") params.skill = skillFilter;
            if (verificationFilter !== "all") params.verificationStatus = verificationFilter;

            const res = await axios.get(`${serverUrl}/api/user/discover`, {
                params,
                withCredentials: true
            });
            setStudents(res.data);
        } catch (error) {
            console.error("Discover error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchStudents();
        }, 300);
        return () => clearTimeout(timeout);
    }, [searchQuery, collegeFilter, courseFilter, yearFilter, skillFilter, verificationFilter]);

    // Send connection request
    const handleConnect = async (targetUserId) => {
        try {
            const res = await axios.post(
                `${serverUrl}/api/connections/request/${targetUserId}`,
                {},
                { withCredentials: true }
            );
            setSentMap((prev) => ({ ...prev, [targetUserId]: "pending" }));
            setActionMsg("Connection request sent!");
            setTimeout(() => setActionMsg(""), 3500);
        } catch (error) {
            const msg = error.response?.data?.message || "Could not send connection request.";
            setActionMsg(msg);
            setTimeout(() => setActionMsg(""), 4500);
        }
    };

    const clearFilters = () => {
        setSearchQuery("");
        setCollegeFilter("all");
        setCourseFilter("all");
        setYearFilter("all");
        setSkillFilter("all");
        setVerificationFilter("all");
    };

    return (
        <div className="w-full min-h-screen bg-slate-50 flex justify-center">
            <Sidebar />

            <main className="flex-1 min-h-screen max-w-3xl w-full border-r border-slate-200/80 pb-24 lg:pb-12 bg-white">
                {/* Mobile Top Navigation */}
                <MobileTopBar title="Discover" subtitle="Students & Teammates" />

                {/* Search & Filter Header */}
                <div className="p-3.5 sm:p-6 border-b border-slate-200 bg-white">
                    <div className="hidden lg:flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                                <Sparkles className="text-indigo-600" size={24} />
                                <span>Discover Students & Teammates</span>
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                                Step 4: Search by skills, course, year, or college
                            </p>
                        </div>
                    </div>

                    {/* Feedback Toast */}
                    {actionMsg && (
                        <div className="mb-3 p-2.5 bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs rounded-xl font-semibold flex items-center justify-between">
                            <span>{actionMsg}</span>
                            <button onClick={() => setActionMsg("")}>✕</button>
                        </div>
                    )}

                    {/* Search Bar */}
                    <div className="relative mb-3">
                        <Search
                            size={18}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search students by name, college, course, graduation year, or skills..."
                            className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all shadow-2xs"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    {/* Multi-Filter Bar: College, Course, Year, Verification */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs flex-wrap sm:flex-nowrap">
                        {/* College Filter Dropdown */}
                        <select
                            value={collegeFilter}
                            onChange={(e) => setCollegeFilter(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium outline-none cursor-pointer"
                        >
                            <option value="all">All Colleges</option>
                            {colleges.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>

                        {/* Course / Degree Filter */}
                        <select
                            value={courseFilter}
                            onChange={(e) => setCourseFilter(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium outline-none cursor-pointer"
                        >
                            <option value="all">All Courses</option>
                            {courses.map((course) => (
                                <option key={course} value={course}>
                                    {course}
                                </option>
                            ))}
                        </select>

                        {/* Graduation Year Filter */}
                        <select
                            value={yearFilter}
                            onChange={(e) => setYearFilter(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium outline-none cursor-pointer"
                        >
                            <option value="all">All Years</option>
                            {years.map((y) => (
                                <option key={y} value={y}>
                                    {y}
                                </option>
                            ))}
                        </select>

                        {/* Verification Filter Dropdown */}
                        <select
                            value={verificationFilter}
                            onChange={(e) => setVerificationFilter(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium outline-none cursor-pointer"
                        >
                            <option value="all">All Statuses</option>
                            <option value="Verified">Verified Only 🎓</option>
                            <option value="Pending">Pending Review</option>
                            <option value="Unverified">Unverified</option>
                        </select>

                        {/* Reset button if active */}
                        {(searchQuery ||
                            collegeFilter !== "all" ||
                            courseFilter !== "all" ||
                            yearFilter !== "all" ||
                            skillFilter !== "all" ||
                            verificationFilter !== "all") && (
                            <button
                                onClick={clearFilters}
                                className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1 cursor-pointer shrink-0"
                            >
                                Reset
                            </button>
                        )}
                    </div>

                    {/* Popular Skills Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pt-2 scrollbar-none">
                        <span className="text-[11px] text-slate-400 font-medium shrink-0">Skills:</span>
                        <button
                            onClick={() => setSkillFilter("all")}
                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 cursor-pointer transition-colors ${
                                skillFilter === "all"
                                    ? "bg-indigo-600 text-white"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                        >
                            All
                        </button>
                        {popularSkills.map((sk) => (
                            <button
                                key={sk}
                                onClick={() => setSkillFilter(skillFilter === sk ? "all" : sk)}
                                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 cursor-pointer transition-colors ${
                                    skillFilter === sk
                                        ? "bg-indigo-600 text-white shadow-2xs"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                            >
                                {sk}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Students Results Grid */}
                <div className="p-5">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map((n) => (
                                <div key={n} className="p-4 rounded-2xl border border-slate-200 animate-pulse">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-12 h-12 rounded-full bg-slate-200" />
                                        <div className="space-y-2 flex-1">
                                            <div className="h-4 bg-slate-200 rounded w-1/2" />
                                            <div className="h-3 bg-slate-200 rounded w-1/3" />
                                        </div>
                                    </div>
                                    <div className="h-10 bg-slate-100 rounded-lg mb-2" />
                                </div>
                            ))}
                        </div>
                    ) : students.length === 0 ? (
                        <div className="py-16 text-center">
                            <div className="w-14 h-14 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                                <Search size={24} />
                            </div>
                            <h3 className="font-bold text-slate-800 text-base mb-1">No students found</h3>
                            <p className="text-xs text-slate-500 mb-4">
                                Try searching with different keywords, courses, years, or skills.
                            </p>
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {students.map((student) => {
                                const isConnected = userData?.connections?.some(
                                    (id) => (typeof id === "string" ? id : id._id)?.toString() === student._id.toString()
                                );
                                const isPendingSent =
                                    sentMap[student._id] === "pending" ||
                                    userData?.sentRequests?.some(
                                        (r) =>
                                            (typeof r.to === "string" ? r.to : r.to?._id)?.toString() === student._id.toString() &&
                                            r.status === "pending"
                                    );
                                const isRejected = userData?.sentRequests?.some(
                                    (r) =>
                                        (typeof r.to === "string" ? r.to : r.to?._id)?.toString() === student._id.toString() &&
                                        r.status === "rejected"
                                );
                                const hasReceivedRequest = userData?.connectionRequests?.some(
                                    (r) =>
                                        (typeof r.from === "string" ? r.from : r.from?._id)?.toString() === student._id.toString() &&
                                        r.status === "pending"
                                );

                                return (
                                    <div
                                        key={student._id}
                                        className="bg-white p-4 rounded-2xl border border-slate-200/90 hover:border-indigo-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                                    >
                                        <div>
                                            {/* Avatar & Info */}
                                            <div
                                                onClick={() => navigate(`/profile/${student.userName}`)}
                                                className="flex items-start gap-3 cursor-pointer group mb-3"
                                            >
                                                <img
                                                    src={student.profileImage || dp}
                                                    alt={student.name}
                                                    className="w-12 h-12 rounded-full object-cover border-2 border-indigo-100 group-hover:border-indigo-500 transition-colors shrink-0"
                                                />
                                                <div className="overflow-hidden flex-1">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors text-sm">
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
                                                </div>
                                            </div>

                                            {/* College, Degree & Year Info */}
                                            <div className="mb-3 space-y-1 text-xs text-slate-600">
                                                {student.college && (
                                                    <div className="flex items-center gap-1.5 text-slate-700 font-semibold truncate">
                                                        <GraduationCap size={14} className="text-indigo-600 shrink-0" />
                                                        <span className="truncate">{student.college}</span>
                                                    </div>
                                                )}
                                                {student.degree && (
                                                    <div className="flex items-center gap-1.5 text-slate-500 truncate">
                                                        <BookOpen size={13} className="text-slate-400 shrink-0" />
                                                        <span className="truncate">{student.degree}</span>
                                                    </div>
                                                )}
                                                {student.year && (
                                                    <div className="flex items-center gap-1.5 text-slate-500 truncate">
                                                        <Calendar size={13} className="text-slate-400 shrink-0" />
                                                        <span className="truncate">{student.year}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Bio snippet */}
                                            {student.bio && (
                                                <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
                                                    {student.bio}
                                                </p>
                                            )}

                                            {/* Skills Chips */}
                                            {student.skills && student.skills.length > 0 && (
                                                <div className="flex items-center gap-1 flex-wrap mb-4">
                                                    {student.skills.slice(0, 4).map((sk, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-[11px] px-2 py-0.5 rounded-md font-medium"
                                                        >
                                                            {sk}
                                                        </span>
                                                    ))}
                                                    {student.skills.length > 4 && (
                                                        <span className="text-[10px] text-slate-400">
                                                            +{student.skills.length - 4} more
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Buttons: Connect -> Connected + Message */}
                                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                                            <button
                                                onClick={() => navigate(`/profile/${student.userName}`)}
                                                className="text-xs font-semibold text-slate-600 hover:text-indigo-600 cursor-pointer"
                                            >
                                                View Profile
                                            </button>

                                            {isConnected ? (
                                                <div className="flex items-center gap-1.5">
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold shadow-2xs">
                                                        <Check size={13} />
                                                        <span>Connected</span>
                                                    </span>
                                                    <button
                                                        onClick={() => navigate(`/messages/${student._id}`)}
                                                        className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                                                    >
                                                        <MessageCircle size={13} />
                                                        <span>Message</span>
                                                    </button>
                                                </div>
                                            ) : hasReceivedRequest ? (
                                                <button
                                                    onClick={() => navigate("/requests")}
                                                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                                                >
                                                    <span>Respond</span>
                                                </button>
                                            ) : isPendingSent ? (
                                                <span className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-500 text-xs font-semibold">
                                                    <Check size={14} />
                                                    <span>Requested</span>
                                                </span>
                                            ) : isRejected ? (
                                                <span
                                                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 text-xs font-semibold"
                                                    title="Your request was declined. You cannot bypass this rule."
                                                >
                                                    <XCircle size={13} />
                                                    <span>Declined</span>
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => handleConnect(student._id)}
                                                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
                                                >
                                                    <UserPlus size={14} />
                                                    <span>Connect</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            <RightHome />
            <Nav />
        </div>
    );
}
