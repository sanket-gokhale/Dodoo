import mongoose from "mongoose";
const connectDb = async () => {
    try {
        const url = process.env.MONGODB_URL;
        if (!url) {
            throw new Error("MONGODB_URL is not defined in .env file");
        }
        if (url.includes("<db_password>") || url.includes("<password>")) {
            throw new Error("Please replace '<db_password>' in backend/.env with your actual MongoDB Atlas password");
        }
        await mongoose.connect(url);
        console.log("db connected successfully");
    } catch (error) {
        console.error("db error:", error.message);
    }
};

export default connectDb