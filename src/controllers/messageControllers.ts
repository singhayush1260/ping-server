import { Request, Response } from "express";
import Chat from "../models/Chat";
import Message from "../models/Message";
import { validationResult } from "express-validator";
import { uploadToCloudinary } from "../services/cloudinary-upload";


export const sendMessage = async (req: Request, res: Response) => {
  console.log("inside send message")
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("Validations failed for send message",errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { chatId, message, caption } = req.body;
  const file = req.file as Express.Multer.File;
  const currentUserId = req.userId;
  console.log("request body",req.body);

  try {
    const chat = await Chat.findOne({ _id: chatId });
    if (!chat) {
      return res.status(404).json({ message: "Chat not found or user is not part of the chat" });
    }

    let newMessage:any;
    if (file) {
      // If there's a file (image), upload it to cloudinary
      const imageUrl = await uploadToCloudinary(file);

      newMessage = new Message({
        body: caption || "", // Caption for the image
        image: imageUrl,
        chat: chatId,
        sender: currentUserId,
        seenIds:[currentUserId]
      });
    } else {
      // If no file, create a message with just text
      newMessage = new Message({
        body: message,
        chat: chatId,
        sender: currentUserId,
        seenIds:[currentUserId]
      });
    }

    await newMessage.save();

    // Push the new message to the chat's messages array
    chat.messages.push(newMessage._id);

    // Update the lastMessage field of the chat
    chat.lastMessage = newMessage._id;

    await chat.save();

    console.log("saved chat",chat);

    console.log("new message",newMessage);

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const markAsSeen = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { messageId } = req.body;
  const { userId:currentUserId } = req;

  try {
    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { $addToSet: { seenIds: currentUserId } },
      { new: true }
    );

    if (!updatedMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.status(200).json(updatedMessage);
  } catch (error) {
    console.error('Error marking message as seen:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};




export const getAllMessages = async (req: Request, res: Response) => {
    try {
      const messages = await Message.find({ chat: req.params.chatId })
        .populate("sender", "name pic email")
        .populate("chat");
    //console.log("all message for a chat",messages);
      res.json(messages);
    } catch (error) {
        console.log("Error in getAllMessages", error);
        res.status(500).json({ message: "Something went wrong" });
    }
  };

