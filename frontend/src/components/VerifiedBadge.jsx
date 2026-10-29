import React from "react";
import { CheckCircle2, Clock, ShieldAlert, XCircle } from "lucide-react";

export default function VerifiedBadge({ status = "Unverified", college = "", size = "sm", showLabel = false }) {
    if (status === "Verified") {
        return (
            <span
                className={`inline-flex items-center gap-1 font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200/80 rounded-full shadow-xs ${
                    size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
                }`}
                title={`Verified College Member${college ? ` • ${college}` : ""}`}
            >
                <CheckCircle2 className={`${size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"} text-emerald-600 fill-emerald-100`} />
                {showLabel ? "Verified Student" : "Verified"}
            </span>
        );
    }

    if (status === "Pending") {
        return (
            <span
                className={`inline-flex items-center gap-1 font-semibold text-amber-600 bg-amber-50 border border-amber-200/80 rounded-full ${
                    size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
                }`}
                title="Verification pending review"
            >
                <Clock className={`${size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"}`} />
                {showLabel ? "Verification Pending" : "Pending"}
            </span>
        );
    }

    if (status === "Rejected") {
        return (
            <span
                className={`inline-flex items-center gap-1 font-semibold text-rose-600 bg-rose-50 border border-rose-200/80 rounded-full ${
                    size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
                }`}
                title="Verification rejected"
            >
                <XCircle className={`${size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"}`} />
                {showLabel ? "Verification Rejected" : "Rejected"}
            </span>
        );
    }

    // Unverified
    return (
        <span
            className={`inline-flex items-center gap-1 text-gray-500 bg-gray-100 border border-gray-200 rounded-full ${
                size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
            }`}
            title="Unverified account"
        >
            <ShieldAlert className={`${size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"} text-gray-400`} />
            {showLabel ? "Unverified" : ""}
        </span>
    );
}
