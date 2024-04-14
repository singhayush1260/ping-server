import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import User from "../models/User";

const useSocket = (server: HttpServer, clientURL: string): Server => {
  const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
      origin: clientURL,
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log("A user connected");
    let userIdGlobal:string;
    try {
        socket.on("mark online",async(userId:string)=>{
            console.log("mark online event",userId)
            userIdGlobal=userId;
            await User.findByIdAndUpdate(userId,{$set:{isOnline:"Online"}});
          })
      socket.on("join room", (chatId: string) => {
        socket.join(chatId); // User joins the chat room
      });
      socket.on("new message", (data: any) => {
        console.log("New message inside socket:", data);
        io.to(data.chat).emit("message", data);
      });

      socket.on("mark as seen", (data: any) => {
        io.to(data.chat).emit("seen", data);
      });

      socket.on("disconnect", async() => {
        console.log("User disconnected");
        const logoutDate=new Date().toString();
        await User.findByIdAndUpdate(userIdGlobal,{$set:{isOnline:logoutDate}});
      });
    } catch (error) {
      console.error("Error connecting socket:", error);
      socket.disconnect(true);
      
    }
  });

  return io;
};

export default useSocket;
