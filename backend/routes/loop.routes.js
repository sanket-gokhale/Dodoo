import express from "express"
import isAuth from "../middlewares/isAuth.js"

import { upload } from "../middlewares/multer.js"

import { comment, getAllLoops, uploadLoop } from "../controllers/loop.controllers.js"
import { like } from "../controllers/Post.controllers.js"


const loopRouter=express.Router()
loopRouter.get("/upload",isAuth,upload.single("media"),uploadLoop)
loopRouter.get("/getAll",isAuth,getAllLoops)
loopRouter.get("/like/:loopId",isAuth,like)

loopRouter.post("/comment",isAuth,comment)

export default loopRouter