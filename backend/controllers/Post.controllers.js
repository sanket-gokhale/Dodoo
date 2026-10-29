import uploadOnCloudinary from "../config/cloudinary.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";

// Create / Upload Post (text-only, image, or video)
export const uploadPost = async (req, res) => {
    try {
        const { caption, mediaType = "text", isProjectTeammateSearch, projectRole, requiredSkills } = req.body;
        let media = "";

        if (req.file) {
            media = await uploadOnCloudinary(req.file.path);
        } else if (req.body.media) {
            media = req.body.media;
        }

        const effectiveMediaType = media ? (mediaType === "text" ? "image" : mediaType) : "text";

        if (!caption && !media) {
            return res.status(400).json({ message: "Caption or media is required" });
        }

        let parsedSkills = [];
        if (requiredSkills) {
            if (Array.isArray(requiredSkills)) {
                parsedSkills = requiredSkills;
            } else if (typeof requiredSkills === "string") {
                try {
                    parsedSkills = JSON.parse(requiredSkills);
                } catch {
                    parsedSkills = requiredSkills.split(",").map(s => s.trim()).filter(Boolean);
                }
            }
        }

        const post = await Post.create({
            caption: caption || "",
            media: media || "",
            mediaType: effectiveMediaType,
            author: req.userId,
            isProjectTeammateSearch: Boolean(isProjectTeammateSearch),
            projectRole: projectRole || "",
            requiredSkills: parsedSkills
        });

        const user = await User.findById(req.userId);
        if (user) {
            user.posts.push(post._id);
            await user.save();
        }

        const populatedPost = await Post.findById(post._id)
            .populate("author", "name userName profileImage college degree verificationStatus year")
            .populate("comments.author", "name userName profileImage college degree verificationStatus");

        return res.status(201).json(populatedPost);
    } catch (error) {
        return res.status(500).json({ message: `uploadPost error: ${error.message}` });
    }
};

// Get All Posts (Filtered for blocked users)
export const getAllPost = async (req, res) => {
    try {
        const currentUser = await User.findById(req.userId);
        const blockedUsers = currentUser?.blockedUsers || [];

        const posts = await Post.find({
            author: { $nin: blockedUsers }
        })
            .sort({ createdAt: -1 })
            .populate("author", "name userName profileImage college degree verificationStatus year")
            .populate("comments.author", "name userName profileImage college degree verificationStatus");

        return res.status(200).json(posts);
    } catch (error) {
        return res.status(500).json({ message: `getAllPost error: ${error.message}` });
    }
};

// Like / Unlike Post
export const like = async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const alreadyLiked = post.likes.some(id => id.toString() === req.userId.toString());

        if (alreadyLiked) {
            post.likes = post.likes.filter(id => id.toString() !== req.userId.toString());
        } else {
            post.likes.push(req.userId);
        }

        await post.save();
        const updatedPost = await Post.findById(postId)
            .populate("author", "name userName profileImage college degree verificationStatus year")
            .populate("comments.author", "name userName profileImage college degree verificationStatus");

        return res.status(200).json(updatedPost);
    } catch (error) {
        return res.status(500).json({ message: `like Post error: ${error.message}` });
    }
};

// Add Comment (top-level or reply)
export const comment = async (req, res) => {
    try {
        const { message, parentId } = req.body;
        const { postId } = req.params;

        if (!message || !message.trim()) {
            return res.status(400).json({ message: "Comment message is required" });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        post.comments.push({
            author: req.userId,
            message: message.trim(),
            parentId: parentId || null,
            likes: [],
            reports: [],
            createdAt: new Date()
        });

        await post.save();

        const updatedPost = await Post.findById(postId)
            .populate("author", "name userName profileImage college degree verificationStatus year")
            .populate("comments.author", "name userName profileImage college degree verificationStatus");

        return res.status(200).json(updatedPost);
    } catch (error) {
        return res.status(500).json({ message: `comment error: ${error.message}` });
    }
};

// Like / Unlike a Comment
export const likeComment = async (req, res) => {
    try {
        const { postId, commentId } = req.params;
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: "Post not found" });

        const commentItem = post.comments.id(commentId);
        if (!commentItem) return res.status(404).json({ message: "Comment not found" });

        const alreadyLiked = commentItem.likes.some(id => id.toString() === req.userId.toString());
        if (alreadyLiked) {
            commentItem.likes = commentItem.likes.filter(id => id.toString() !== req.userId.toString());
        } else {
            commentItem.likes.push(req.userId);
        }

        await post.save();
        const updatedPost = await Post.findById(postId)
            .populate("author", "name userName profileImage college degree verificationStatus year")
            .populate("comments.author", "name userName profileImage college degree verificationStatus");

        return res.status(200).json(updatedPost);
    } catch (error) {
        return res.status(500).json({ message: `likeComment error: ${error.message}` });
    }
};

// Report Comment (Reddit-style moderation flagging)
export const reportComment = async (req, res) => {
    try {
        const { postId, commentId } = req.params;
        const { reason = "Inappropriate content" } = req.body;

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: "Post not found" });

        const commentItem = post.comments.id(commentId);
        if (!commentItem) return res.status(404).json({ message: "Comment not found" });

        const alreadyReported = commentItem.reports.some(r => r.reportedBy.toString() === req.userId.toString());
        if (!alreadyReported) {
            commentItem.reports.push({
                reportedBy: req.userId,
                reason,
                createdAt: new Date()
            });
            await post.save();
        }

        return res.status(200).json({ message: "Comment reported for review successfully", commentId });
    } catch (error) {
        return res.status(500).json({ message: `reportComment error: ${error.message}` });
    }
};

// Report Post (Inappropriate content reporting)
export const reportPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { reason = "Inappropriate content" } = req.body;

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: "Post not found" });

        const alreadyReported = post.reports?.some(r => r.reportedBy?.toString() === req.userId.toString());
        if (!alreadyReported) {
            if (!post.reports) post.reports = [];
            post.reports.push({
                reportedBy: req.userId,
                reason,
                createdAt: new Date()
            });
            await post.save();
        }

        return res.status(200).json({ message: "Post reported for moderation review successfully", postId });
    } catch (error) {
        return res.status(500).json({ message: `reportPost error: ${error.message}` });
    }
};

// Save / Unsave Post
export const saved = async (req, res) => {
    try {
        const { postId } = req.params;
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const alreadySaved = user.saved.some(id => id.toString() === postId.toString());

        if (alreadySaved) {
            user.saved = user.saved.filter(id => id.toString() !== postId.toString());
        } else {
            user.saved.push(postId);
        }

        await user.save();
        const populatedUser = await User.findById(req.userId)
            .select("-password")
            .populate("saved");

        return res.status(200).json(populatedUser);
    } catch (error) {
        return res.status(500).json({ message: `saved error: ${error.message}` });
    }
};