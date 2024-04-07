import { Request, Response } from "express";
import User from "../models/User";
import {uploadToCloudinary} from "../services/cloudinary-upload";
import multer from "multer";

export const getCurrentUser = async (req: Request, res: Response) => {
  const userId = req.userId;
  try {
    const user = await User.findById(userId).select("-password").populate("connections");
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  console.log("inside get User by id")
  const {userId}=req.params;
 try {
   const user = await User.findOne({_id:userId}).select("-password");
   console.log("user by id",user);
   res.status(200).json(user);
 } catch (error) {
   console.log("error in getUserById");
   res.status(500).json({ message: "Something went wrong" });
 }
};


export const getUsers = async (req: Request, res: Response) => {
   //console.log("inside getUsers")
    const userId=req.userId;
  try {
    const users = await User.find({_id:{$ne:userId}}).select("-password");
    res.status(200).json({ users });
  } catch (error) {
    console.log("error in getUsers");
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  console.log("<----update user------>")
    const file = req.file as Express.Multer.File;
    const { name, about, location } = req.body;
    const userId = req.userId;
    console.log("<----file------>",file);
    console.log("<----req.body----->",req.body);
    
    try {
      const user = await User.findById(userId).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      if (name) {
        user.name = name;
      }
      if (about) {
        user.about = about;
      }
  
      if (file) {
        const imageUrl = await uploadToCloudinary(file);
        user.profilePicture = imageUrl;
      }
  
      if (location) {
        const parsedLocation=JSON.parse(location);
        console.log("<-----parsed location----->",parsedLocation);
        if (!user.location) {
          user.location = {
            center: [],
          }; // Initialize user.location if it's undefined
          
        }
  
        if (parsedLocation?.name) {
          user.location.name = parsedLocation.name;
        }
  
        if (parsedLocation.center) {
          user.location.center = parsedLocation.center;
        }
      }
  
      const updatedUser = await user.save();
      console.log('Updated user:', updatedUser);
      res.status(200).json({ user: updatedUser });
    } catch (error) {
      if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ error: "File too large. Max size is 1MB." });
        }
      }
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Something went wrong' });
    }
  };


  
