import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
    acceptConnectionRequest,
    getAllConnections,
    rejectConnectionRequest,
    removeConnection,
    sendConnectionRequest
} from "../controllers/connection.controllers.js";

const connectionRouter = express.Router();

connectionRouter.get("/all", isAuth, getAllConnections);
connectionRouter.post("/request/:targetUserId", isAuth, sendConnectionRequest);
connectionRouter.post("/accept/:targetUserId", isAuth, acceptConnectionRequest);
connectionRouter.post("/reject/:targetUserId", isAuth, rejectConnectionRequest);
connectionRouter.post("/remove/:targetUserId", isAuth, removeConnection);

export default connectionRouter;
