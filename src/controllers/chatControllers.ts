import { Request, Response } from "express";
import Chat from "../models/Chat";
import { validationResult } from "express-validator";
import { uploadToCloudinary } from "../services/cloudinary-upload";
import User from "../models/User";
import { ObjectId } from 'mongodb'; // Import ObjectId from MongoDB

interface IFormattedChat {
  _id: ObjectId |undefined;
  isGroup: boolean;
  createdAt: Date;
  name?: string; 
  thumbnail?: string|undefined|null;
  users?: any[]; 
  lastMessage:any;
}

export const createChat = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const combinedMessage = errors.array().reduce((accumulator, currentMessage) => {
      return accumulator + currentMessage.msg + '\n';
    }, '');
    console.log("combined error from create chat validation", combinedMessage);
    return res.status(400).json({ message: combinedMessage });
  }

  const { userId: currentUserId } = req;
  const { userIds, isGroup, name } = req.body;
  const thumbnail = req.file as Express.Multer.File;

  try {
    if (!JSON.parse(isGroup)) {
      const otherUserId = userIds[0];
      const existingChat = await Chat.find({
        isGroup: false,
        $and: [
          { users: { $elemMatch: { $eq: currentUserId } } },
          { users: { $elemMatch: { $eq: otherUserId } } },
        ],
      });
      if (existingChat.length > 0) {
        console.log("chat already exists");
        return res.status(200).json(existingChat[0]);
      }
    }

    userIds.unshift(currentUserId);

    let thumbnailUrl: string = JSON.parse(isGroup) ? process.env.DEFAULT_GROUP_THUMBNAIL as string:"";
    if (thumbnail) {
      thumbnailUrl = await uploadToCloudinary(thumbnail);
    }

    let adminId: string | undefined = undefined;
    if (JSON.parse(isGroup)) {
      adminId = currentUserId; // Set currentUserId as the admin if it's a group chat
    }

    const chat = await Chat.create({
      isGroup: JSON.parse(isGroup),
      name,
      thumbnail: thumbnailUrl,
      users: userIds,
      admin: adminId,
    });

    for (const userId of userIds) {
      await User.findByIdAndUpdate(userId, { $push: { chats: chat._id } });
    }

    console.log("created chat", chat);
    return res.status(201).json(chat);
  } catch (error) {
    console.log("error in create chat", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};



export const getAllChats = async (req: Request, res: Response) => {
  const {userId:currentUserId} = req;
  try {
    const chats = await Chat.find({
      users: { $elemMatch: { $eq: currentUserId } },
    })
    .populate("users", "-password")
    .populate("lastMessage")
    .sort({ updatedAt: -1 }); 

    const formattedChats:IFormattedChat[]=chats.map((chat)=>{  
    let fChat:IFormattedChat={_id:chat._id,isGroup:chat.isGroup,createdAt:chat.createdAt,lastMessage:chat.lastMessage};
    if(chat.isGroup){
     fChat.thumbnail=chat.thumbnail;
     fChat.name=chat.name;
     fChat.users=chat.users;
     fChat.lastMessage=chat.lastMessage
    }
    else{
      const otherUser:any = chat.users.filter((user) => user._id.toString() !== currentUserId)[0];
      fChat.name=otherUser?.name;
      fChat.thumbnail=otherUser?.profilePicture
      fChat.lastMessage=chat?.lastMessage;
    }
    return fChat;
    });
    res.status(200).json(formattedChats);
  } catch (error) {
    console.log("error in getChats", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getChatById = async (req: Request, res: Response) => {
  const {userId:currentUserId}=req;
  const { chatId } = req.params;
  try {
    const chat = await Chat.findOne({ _id: chatId }).populate(
      "users",
      "-password"
    ).populate("admin");
    let formattedChat:any={_id:chat?._id,isGroup:chat?.isGroup,createdAt:chat?.createdAt};
    if(chat?.isGroup){
      formattedChat.thumbnail=chat.thumbnail;
      formattedChat.name=chat.name;
      formattedChat.users=chat.users;
      formattedChat.admin=chat.admin;
    }
    else{
      const otherUser:any = chat?.users.filter((user) => user._id.toString() !== currentUserId)[0];
      formattedChat.thumbnail=otherUser?.profilePicture;
      formattedChat.name=otherUser?.name;
      formattedChat.users=[otherUser];
    }
    res.send(formattedChat);
  } catch (error) {
    console.log("error in getChats", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const editGroupById = async (req: Request, res: Response) => {
  console.log("edit group by id", req.body);
  const { userId: currentUserId } = req;
  const { chatId, newName, removeThumbnail, newMembers, memberId } = req.body;
  const newThumbnail = req.file as Express.Multer.File;
  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }
    if (!chat.admin || !chat.admin.equals(currentUserId)) {
      return res.status(403).json({ message: "You are not authorized to perform this action" });
    }
    let update: any = {};
    if (removeThumbnail && JSON.parse(removeThumbnail)) {
      console.log("Removing thumbnail");
      update = { thumbnail: process.env.DEFAULT_GROUP_THUMBNAIL as string };
    } else if (newThumbnail) {
      const newThumbnailUrl = await uploadToCloudinary(newThumbnail);
      update = { thumbnail: newThumbnailUrl };
    } else if (newName) {
      update = { name: newName };
    } else if (newMembers && newMembers.length > 0) {
      console.log("new members", newMembers);
      update = { $addToSet: { users: { $each: newMembers } } };
    } else if (memberId) {
      console.log("member id removed", memberId);
      update = { $pull: { users: memberId } };
    }

    const updatedGroup = await Chat.findByIdAndUpdate(chatId, update, { new: true });
    return res.status(201).json({ chat: updatedGroup });
  } catch (error) {
    console.log("Error while updating group", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};


export const deleteChatById = async (req: Request, res: Response) => {
  console.log("delete chat by ID",req.body)
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const combinedMessage = errors.array().reduce((accumulator, currentMessage) => {
      return accumulator + currentMessage.msg + '\n';
    }, '');
    console.log("combined error from create chat validation", combinedMessage);
    return res.status(400).json({ message: combinedMessage });
  }
  const{userId:currentUserId}=req;
  const { chatId } = req.body;
  try {
    const deletedChat=await Chat.findByIdAndDelete(chatId);
    console.log("deleted chat",deletedChat);
    await User.findByIdAndUpdate(currentUserId, { $pull: { chats: chatId } });
    res.status(200).json({message:"Chat deleted"});
  } catch (error) {
    console.log("error in getChats", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const leaveGroup = async (req: Request, res: Response) => {
  console.log("inside leave group", req.body);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const combinedMessage = errors.array().reduce((accumulator, currentMessage) => {
      return accumulator + currentMessage.msg + '\n';
    }, '');
    console.log("combined error from create chat validation", combinedMessage);
    return res.status(400).json({ message: combinedMessage });
  }

  const { userId: currentUserId } = req;
  const { chatId } = req.body;
  
  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    if (chat.admin?.toString() === currentUserId) {
      const n = chat.users?.length || 0;
      if (n > 1) {
        chat.admin = chat.users[1];
      } else {
        chat.admin = null;
      }
    }
    chat.users = (chat.users || []).filter(user => user._id?.toString() !== currentUserId);

    await chat.save(); 

    await User.findByIdAndUpdate(currentUserId, { $pull: { chats: chatId } });

    res.status(200).json({ message: "Left the chat successfully" });
  } catch (error) {
    console.log("error in leaveGroup", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};




