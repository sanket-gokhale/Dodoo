import dotenv from "dotenv";
dotenv.config();

import express from "express";
import connectDb from "./config/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import postRouter from "./routes/post.routes.js";
import loopRouter from "./routes/loop.routes.js";
import storyRouter from "./routes/story.routes.js";
import connectionRouter from "./routes/connection.routes.js";
import messageRouter from "./routes/message.routes.js";
import verificationRouter from "./routes/verification.routes.js";

const app = express();
const port = process.env.PORT || 8000;

app.use(cors({
    origin: (origin, callback) => {
        // Allow all local origins (5173, 5174, etc.) or no origin (curl/mobile/tools)
        callback(null, true);
    },
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Base health check
app.get("/", (req, res) => {
    res.json({ message: "Dodoo Campus API is running 🎓" });
});

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/post", postRouter);
app.use("/api/loop", loopRouter);
app.use("/api/story", storyRouter);
app.use("/api/connections", connectionRouter);
app.use("/api/messages", messageRouter);
app.use("/api/verification", verificationRouter);

app.listen(port, () => {
    connectDb();
    console.log(`Server started on port ${port}`);
});