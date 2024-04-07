import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
import {v2 as cloudinary} from "cloudinary";
import connectDB from "./utils/connectDB";

// routes
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import chatRoutes from "./routes/chatRoutes";
import messageRoutes from "./routes/messageRoutes";
import connectionRequestRoutes from "./routes/connectionRequestRoutes";

const PORT = process.env.PORT || 4000;

const app = express();

cloudinary.config({
  cloud_name:process.env.CLOUDINARY_NAME,
  api_key:process.env.CLOUDINARY_API_KEY,
  api_secret:process.env.CLOUDINARY_API_SECRET
})


app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/connection-request", connectionRequestRoutes);

connectDB(process.env.MONGODB_URI as string);

const server = app.listen(PORT, () => {
  console.log(`Server started at PORT ${PORT}`);
});

