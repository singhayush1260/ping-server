import { Request, Response } from "express";
import User from "../models/User";
import ConnectionRequest from "../models/ConnectionRequest";

export const sendConnectionRequest = async (req: Request, res: Response) => {
  console.log("inside send con req---->>");
  const { userId: currentUserId } = req;
  const { receiverId } = req.body;

  try {
    const sender = await User.findById(currentUserId);
    if (!sender) {
      return res.status(404).json({ message: "Sender not found." });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found." });
    }
    if (
      sender.connections.includes(receiver._id) ||
      receiver.connections.includes(sender._id)
    ) {
      return res.status(400).json({ message: "Users are already connected." });
    }

    const existingRequest = await ConnectionRequest.findOne({
      sender: sender._id,
      receiver: receiver._id,
    });

    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "Connection request already sent." });
    }

    const connectionRequest = new ConnectionRequest({
      sender: sender._id,
      receiver: receiver._id,
    });

    await connectionRequest.save();
    console.log("con req sent", connectionRequest);
    res.status(201).json({
      message: "Connection request sent successfully.",
      connectionRequest,
    });
  } catch (error) {
    console.log("error while sending conn req", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const acceptConnectionRequest = async (req: Request, res: Response) => {
  console.log("inside accept con req---->>");
  const { connectionRequest } = req.body;
  const { sender: senderId, receiver: receiverId } = connectionRequest;

  console.log("connection req", connectionRequest);

  try {
    const sender = await User.findById(senderId._id);
    if (!sender) {
      console.log("sender not found", sender);
      return res.status(404).json({ message: "Sender not found." });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      console.log("receiver not found", receiver);
      return res.status(404).json({ message: "Receiver not found." });
    }
    sender.connections.push(receiver._id);
    receiver.connections.push(sender._id);
    await sender.save();
    await receiver.save();
    const connectionReq = await ConnectionRequest.findById(
      connectionRequest._id
    );
    if (!connectionReq) {
      return res.status(404).json({ message: "Connection request not found." });
    }

    connectionReq.status = "accepted";
    await connectionReq.save();

    res
      .status(200)
      .json({ message: "Connection request accepted successfully." });
  } catch (error) {
    console.log("error while accepting conn req", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const declineConnectionRequest = async (req: Request, res: Response) => {
  console.log("inside decline con req---->>");
  const { connectionRequest: connectionRequestId } = req.body;

  console.log("connection request", connectionRequestId);

  try {
    const connectionRequest = await ConnectionRequest.findById(
      connectionRequestId._id
    );
    if (!connectionRequest) {
      return res.status(404).json({ message: "Connection request not found." });
    }
    connectionRequest.status = "declined";
    await connectionRequest.save();

    res.status(200).json({ message: "Connection request declined." });
  } catch (error) {
    console.log("error while declining conn req", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getAllConnectionRequests = async (req: Request, res: Response) => {
  const { type } = req.query;
  const { userId } = req;
  try {
    let connectionRequests;
    if (type === "sent") {
      connectionRequests = await ConnectionRequest.find({
        sender: userId,
      })
        .populate("receiver", "-password")
        .sort({ createdAt: -1 });
    } else if (type === "received") {
      connectionRequests = await ConnectionRequest.find({
        receiver: userId,
      })
        .populate("sender", "-password")
        .sort({ createdAt: -1 });
    } else {
      connectionRequests = await ConnectionRequest.find()
        .populate("sender", "-password")
        .populate("receiver", "-password")
        .sort({ createdAt: -1 });
    }

    res.status(200).json({ connectionRequests });
  } catch (error) {
    console.error("Error while getting connection requests:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
