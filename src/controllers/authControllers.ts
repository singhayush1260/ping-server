import { Request, Response } from "express";
import User from "../models/User";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";

export const signup = async (req: Request, res: Response) => {
  console.log("inside signup")
  const errors = validationResult(req);
  const { name, email, password } = req.body;
  if (!errors.isEmpty()) {
    console.log("error from signup validation",errors.array());
    const combinedMessage = errors.array().reduce((accumulator, currentMessage) => {
      return accumulator + currentMessage.msg + '\n';
    }, '');
    console.log("combined error from signup validation",combinedMessage);
    return res.status(400).json({ message: combinedMessage });
  }
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists." });
    }
    user = new User({
      name,
      email,
      password,
    });
    user.save();
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET_KEY as string,
      { expiresIn: "1d" }
    );

    res.cookie("auth_token", token, {
      httpOnly: true,
      sameSite:process.env.NODE_ENV === "production" ? "none":undefined,
      secure: process.env.NODE_ENV === "production",
      maxAge: 86400000,
    });
    console.log("user registered signup")
    res.status(200).send({ message: "User registered OK" });
    return;
  } catch (error) {
    console.log("inside signup")
    console.log("Something went wrong", error);
    
    res.status(500).json({ message: "Something went wrong!" });
  }
};

export const login = async (req: Request, res: Response) => {
  console.log("inside login")
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("error from login validation",errors.array());
    const combinedMessage = errors.array().reduce((accumulator, currentMessage) => {
      return accumulator + currentMessage.msg + '\n';
    }, '');
    console.log("combined error from signup validation",combinedMessage);
    res.status(400).json({ message: combinedMessage });
    return;
  }
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: "Invalid credentials." });
      return;
    }
    const matchPassword = await bcrypt.compare(password, user.password);
    if (!matchPassword) {
      res.status(400).json({ message: "Invalid credentials." });
      return;
    }
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET_KEY as string,
      { expiresIn: "1d" }
    );
    res.cookie("auth_token", token, {
      httpOnly: true,
      sameSite:process.env.NODE_ENV === "production" ? "none":undefined,
      secure: process.env.NODE_ENV === "production",
      maxAge: 86400000,
    });
    //console.log("inside login success");
    res.status(200).json({ message: user._id });
  } catch (error) {
    console.log("Something went wrong", error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

export const changePassword = async (req:Request, res:Response) => {
  console.log("inside change password");
  const { userId: currentUserId } = req;
  const { currentPassword, newPassword } = req.body;
  if(currentUserId===process.env.GUEST_USER_ID){
    console.log("not allowed")
    return res.status(401).json({ message: "Not allowed" });
  }

  try {
    const user = await User.findById(currentUserId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Incorrect old password" });
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};


export const logout=(req:Request, res:Response)=>{
  console.log("logout controller")
    res.cookie("auth_token","",{
      sameSite:process.env.NODE_ENV === "production" ? "none":undefined,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1,
    });
    res.send();
  }