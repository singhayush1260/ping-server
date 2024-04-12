import express from "express";
import verifyToken from "../middleware/auth";
import { body,param } from "express-validator";
import {createChat, getChatById, getAllChats, deleteChatById, editGroupById} from "../controllers/chatControllers";
import {multerErrorHandler} from "../middleware/multer-error";
import multer from "multer";

const storage=multer.memoryStorage();
const upload=multer({
  storage,
  limits:{
    fileSize:1024*1024
  }
})

const router = express.Router();

router.post(
  "/",
  verifyToken,
  upload.single("thumbnail"),
  [
    body("userIds")
      .custom((value, { req }) => {
        const isGroup = JSON.parse(req.body.isGroup); // Parse the string to boolean
        if (isGroup && (!Array.isArray(value) || value.length < 2)) {
          throw new Error("UserIds must be an array with at least two elements for group chats");
        }
        if (!isGroup && (!Array.isArray(value) || value.length !== 1)) {
          throw new Error("UserIds must be an array with exactly one element for non-group chats");
        }
        return true;
      })
      .withMessage((value, { req }) => {
        const isGroup = JSON.parse(req.body.isGroup); // Parse the string to boolean
        if (isGroup) {
          return "UserIds must be an array with at least two elements for group chats";
        } else {
          return "UserIds must be an array with exactly one element for non-group chats";
        }
      }),
    body("userIds.*")
      .isMongoId()
      .withMessage("Each userId must be a valid MongoDB ID"),
    body("isGroup").isString().withMessage("isGroup must be a string"),
  ],
  createChat
);


router.put(
  "/",
  verifyToken,
  upload.single("newThumbnail"),
  editGroupById
);

router.get("/", verifyToken, getAllChats);

router.get("/:chatId",[param("chatId").notEmpty().withMessage("Chat ID is required")] ,verifyToken, getChatById);


router.delete("/",verifyToken,[body("chatId").notEmpty().withMessage("Chat ID is required")],deleteChatById);

router.use(multerErrorHandler);

export default router;
