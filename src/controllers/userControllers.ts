import { Request, Response } from "express";
import User from "../models/User";
import { uploadToCloudinary } from "../services/cloudinary-upload";
import multer from "multer";

export const getCurrentUser = async (req: Request, res: Response) => {
  const userId = req.userId;
  try {
    const user = await User.findById(userId)
      .select("-password")
      .populate("connections");
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};


export const getUserById = async (req: Request, res: Response) => {
  console.log("inside get User by id");
  const { userId } = req.params;
  try {
    const user = await User.findOne({ _id: userId }).select("-password");
    console.log("user by id", user);
    res.status(200).json(user);
  } catch (error) {
    console.log("error in getUserById");
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  //console.log("inside getUsers")
  const {userId:currentUserId} = req;
  try {
    const users = await User.find({ _id: { $ne: currentUserId } }).select("-password");
    res.status(200).json({ users });
  } catch (error) {
    console.log("error in getUsers");
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const file = req.file as Express.Multer.File;
  const { name, about, location, removeProfilePicture } = req.body;
  const { userId:currentUserId } = req;
  try {
    const update: any = {};

    if (name) {
      update.name = name;
    }
    if (about) {
      update.about = about;
    }
    if (removeProfilePicture && JSON.parse(removeProfilePicture)) {
      update.profilePicture = process.env.DEFAULT_PROFILE_PICTURE as string;
    }
    if (file) {
      const imageUrl = await uploadToCloudinary(file);
      update.profilePicture = imageUrl;
    }
    if (location) {
      const parsedLocation = JSON.parse(location);
      if (!update.location) {
        update.location = {
          center: [],
        };
      }
      if (parsedLocation?.name) {
        update.location.name = parsedLocation.name;
      }
      if (parsedLocation.center) {
        update.location.center = parsedLocation.center;
      }
    }

    const updatedUser = await User.findByIdAndUpdate(currentUserId, update, {
      new: true,
    });
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Updated user:", updatedUser);
    res.status(200).json({ user: updatedUser });
  } catch (error) {
    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .json({ error: "File too large. Max size is 1MB." });
      }
    }
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
