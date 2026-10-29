import uploadOnCloudinary from "../config/cloudinary.js";
import User from "../models/user.model.js";
import Post from "../models/post.model.js";

// Get current logged-in user
export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId)
            .select("-password")
            .populate("posts")
            .populate("saved")
            .populate("connections", "name userName profileImage college degree verificationStatus year")
            .populate("connectionRequests.from", "name userName profileImage college degree verificationStatus year")
            .populate("sentRequests.to", "name userName profileImage college degree verificationStatus year")
            .populate("blockedUsers", "name userName profileImage college degree");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: `getCurrentUser error: ${error.message}` });
    }
};

// Suggested students (classmates, teammates)
export const suggestedUsers = async (req, res) => {
    try {
        const currentUser = await User.findById(req.userId);
        const blockedUsers = currentUser?.blockedUsers || [];

        const users = await User.find({
            _id: { $ne: req.userId, $nin: blockedUsers }
        })
            .select("-password")
            .limit(15);

        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ message: `suggestedUsers error: ${error.message}` });
    }
};

// Discover / Search Students with college, course, skills filters
export const discoverUsers = async (req, res) => {
    try {
        const { search, college, degree, year, skill, verificationStatus } = req.query;
        const currentUser = await User.findById(req.userId);
        const blockedUsers = currentUser?.blockedUsers || [];

        const query = {
            _id: { $ne: req.userId, $nin: blockedUsers }
        };

        if (search && search.trim()) {
            const regex = new RegExp(search.trim(), "i");
            query.$or = [
                { name: regex },
                { userName: regex },
                { college: regex },
                { degree: regex },
                { year: regex },
                { skills: regex },
                { bio: regex }
            ];
        }

        if (college && college !== "all") {
            query.college = new RegExp(college.trim(), "i");
        }

        if (degree && degree !== "all") {
            query.degree = new RegExp(degree.trim(), "i");
        }

        if (year && year !== "all") {
            query.year = new RegExp(year.trim(), "i");
        }

        if (skill && skill !== "all") {
            query.skills = new RegExp(skill.trim(), "i");
        }

        if (verificationStatus && verificationStatus !== "all") {
            query.verificationStatus = verificationStatus;
        }

        const users = await User.find(query)
            .select("-password")
            .sort({ verificationStatus: -1, createdAt: -1 });

        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ message: `discoverUsers error: ${error.message}` });
    }
};

// Edit Profile (Student information, skills, college, degree, year)
export const editProfile = async (req, res) => {
    try {
        const { name, userName, bio, profession, gender, college, degree, year, skills } = req.body;
        const user = await User.findById(req.userId).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (userName && userName !== user.userName) {
            const sameUser = await User.findOne({ userName });
            if (sameUser && sameUser._id.toString() !== req.userId.toString()) {
                return res.status(400).json({ message: "Username already taken" });
            }
            user.userName = userName;
        }

        let profileImage;
        if (req.file) {
            profileImage = await uploadOnCloudinary(req.file.path);
            user.profileImage = profileImage;
        }

        if (name !== undefined) user.name = name;
        if (bio !== undefined) user.bio = bio;
        if (profession !== undefined) user.profession = profession;
        if (gender !== undefined) user.gender = gender;
        if (college !== undefined) user.college = college;
        if (degree !== undefined) user.degree = degree;
        if (year !== undefined) user.year = year;

        if (skills !== undefined) {
            if (Array.isArray(skills)) {
                user.skills = skills;
            } else if (typeof skills === "string") {
                try {
                    user.skills = JSON.parse(skills);
                } catch {
                    user.skills = skills.split(",").map(s => s.trim()).filter(Boolean);
                }
            }
        }

        await user.save();

        const updatedUser = await User.findById(req.userId)
            .select("-password")
            .populate("connections", "name userName profileImage college degree verificationStatus year")
            .populate("connectionRequests.from", "name userName profileImage college degree verificationStatus year")
            .populate("sentRequests.to", "name userName profileImage college degree verificationStatus year");

        return res.status(200).json(updatedUser);
    } catch (error) {
        return res.status(500).json({ message: `editProfile error: ${error.message}` });
    }
};

// Get Public Profile by username
export const getProfile = async (req, res) => {
    try {
        const { userName } = req.params;
        const user = await User.findOne({ userName })
            .select("-password")
            .populate("connections", "name userName profileImage college degree verificationStatus year")
            .populate("followers", "name userName profileImage college degree verificationStatus")
            .populate("following", "name userName profileImage college degree verificationStatus");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Fetch actual genuine posts authored by this user, sorted newest first
        const userPosts = await Post.find({ author: user._id })
            .sort({ createdAt: -1 })
            .populate("author", "name userName profileImage college degree verificationStatus year")
            .populate("comments.author", "name userName profileImage college degree verificationStatus");

        const userObj = user.toObject();
        userObj.posts = userPosts;

        return res.status(200).json(userObj);
    } catch (error) {
        return res.status(500).json({ message: `getProfile error: ${error.message}` });
    }
};

// Block User
export const blockUser = async (req, res) => {
    try {
        const { targetUserId } = req.params;
        if (targetUserId === req.userId.toString()) {
            return res.status(400).json({ message: "You cannot block yourself" });
        }

        const user = await User.findById(req.userId);
        if (!user.blockedUsers.includes(targetUserId)) {
            user.blockedUsers.push(targetUserId);
            // Also remove from connections if connected
            user.connections = user.connections.filter(id => id.toString() !== targetUserId.toString());
            await user.save();
        }

        // Also remove connection on target user
        const targetUser = await User.findById(targetUserId);
        if (targetUser) {
            targetUser.connections = targetUser.connections.filter(id => id.toString() !== req.userId.toString());
            await targetUser.save();
        }

        return res.status(200).json({ message: "User blocked successfully", blockedUserId: targetUserId });
    } catch (error) {
        return res.status(500).json({ message: `blockUser error: ${error.message}` });
    }
};

// Unblock User
export const unblockUser = async (req, res) => {
    try {
        const { targetUserId } = req.params;
        const user = await User.findById(req.userId);
        user.blockedUsers = user.blockedUsers.filter(id => id.toString() !== targetUserId.toString());
        await user.save();

        return res.status(200).json({ message: "User unblocked successfully", unblockedUserId: targetUserId });
    } catch (error) {
        return res.status(500).json({ message: `unblockUser error: ${error.message}` });
    }
};

// Get Blocked Users
export const getBlockedUsers = async (req, res) => {
    try {
        const user = await User.findById(req.userId).populate("blockedUsers", "name userName profileImage college degree");
        return res.status(200).json(user?.blockedUsers || []);
    } catch (error) {
        return res.status(500).json({ message: `getBlockedUsers error: ${error.message}` });
    }
};

// Update Privacy and Visibility Settings (Step 8: Manage Privacy)
export const updatePrivacySettings = async (req, res) => {
    try {
        const { profileVisibility, privacySettings } = req.body;
        const user = await User.findById(req.userId).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });

        if (profileVisibility) user.profileVisibility = profileVisibility;
        if (privacySettings) {
            user.privacySettings = {
                ...(user.privacySettings || {}),
                ...privacySettings
            };
        }
        await user.save();
        return res.status(200).json({
            message: "Privacy & visibility preferences updated",
            user
        });
    } catch (error) {
        return res.status(500).json({ message: `updatePrivacySettings error: ${error.message}` });
    }
};