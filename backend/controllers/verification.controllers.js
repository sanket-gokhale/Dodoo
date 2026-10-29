import User from "../models/user.model.js";

// Approved demo college email domains
const APPROVED_DOMAINS = [
    "stanford.edu",
    "mit.edu",
    "harvard.edu",
    "berkeley.edu",
    "iitb.ac.in",
    "iitd.ac.in",
    "ox.ac.uk",
    "cam.ac.uk",
    "nyu.edu",
    "ucla.edu",
    "cmu.edu",
    "gatech.edu",
    "columbia.edu"
];

// Step 2 — Submit College Email for Review
// Requirement: "Do not label an account as genuinely verified just because a user typed a college email or ID.
// For a static demo, use predefined verification outcomes and a mock review action."
export const submitCollegeEmail = async (req, res) => {
    try {
        const { collegeEmail, collegeName, simulateApproval = false } = req.body;

        if (!collegeEmail || !collegeEmail.includes("@")) {
            return res.status(400).json({ message: "Please provide a valid college email address." });
        }

        const domain = collegeEmail.split("@")[1].toLowerCase();
        const isValidDomain =
            APPROVED_DOMAINS.includes(domain) ||
            domain.endsWith(".edu") ||
            domain.endsWith(".ac.in") ||
            domain.endsWith(".edu.in");

        if (!isValidDomain) {
            return res.status(400).json({
                message: `Domain "@${domain}" is not in the recognized college domain list. Try an @*.edu or @*.ac.in address, e.g. student@stanford.edu or student@iitb.ac.in.`
            });
        }

        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.collegeEmail = collegeEmail;
        if (collegeName) user.college = collegeName;
        user.verificationMethod = "email";

        if (simulateApproval) {
            user.verificationStatus = "Verified";
            user.verificationReviewNote = `Simulated confirmation code verified for @${domain}. Verified Badge unlocked.`;
        } else {
            user.verificationStatus = "Pending";
            user.verificationReviewNote = `Confirmation link sent to ${collegeEmail}. Awaiting verification review.`;
        }

        await user.save();
        const updatedUser = await User.findById(req.userId).select("-password");

        return res.status(200).json({
            message: simulateApproval
                ? "College email confirmed & approved! Verified badge active 🎓"
                : "College email submitted! Status is now Pending Review ⏳ Use Mock Review action to simulate approval/rejection.",
            user: updatedUser
        });
    } catch (error) {
        return res.status(500).json({ message: `submitCollegeEmail error: ${error.message}` });
    }
};

// Step 2 — Submit College ID Card for Review
export const submitCollegeId = async (req, res) => {
    try {
        const { collegeName, studentIdNumber, simulateApproval = false } = req.body;

        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (collegeName) user.college = collegeName;
        user.verificationMethod = "id_card";
        user.idCardImage = req.file ? req.file.path : (req.body.idCardImage || "demo-id-card.png");

        if (simulateApproval) {
            user.verificationStatus = "Verified";
            user.verificationReviewNote = "Student ID card credentials inspected & approved by institutional reviewer.";
        } else {
            user.verificationStatus = "Pending";
            user.verificationReviewNote = "Student ID card submitted for manual review by campus team.";
        }

        await user.save();
        const updatedUser = await User.findById(req.userId).select("-password");

        return res.status(200).json({
            message: simulateApproval
                ? "Student ID reviewed & verified! Verified badge active 🎓"
                : "Student ID submitted for review. Current status: Pending ⏳",
            user: updatedUser
        });
    } catch (error) {
        return res.status(500).json({ message: `submitCollegeId error: ${error.message}` });
    }
};

// Step 3 & 4 — Predefined Verification Outcomes & Mock Review Action
// Supports: "Pending", "Verified", "Rejected", "Unverified"
export const setStatusDemo = async (req, res) => {
    try {
        const { status, reviewNote } = req.body;
        const validStatuses = ["Unverified", "Pending", "Verified", "Rejected"];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
        }

        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.verificationStatus = status;

        if (status === "Verified") {
            user.verificationReviewNote = reviewNote || "Credentials reviewed & verified. Verified student badge unlocked 🎓";
        } else if (status === "Rejected") {
            user.verificationReviewNote = reviewNote || "Verification declined: ID card document unreadable or mismatched college domain.";
        } else if (status === "Pending") {
            user.verificationReviewNote = reviewNote || "Verification submitted and currently pending reviewer approval ⏳";
        } else {
            user.verificationMethod = "none";
            user.verificationReviewNote = "";
        }

        await user.save();

        const updatedUser = await User.findById(req.userId).select("-password");
        return res.status(200).json({
            message: `Mock Review executed: Status set to ${status}`,
            user: updatedUser
        });
    } catch (error) {
        return res.status(500).json({ message: `setStatusDemo error: ${error.message}` });
    }
};
