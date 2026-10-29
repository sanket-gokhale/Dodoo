import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true

    },
    password: {
        type: String,
        required: true

    },
    profileImage: {
        type: String
    },
    bio:{
         type:String   
    },
    profession:{
       type:String
    },
    college:{
        type: String,
        default: ""
    },
    degree:{
        type: String,
        default: ""
    },
    year:{
        type: String,
        default: ""
    },
    skills:{
        type: [String],
        default: []
    },
    verificationStatus:{
        type: String,
        enum: ["Unverified", "Pending", "Verified", "Rejected"],
        default: "Unverified"
    },
    verificationReviewNote:{
        type: String,
        default: ""
    },
    verificationMethod:{
        type: String,
        enum: ["email", "id_card", "none"],
        default: "none"
    },
    collegeEmail:{
        type: String,
        default: ""
    },
    idCardImage:{
        type: String,
        default: ""
    },
    gender:{
         type:String,
         enum:["male","female","other"]
    },
    connections: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    connectionRequests: [
        {
            from: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
            createdAt: { type: Date, default: Date.now }
        }
    ],
    sentRequests: [
        {
            to: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
            createdAt: { type: Date, default: Date.now }
        }
    ],
    blockedUsers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    profileVisibility: {
        type: String,
        enum: ["public", "campus_only", "connections_only"],
        default: "public"
    },
    privacySettings: {
        onlyVerifiedRequests: { type: Boolean, default: false },
        showCollegePublicly: { type: Boolean, default: true },
        notifyOnMessage: { type: Boolean, default: true }
    },
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],

    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
        }
    ],
    saved: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
        }
    ],
    loops: [
        {
             type: mongoose.Schema.Types.ObjectId,
            ref: "Loop"
        }
    ],
    story:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Story"
    },
    resetOtp:{
        type:String
    },
    otpExpires:{
        type:Date

    },
    isOtpVerified:{
        type:Boolean,
        default:false
    }


}, { timestamps: true })




const User = mongoose.model("User", userSchema)
export default User