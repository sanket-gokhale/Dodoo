import React, { useState } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { serverUrl } from "../App";
import { setUserData } from "../redux/userSlice";
import Sidebar from "../components/Sidebar";
import RightHome from "../components/RightHome";
import Nav from "../components/Nav";
import MobileTopBar from "../components/MobileTopBar";
import VerifiedBadge from "../components/VerifiedBadge";
import {
    ShieldCheck,
    Mail,
    CreditCard,
    CheckCircle2,
    Clock,
    AlertCircle,
    XCircle,
    Sparkles,
    Upload,
    GraduationCap,
    Info,
    RefreshCw,
    ShieldAlert
} from "lucide-react";

export default function Verification() {
    const dispatch = useDispatch();
    const { userData } = useSelector((state) => state.user);

    const [selectedMethod, setSelectedMethod] = useState("email"); // 'email' | 'id_card'
    const [collegeEmail, setCollegeEmail] = useState(userData?.collegeEmail || "");
    const [collegeName, setCollegeName] = useState(userData?.college || "");
    const [studentIdNumber, setStudentIdNumber] = useState("");
    const [idCardPreview, setIdCardPreview] = useState(null);
    const [instantVerifyId, setInstantVerifyId] = useState(false);
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState({ type: "", message: "" });

    const approvedDomains = [
        "stanford.edu",
        "mit.edu",
        "harvard.edu",
        "berkeley.edu",
        "iitb.ac.in",
        "iitd.ac.in",
        "ox.ac.uk",
        "*.edu",
        "*.ac.in"
    ];

    // Submit College Email Simulation
    const handleSubmitEmail = async (e) => {
        e.preventDefault();
        setLoading(true);
        setFeedback({ type: "", message: "" });

        try {
            const res = await axios.post(
                `${serverUrl}/api/verification/submit-email`,
                { collegeEmail, collegeName, simulateApproval: instantVerifyId },
                { withCredentials: true }
            );
            dispatch(setUserData(res.data.user));
            setFeedback({ type: "success", message: res.data.message });
        } catch (error) {
            setFeedback({
                type: "error",
                message: error.response?.data?.message || "Verification failed. Check the domain."
            });
        } finally {
            setLoading(false);
        }
    };

    // Submit Student ID Simulation
    const handleSubmitId = async (e) => {
        e.preventDefault();
        setLoading(true);
        setFeedback({ type: "", message: "" });

        try {
            const res = await axios.post(
                `${serverUrl}/api/verification/submit-id`,
                {
                    collegeName,
                    studentIdNumber,
                    simulateApproval: instantVerifyId,
                    idCardImage: idCardPreview || "demo-student-id.png"
                },
                { withCredentials: true }
            );
            dispatch(setUserData(res.data.user));
            setFeedback({ type: "success", message: res.data.message });
        } catch (error) {
            setFeedback({
                type: "error",
                message: error.response?.data?.message || "ID submission failed."
            });
        } finally {
            setLoading(false);
        }
    };

    // Predefined Verification Outcomes & Mock Review Action
    const handleSetStatus = async (status, reviewNote = "") => {
        setLoading(true);
        try {
            const res = await axios.post(
                `${serverUrl}/api/verification/set-status`,
                { status, reviewNote },
                { withCredentials: true }
            );
            dispatch(setUserData(res.data.user));
            setFeedback({
                type: "success",
                message: `Mock Review executed: Status is now "${status}". Backend determined and saved on database.`
            });
        } catch (error) {
            console.error("Status switch error:", error);
            setFeedback({
                type: "error",
                message: error.response?.data?.message || "Status change failed"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setIdCardPreview(URL.createObjectURL(file));
        }
    };

    const currentStatus = userData?.verificationStatus || "Unverified";

    return (
        <div className="w-full min-h-screen bg-slate-50 flex justify-center">
            <Sidebar />

            <main className="flex-1 min-h-screen max-w-3xl w-full border-r border-slate-200/80 pb-24 lg:pb-12 bg-white">
                {/* Mobile Top Navigation */}
                <MobileTopBar title="Verification" subtitle="Academic Credential Review" showBack />

                {/* Desktop Header */}
                <div className="hidden lg:block p-5 sm:p-6 border-b border-slate-200">
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <ShieldCheck className="text-indigo-600" size={26} />
                        <span>College Member Verification</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Step 2 & 3 of user journey: Verify academic enrollment via college email confirmation or student ID review.
                    </p>
                </div>

                <div className="p-5 sm:p-6 space-y-6">
                    {/* Current Verification Status Banner (Step 3: Pending, Verified, or Rejected) */}
                    <div
                        className={`p-5 rounded-3xl border transition-all ${
                            currentStatus === "Verified"
                                ? "bg-emerald-50/80 border-emerald-200 text-emerald-950 shadow-xs"
                                : currentStatus === "Pending"
                                ? "bg-amber-50/80 border-amber-200 text-amber-950 shadow-xs"
                                : currentStatus === "Rejected"
                                ? "bg-rose-50/80 border-rose-200 text-rose-950 shadow-xs"
                                : "bg-slate-50 border-slate-200 text-slate-800"
                        }`}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1.5">
                                    {currentStatus === "Verified" ? (
                                        <CheckCircle2 size={24} className="text-emerald-600" />
                                    ) : currentStatus === "Pending" ? (
                                        <Clock size={24} className="text-amber-600" />
                                    ) : currentStatus === "Rejected" ? (
                                        <XCircle size={24} className="text-rose-600" />
                                    ) : (
                                        <AlertCircle size={24} className="text-slate-400" />
                                    )}
                                    <h2 className="text-lg font-black tracking-tight">
                                        Current Status: {currentStatus}
                                    </h2>
                                </div>
                                <p className="text-xs sm:text-sm opacity-85 leading-relaxed max-w-md">
                                    {currentStatus === "Verified"
                                        ? `You are verified as an active student of ${userData?.college || "your college"}. Your verified student badge is unlocked across all posts and discovery!`
                                        : currentStatus === "Pending"
                                        ? "Your student credential is under simulated review. Current policy allows exploring the feed and student search; verified badge unlocks upon review."
                                        : currentStatus === "Rejected"
                                        ? "Your verification review was declined. Reason: Document illegible or college mismatch. You can re-submit your ID or email below."
                                        : "Your account is currently unverified. Choose a verification method below to submit your credentials."}
                                </p>
                                {userData?.verificationReviewNote && (
                                    <div className="mt-2.5 text-xs font-semibold px-2.5 py-1 bg-white/70 rounded-lg border border-black/5 inline-block">
                                        Reviewer note: {userData.verificationReviewNote}
                                    </div>
                                )}
                            </div>

                            <VerifiedBadge
                                status={currentStatus}
                                college={userData?.college}
                                size="md"
                                showLabel
                            />
                        </div>
                    </div>

                    {/* Predefined Verification Outcomes & Mock Review Action (Step 4 & Demo Requirements) */}
                    <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/70">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                                <Sparkles size={15} className="text-indigo-600" />
                                <span>Mock Review Action & Predefined Outcomes</span>
                            </span>
                            <span className="text-[11px] text-indigo-600 font-semibold">Backend-enforced status</span>
                        </div>
                        <p className="text-xs text-indigo-800/80 mb-3">
                            The backend strictly determines your verification status, never the frontend alone. Click any predefined institutional review outcome below:
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                            <button
                                onClick={() =>
                                    handleSetStatus("Verified", "Institutional credentials reviewed and verified by campus admin 🎓")
                                }
                                disabled={loading}
                                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
                            >
                                Outcome: Approve (Verified) 🎓
                            </button>
                            <button
                                onClick={() =>
                                    handleSetStatus("Pending", "Student ID submitted for manual review by campus team ⏳")
                                }
                                disabled={loading}
                                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-colors cursor-pointer"
                            >
                                Outcome: Set Pending ⏳
                            </button>
                            <button
                                onClick={() =>
                                    handleSetStatus("Rejected", "ID card unreadable or graduation year mismatch with registrar ❌")
                                }
                                disabled={loading}
                                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors cursor-pointer"
                            >
                                Outcome: Reject (Declined) ❌
                            </button>
                            <button
                                onClick={() => handleSetStatus("Unverified", "")}
                                disabled={loading}
                                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-600 hover:bg-slate-700 text-white shadow-xs transition-colors cursor-pointer"
                            >
                                Reset: Unverified 🛡️
                            </button>
                        </div>
                    </div>

                    {/* Method Selector Tabs (Step 2: Choose Verification) */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-800 mb-3">
                            Step 2: Choose Verification Method
                        </h3>
                        <div className="grid grid-cols-2 gap-3 mb-5">
                            <button
                                onClick={() => setSelectedMethod("email")}
                                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                                    selectedMethod === "email"
                                        ? "border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20"
                                        : "border-slate-200 hover:bg-slate-50"
                                }`}
                            >
                                <Mail
                                    size={22}
                                    className={selectedMethod === "email" ? "text-indigo-600" : "text-slate-400"}
                                />
                                <div className="mt-2">
                                    <div className="font-bold text-xs sm:text-sm text-slate-900">
                                        College Email Confirmation
                                    </div>
                                    <div className="text-[11px] text-slate-500">
                                        Enter approved .edu or .ac.in domain
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => setSelectedMethod("id_card")}
                                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                                    selectedMethod === "id_card"
                                        ? "border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20"
                                        : "border-slate-200 hover:bg-slate-50"
                                }`}
                            >
                                <CreditCard
                                    size={22}
                                    className={selectedMethod === "id_card" ? "text-indigo-600" : "text-slate-400"}
                                />
                                <div className="mt-2">
                                    <div className="font-bold text-xs sm:text-sm text-slate-900">
                                        College ID Review
                                    </div>
                                    <div className="text-[11px] text-slate-500">
                                        Submit student card photo for review
                                    </div>
                                </div>
                            </button>
                        </div>

                        {/* Feedback message banner */}
                        {feedback.message && (
                            <div
                                className={`p-3 rounded-xl text-xs font-semibold mb-4 flex items-center justify-between ${
                                    feedback.type === "success"
                                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                        : "bg-rose-50 text-rose-800 border border-rose-200"
                                }`}
                            >
                                <span>{feedback.message}</span>
                                <button onClick={() => setFeedback({ type: "", message: "" })}>✕</button>
                            </div>
                        )}

                        {/* Method 1: Email Form */}
                        {selectedMethod === "email" && (
                            <form
                                onSubmit={handleSubmitEmail}
                                className="p-5 rounded-2xl border border-slate-200 space-y-4"
                            >
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        College / University Name
                                    </label>
                                    <input
                                        type="text"
                                        value={collegeName}
                                        onChange={(e) => setCollegeName(e.target.value)}
                                        placeholder="e.g. Stanford University, MIT, IIT Bombay"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm outline-none focus:border-indigo-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Official College Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={collegeEmail}
                                        onChange={(e) => setCollegeEmail(e.target.value)}
                                        placeholder="e.g. yourname@stanford.edu or student@iitb.ac.in"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm outline-none focus:border-indigo-500"
                                        required
                                    />
                                    <p className="text-[11px] text-slate-400 mt-1">
                                        Submitting updates status to <strong>Pending</strong> awaiting simulated confirmation or review.
                                    </p>
                                </div>

                                {/* Approved Domains preview */}
                                <div className="p-3 bg-slate-50 rounded-xl">
                                    <span className="text-[11px] font-bold text-slate-500 block mb-1">
                                        Approved Demo Domains:
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {approvedDomains.map((dom) => (
                                            <span
                                                key={dom}
                                                onClick={() => setCollegeEmail(`student@${dom.replace("*.", "")}`)}
                                                className="bg-white border border-slate-200 text-indigo-700 text-[10px] px-2 py-0.5 rounded-md cursor-pointer hover:bg-indigo-50 font-medium"
                                                title="Click to use this domain"
                                            >
                                                @{dom}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Instant verify simulation toggle */}
                                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                                    <input
                                        type="checkbox"
                                        id="instantEmailVerifyToggle"
                                        checked={instantVerifyId}
                                        onChange={(e) => setInstantVerifyId(e.target.checked)}
                                        className="rounded text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <label htmlFor="instantEmailVerifyToggle" className="text-xs text-slate-700 cursor-pointer">
                                        <span className="font-bold">Simulate immediate confirmation</span> (otherwise sets status to Pending Review)
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-100 transition-all cursor-pointer"
                                >
                                    {loading ? "Submitting..." : "Submit College Email for Verification"}
                                </button>
                            </form>
                        )}

                        {/* Method 2: ID Card Form */}
                        {selectedMethod === "id_card" && (
                            <form
                                onSubmit={handleSubmitId}
                                className="p-5 rounded-2xl border border-slate-200 space-y-4"
                            >
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        College / University Name
                                    </label>
                                    <input
                                        type="text"
                                        value={collegeName}
                                        onChange={(e) => setCollegeName(e.target.value)}
                                        placeholder="e.g. Stanford University"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm outline-none focus:border-indigo-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Student ID Number
                                    </label>
                                    <input
                                        type="text"
                                        value={studentIdNumber}
                                        onChange={(e) => setStudentIdNumber(e.target.value)}
                                        placeholder="e.g. STU-94021"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm outline-none focus:border-indigo-500"
                                    />
                                </div>

                                {/* ID Card Upload Preview */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Upload Student ID Card Photo (Simulation)
                                    </label>
                                    <label className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                        {idCardPreview ? (
                                            <div className="text-center">
                                                <img
                                                    src={idCardPreview}
                                                    alt="ID Preview"
                                                    className="max-h-36 rounded-xl object-contain mb-2 shadow-xs"
                                                />
                                                <span className="text-xs text-indigo-600 font-semibold">
                                                    Change Image
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <Upload size={28} className="text-slate-400 mx-auto mb-2" />
                                                <span className="text-xs font-semibold text-slate-700 block">
                                                    Click to upload ID Card photo
                                                </span>
                                                <span className="text-[11px] text-slate-400">
                                                    PNG, JPG or sample ID photo
                                                </span>
                                            </div>
                                        )}
                                    </label>
                                </div>

                                {/* Instant verify simulation toggle */}
                                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                                    <input
                                        type="checkbox"
                                        id="instantVerifyToggle"
                                        checked={instantVerifyId}
                                        onChange={(e) => setInstantVerifyId(e.target.checked)}
                                        className="rounded text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <label htmlFor="instantVerifyToggle" className="text-xs text-slate-700 cursor-pointer">
                                        <span className="font-bold">Simulate immediate approval</span> (otherwise sets status to Pending Review)
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-100 transition-all cursor-pointer"
                                >
                                    {loading ? "Submitting..." : "Submit ID Card for Review"}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Feature Access Policy Matrix */}
                    <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-1.5">
                            <Info size={16} className="text-indigo-600" />
                            <span>Feature Policy by Status</span>
                        </h4>
                        <div className="space-y-2 text-xs sm:text-sm">
                            <div className="flex items-start gap-2.5">
                                <span className="font-bold text-emerald-700 w-24 shrink-0">Verified 🎓:</span>
                                <span className="text-slate-700">Official verified badge displayed across posts, discussions, and discover. Teammate openings matching unlocked.</span>
                            </div>
                            <div className="flex items-start gap-2.5">
                                <span className="font-bold text-amber-700 w-24 shrink-0">Pending ⏳:</span>
                                <span className="text-slate-700">Awaiting approval: feed browsing, classmate discovery, and basic networking are permitted. Verified badge unlocks upon review.</span>
                            </div>
                            <div className="flex items-start gap-2.5">
                                <span className="font-bold text-rose-700 w-24 shrink-0">Rejected ❌:</span>
                                <span className="text-slate-700">Verification declined. The student can re-upload their credentials or choose college email confirmation.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <RightHome />
            <Nav />
        </div>
    );
}
