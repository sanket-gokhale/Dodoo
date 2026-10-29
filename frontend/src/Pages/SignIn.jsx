import React, { useState } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { ThreeDots } from "react-loader-spinner";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
import { GraduationCap, Sparkles, ArrowRight, Lock, User } from "lucide-react";

export default function SignIn() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    const handleSignIn = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setErr("");
        try {
            const result = await axios.post(
                `${serverUrl}/api/auth/signin`,
                { userName: userName.trim(), password },
                { withCredentials: true }
            );
            dispatch(setUserData(result.data));
            navigate("/");
        } catch (error) {
            console.error("Sign in error:", error);
            setErr(error.response?.data?.message || "Invalid credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-indigo-900 via-indigo-950 to-purple-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20">
                {/* Brand Header */}
                <div className="flex flex-col items-center mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-300 mb-3">
                        <GraduationCap size={30} />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Dodoo Campus</h1>
                    <p className="text-xs text-slate-500 mt-1">Verified Genuine Student Network</p>
                </div>

                {err && (
                    <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-semibold">
                        {err}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSignIn} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Username</label>
                        <div className="relative flex items-center">
                            <User size={16} className="absolute left-3.5 text-slate-400" />
                            <input
                                type="text"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                placeholder="Enter username"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm outline-none focus:border-indigo-500"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-bold text-slate-700">Password</label>
                            <span
                                onClick={() => navigate("/forgot-password")}
                                className="text-[11px] text-indigo-600 hover:underline cursor-pointer"
                            >
                                Forgot password?
                            </span>
                        </div>
                        <div className="relative flex items-center">
                            <Lock size={16} className="absolute left-3.5 text-slate-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm outline-none focus:border-indigo-500"
                                required
                            />
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
                                <span>Sign In</span>
                                <ArrowRight size={16} />
                            </>
                        )}
                    </button>
                </form>

                {/* Footer link */}
                <div className="mt-6 text-center text-xs text-slate-500">
                    New to Dodoo Campus?{" "}
                    <button
                        type="button"
                        onClick={() => navigate("/signup")}
                        className="text-indigo-600 font-bold hover:underline cursor-pointer"
                    >
                        Create an account
                    </button>
                </div>
            </div>
        </div>
    );
}