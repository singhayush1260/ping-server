import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
import { Server } from "socket.io";
import {v2 as cloudinary} from "cloudinary";
import connectDB from "./utils/connectDB";

// routes
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import chatRoutes from "./routes/chatRoutes";
import messageRoutes from "./routes/messageRoutes";
import connectionRequestRoutes from "./routes/connectionRequestRoutes";

console.log("process.env.NODE_ENV",process.env.NODE_ENV);

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

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.CLIENT_URL as string,
  },
});

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("join room", (chatId) => {
    socket.join(chatId); // User joins the chat room
    console.log(`User ${socket.id} joined room: ${chatId}`);
  });

  socket.on("new message", (data) => {
    console.log("new message",data);
   // const { chatId, message } = data;
    io.to(data.chat).emit("message", data);
    //console.log(`Message sent to room ${chatId} by ${socket.id}`);
  });

  socket.on("mark as seen", (data) => {
    console.log("mark as seen",data);
   // const { chatId, message } = data;
  io.to(data.chat).emit("seen", data);
    //console.log(`Message sent to room ${chatId} by ${socket.id}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
    // Perform cleanup if needed
  });
});