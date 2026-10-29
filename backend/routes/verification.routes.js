import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
    setStatusDemo,
    submitCollegeEmail,
    submitCollegeId
} from "../controllers/verification.controllers.js";
import { upload } from "../middlewares/multer.js";

const verificationRouter = express.Router();

verificationRouter.post("/submit-email", isAuth, submitCollegeEmail);
verificationRouter.post("/submit-id", isAuth, upload.single("idCard"), submitCollegeId);
verificationRouter.post("/set-status", isAuth, setStatusDemo);

export default verificationRouter;
