import React, { useState } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { ThreeDots } from "react-loader-spinner";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUserData } from "../redux/userSlice";
import {
    GraduationCap,
    ArrowRight,
    User,
    Mail,
    Lock,
    BookOpen,
    Calendar,
    Sparkles
} from "lucide-react";

export default function SignUp() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [name, setName] = useState("");
    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [college, setCollege] = useState("");
    const [degree, setDegree] = useState("");
    const [year, setYear] = useState("");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    const handleSignUp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErr("");

        try {
            const result = await axios.post(
                `${serverUrl}/api/auth/signup`,
                {
                    name: name.trim(),
                    userName: userName.trim(),
                    email: email.trim(),
                    password,
                    college: college.trim(),
                    degree: degree.trim(),
                    year: year.trim()
                },
                { withCredentials: true }
            );

            dispatch(setUserData(result.data));
            navigate("/");
        } catch (error) {
            console.error("Signup error:", error);
            setErr(error.response?.data?.message || "Registration failed. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-indigo-900 via-indigo-950 to-purple-950 flex items-center justify-center p-4 py-8">
            <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20">
                {/* Brand Header */}
                <div className="flex flex-col items-center mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-300 mb-3">
                        <GraduationCap size={30} />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Join Dodoo Campus</h1>
                    <p className="text-xs text-slate-500 mt-1">Create your genuine student identity</p>
                </div>

                {/* College verification tip */}
                <div className="mb-5 p-3 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-start gap-2.5">
                    <Sparkles size={18} className="text-indigo-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-indigo-900 leading-relaxed">
                        <strong>Student Tip:</strong> Register with your official college email (e.g. <code>.edu</code> or <code>.ac.in</code>) to receive an automatic <strong>Verified Student Badge 🎓</strong> on your profile!
                    </p>
                </div>

                {err && (
                    <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-semibold">
                        {err}
                    </div>
                )}

                <form onSubmit={handleSignUp} className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                            <div className="relative flex items-center">
                                <User size={15} className="absolute left-3.5 text-slate-400" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Jane Doe"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm outline-none focus:border-indigo-500"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Username</label>
                            <div className="relative flex items-center">
                                <span className="absolute left-3.5 text-slate-400 text-xs">@</span>
                                <input
                                    type="text"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    placeholder="janedoe"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs sm:text-sm outline-none focus:border-indigo-500"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">College Email / Email</label>
                        <div className="relative flex items-center">
                            <Mail size={15} className="absolute left-3.5 text-slate-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="jane@stanford.edu or student email"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm outline-none focus:border-indigo-500"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Password (min 6 chars)</label>
                        <div className="relative flex items-center">
                            <Lock size={15} className="absolute left-3.5 text-slate-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Create strong password"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm outline-none focus:border-indigo-500"
                                required
                            />
                        </div>
                    </div>

                    {/* Academic Information */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">College / University</label>
                        <div className="relative flex items-center">
                            <GraduationCap size={15} className="absolute left-3.5 text-slate-400" />
                            <input
                                type="text"
                                value={college}
                                onChange={(e) => setCollege(e.target.value)}
                                placeholder="e.g. Stanford University, MIT, IIT Bombay"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm outline-none focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Degree / Course</label>
                            <div className="relative flex items-center">
                                <BookOpen size={15} className="absolute left-3.5 text-slate-400" />
                                <input
                                    type="text"
                                    value={degree}
                                    onChange={(e) => setDegree(e.target.value)}
                                    placeholder="e.g. B.S. Computer Science"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm outline-none focus:border-indigo-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Graduation Year</label>
                            <div className="relative flex items-center">
                                <Calendar size={15} className="absolute left-3.5 text-slate-400" />
                                <input
                                    type="text"
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                    placeholder="e.g. Class of 2026"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm outline-none focus:border-indigo-500"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-2 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-100 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                        {loading ? (
                            <ThreeDots height="20" width="35" color="white" />
                        ) : (
                            <>
                                <span>Create Student Account</span>
                                <ArrowRight size={16} />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-5 text-center text-xs text-slate-500">
                    Already registered?{" "}
                    <button
                        type="button"
                        onClick={() => navigate("/signin")}
                        className="text-indigo-600 font-bold hover:underline cursor-pointer"
                    >
                        Sign in here
                    </button>
                </div>
            </div>
        </div>
    );
}