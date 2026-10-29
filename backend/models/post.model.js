import mongoose from "mongoose";


const postSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    mediaType: {
        type: String,
        enum: ["image", "video", "text"],
        default: "text"
    },
    media: {
        type: String,
        default: ""
    },
    caption: {
        type: String,
        default: ""
    },
    isProjectTeammateSearch: {
        type: Boolean,
        default: false
    },
    projectRole: {
        type: String,
        default: ""
    },
    requiredSkills: {
        type: [String],
        default: []
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    ],
    reports: [
        {
            reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            reason: { type: String, default: "Inappropriate content" },
            createdAt: { type: Date, default: Date.now }
        }
    ],
    comments: [
        {
            author: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            },
            message: {
                type: String,
                required: true
            },
            parentId: {
                type: mongoose.Schema.Types.ObjectId,
                default: null
            },
            likes: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User"
                }
            ],
            reports: [
                {
                    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                    reason: { type: String, default: "Inappropriate content" },
                    createdAt: { type: Date, default: Date.now }
                }
            ],
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ]

}, { timestamps: true })



const Post = mongoose.model("Post", postSchema)
export default Post