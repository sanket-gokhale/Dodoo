import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
    blockUser,
    discoverUsers,
    editProfile,
    getBlockedUsers,
    getCurrentUser,
    getProfile,
    suggestedUsers,
    unblockUser,
    updatePrivacySettings
} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.js";

const userRouter = express.Router();

userRouter.get("/current", isAuth, getCurrentUser);
userRouter.get("/suggested", isAuth, suggestedUsers);
userRouter.get("/discover", isAuth, discoverUsers);
userRouter.get("/getProfile/:userName", isAuth, getProfile);
userRouter.post("/editProfile", isAuth, upload.single("profileImage"), editProfile);
userRouter.post("/block/:targetUserId", isAuth, blockUser);
userRouter.post("/unblock/:targetUserId", isAuth, unblockUser);
userRouter.get("/blocked", isAuth, getBlockedUsers);
userRouter.put("/privacy", isAuth, updatePrivacySettings);

export default userRouter;