import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { upload } from "../middlewares/multer.js";
import {
    comment,
    getAllPost,
    like,
    likeComment,
    reportComment,
    reportPost,
    saved,
    uploadPost
} from "../controllers/Post.controllers.js";

const postRouter = express.Router();

postRouter.post("/upload", isAuth, upload.single("media"), uploadPost);
postRouter.get("/getAll", isAuth, getAllPost);
postRouter.get("/like/:postId", isAuth, like);
postRouter.get("/saved/:postId", isAuth, saved);
postRouter.post("/report/:postId", isAuth, reportPost);
postRouter.post("/comment/:postId", isAuth, comment);
postRouter.post("/comment/:postId/like/:commentId", isAuth, likeComment);
postRouter.post("/comment/:postId/report/:commentId", isAuth, reportComment);

export default postRouter;