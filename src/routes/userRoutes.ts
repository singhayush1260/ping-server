import express from "express";
import {getUsers,getUserById, getCurrentUser, updateUser} from "../controllers/userControllers";
import { param,body} from "express-validator";
import verifyToken from "../middleware/auth";
import { multerErrorHandler } from "../middleware/multer-error";
import multer from "multer";

export const storage=multer.memoryStorage();
export const upload=multer({
  storage,
  limits:{
    fileSize:1024*1024
  }
})

const router=express.Router();

router.get("/all",verifyToken,getUsers);

router.get("/current-user",verifyToken,getCurrentUser);

router.get("/:userId",verifyToken, [param("userId").notEmpty().withMessage("User ID is required")], getUserById);

router.put(
  "/",
  verifyToken,
  upload.single("profilePicture"),
  [
    body("name")
      .if((value, { req }) => req.body.name !== undefined)
      .isLength({ min: 1, max: 50 })
      .withMessage("Name must be between 1 and 50 characters"),
    body("about")
      .if((value, { req }) => req.body.about !== undefined)
      .isLength({ min: 1, max: 100 })
      .withMessage("About must be between 1 and 100 characters"),
  ],
  updateUser
);


router.use(multerErrorHandler);

export default router;
