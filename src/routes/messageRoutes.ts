import express from "express";
import verifyToken from "../middleware/auth";
import { body } from "express-validator";
import { sendMessage, getAllMessages,markAsSeen } from "../controllers/messageControllers";
import {multerErrorHandler} from "../middleware/multer-error";
import multer from "multer";

export const storage=multer.memoryStorage();
export const upload=multer({
  storage,
  limits:{
    fileSize:1024*1024
  }
})


const router = express.Router();

router.post(
  "/",
  verifyToken,
  upload.single("image"),
  sendMessage
);

router.post("/seen",verifyToken, [body("messageId").notEmpty().withMessage("Message ID is required")],markAsSeen);

// router.post("/image",verifyToken,upload.single("image"),sendImage);

router.get("/:chatId", verifyToken,getAllMessages);

router.use(multerErrorHandler);

export default router;
