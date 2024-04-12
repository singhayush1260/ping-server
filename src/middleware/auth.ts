import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  console.log("inside verify token")
  const token = req.cookies["auth_token"];
  if (!token) {
    console.log("no token")
    return res.status(401).json({ message: "unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string);
    req.userId = (decoded as JwtPayload).userId;
    next();
  } catch (error) {
    console.log("inside auth middleware error")
    return res.status(401).json({ message: "unauthorized" });
  }
};

export default verifyToken;