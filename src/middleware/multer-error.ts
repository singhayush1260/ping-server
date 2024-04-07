import multer from "multer";
import {Request,Response,NextFunction} from "express";

// Custom error handler for Multer errors
export const multerErrorHandler = async (err:Error, req:Request, res:Response, next:NextFunction) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        console.log("file too large");
        return res.status(400).json({ message: "File too large. Max size is 1MB." });
      }
      // Handle other Multer errors if needed
      return res.status(500).json({ message: "Something went wrong with Multer" });
    }
    // Pass on the error if it's not a Multer error
    next(err);
  };
  