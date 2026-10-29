import express from "express"
import isAuth from "../middlewares/isAuth.js"

import { upload } from "../middlewares/multer.js"
import { getStoryByUserName, uploadStory, viewStory } from "../controllers/story.controllers.js"



const storyRouter=express.Router()
storyRouter.get("/upload",isAuth,upload.single("media"),uploadStory)
storyRouter.get("/getByUsername/:userName",isAuth,getStoryByUserName)
storyRouter.get("/view/:storyId",isAuth,viewStory)



export default storyRouter