import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import SignUp from "./Pages/SignUp";
import SignIn from "./Pages/SignIn";
import ForgotPassword from "./Pages/ForgotPassword";
import Home from "./Pages/Home";
import Discover from "./Pages/Discover";
import Requests from "./Pages/Requests";
import Messages from "./Pages/Messages";
import Verification from "./Pages/Verification";
import Settings from "./Pages/Settings";
import Profile from "./Pages/Profile";
import EditProfile from "./Pages/EditProfile";
import Upload from "./Pages/Upload";
import { useSelector } from "react-redux";
import getCurrentUser from "./hooks/getCurrentUser";
import getSuggestedUsers from "./hooks/getSuggestedUser";

export const serverUrl = "http://localhost:8000";

function App() {
    getSuggestedUsers();
    getCurrentUser();
    const { userData } = useSelector((state) => state.user);

    return (
        <Routes>
            {/* Auth Routes */}
            <Route path="/signup" element={!userData ? <SignUp /> : <Navigate to="/" />} />
            <Route path="/signin" element={!userData ? <SignIn /> : <Navigate to="/" />} />
            <Route path="/forgot-password" element={!userData ? <ForgotPassword /> : <Navigate to="/" />} />

            {/* Core Pages (Protected) */}
            <Route path="/" element={userData ? <Home /> : <Navigate to="/signin" />} />
            <Route path="/discover" element={userData ? <Discover /> : <Navigate to="/signin" />} />
            <Route path="/requests" element={userData ? <Requests /> : <Navigate to="/signin" />} />
            <Route path="/messages" element={userData ? <Messages /> : <Navigate to="/signin" />} />
            <Route path="/messages/:targetUserId" element={userData ? <Messages /> : <Navigate to="/signin" />} />
            <Route path="/verification" element={userData ? <Verification /> : <Navigate to="/signin" />} />
            <Route path="/settings" element={userData ? <Settings /> : <Navigate to="/signin" />} />
            <Route path="/profile/:userName" element={userData ? <Profile /> : <Navigate to="/signin" />} />
            <Route path="/upload" element={userData ? <Upload /> : <Navigate to="/signin" />} />
            <Route path="/editprofile" element={userData ? <EditProfile /> : <Navigate to="/signin" />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
}

export default App;