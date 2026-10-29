import React from "react";
import Sidebar from "../components/Sidebar";
import Feed from "../components/Feed";
import RightHome from "../components/RightHome";

export default function Home() {
    return (
        <div className="w-full min-h-screen bg-slate-50 flex justify-center">
            <Sidebar />
            <Feed />
            <RightHome />
        </div>
    );
}
