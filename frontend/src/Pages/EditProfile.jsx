import React, { useRef, useState } from "react";
import { ArrowLeft, Upload, Check } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import dp from "../assets/dp.jpg";
import axios from "axios";
import { ThreeDots } from "react-loader-spinner";
import { serverUrl } from "../App";
import { setProfileData, setUserData } from "../redux/userSlice";

export default function EditProfile() {
    const { userData } = useSelector((state) => state.user);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const imageInput = useRef();

    const [frontendImage, setFrontendImage] = useState(userData?.profileImage || dp);
    const [backendImage, setBackendImage] = useState(null);

    const [name, setName] = useState(userData?.name || "");
    const [userName, setUserName] = useState(userData?.userName || "");
    const [college, setCollege] = useState(userData?.college || "");
    const [degree, setDegree] = useState(userData?.degree || "");
    const [year, setYear] = useState(userData?.year || "");
    const [skillsText, setSkillsText] = useState((userData?.skills || []).join(", "));
    const [bio, setBio] = useState(userData?.bio || "");
    const [profession, setProfession] = useState(userData?.profession || "");
    const [gender, setGender] = useState(userData?.gender || "male");

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const handleImage = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBackendImage(file);
            setFrontendImage(URL.createObjectURL(file));
        }
    };

    const handleEditProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");

        try {
            const formdata = new FormData();
            formdata.append("name", name.trim());
            formdata.append("userName", userName.trim());
            formdata.append("college", college.trim());
            formdata.append("degree", degree.trim());
            formdata.append("year", year.trim());
            formdata.append("bio", bio.trim());
            formdata.append("profession", profession.trim());
            formdata.append("gender", gender);

            const parsedSkills = skillsText
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);
            formdata.append("skills", JSON.stringify(parsedSkills));

            if (backendImage) {
                formdata.append("profileImage", backendImage);
            }

            const result = await axios.post(`${serverUrl}/api/user/editProfile`, formdata, {
                withCredentials: true
            });

            dispatch(setProfileData(result.data));
            dispatch(setUserData(result.data));
            navigate(`/profile/${result.data.userName}`);
        } catch (error) {
            console.error("Edit profile error:", error);
            setErrorMsg(error.response?.data?.message || "Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen bg-slate-50 flex justify-center py-8 px-4">
            <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
                {/* Header */}
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full cursor-pointer transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Edit Student Profile</h1>
                        <p className="text-xs text-slate-500">Update your academic details and skills</p>
                    </div>
                </div>

                {errorMsg && (
                    <div className="mb-5 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-semibold">
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleEditProfile} className="space-y-4">
                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center gap-2 pb-4 border-b border-slate-100">
                        <div
                            onClick={() => imageInput.current.click()}
                            className="relative w-24 h-24 rounded-full border-2 border-indigo-200 overflow-hidden cursor-pointer group shadow-sm"
                        >
                            <img src={frontendImage} alt="Avatar" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-semibold">
                                Change
                            </div>
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            ref={imageInput}
                            hidden
                            onChange={handleImage}
                        />
                        <button
                            type="button"
                            onClick={() => imageInput.current.click()}
                            className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
                        >
                            Change Profile Photo
                        </button>
                    </div>

                    {/* Name & Username */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm outline-none focus:border-indigo-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Username</label>
                            <input
                                type="text"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm outline-none focus:border-indigo-500"
                                required
                            />
                        </div>
                    </div>

                    {/* College & Degree */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            College / University
                        </label>
                        <input
                            type="text"
                            value={college}
                            onChange={(e) => setCollege(e.target.value)}
                            placeholder="e.g. Stanford University, MIT, IIT Bombay"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm outline-none focus:border-indigo-500"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Degree / Course
                            </label>
                            <input
                                type="text"
                                value={degree}
                                onChange={(e) => setDegree(e.target.value)}
                                placeholder="e.g. B.S. Computer Science"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm outline-none focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Graduation Year
                            </label>
                            <input
                                type="text"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                placeholder="e.g. Class of 2026"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm outline-none focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Skills (Comma-separated) */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Skills & Technologies (comma separated)
                        </label>
                        <input
                            type="text"
                            value={skillsText}
                            onChange={(e) => setSkillsText(e.target.value)}
                            placeholder="e.g. React, Node.js, Python, UI/UX, AI/ML"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm outline-none focus:border-indigo-500"
                        />
                        <p className="text-[11px] text-slate-400 mt-1">
                            These appear as badges on your profile and help teammates discover you!
                        </p>
                    </div>

                    {/* Profession / Headline */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Student Headline / Profession
                        </label>
                        <input
                            type="text"
                            value={profession}
                            onChange={(e) => setProfession(e.target.value)}
                            placeholder="e.g. Software Engineering Student & Hackathon Enthusiast"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm outline-none focus:border-indigo-500"
                        />
                    </div>

                    {/* Bio */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Bio</label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Share what you are building, your interests, or what teammates you seek..."
                            rows={3}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm outline-none focus:border-indigo-500 resize-none"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-100 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                        {loading ? (
                            <ThreeDots height="20" width="35" color="white" />
                        ) : (
                            <>
                                <Check size={16} />
                                <span>Save Changes</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}