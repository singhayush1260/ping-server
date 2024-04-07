import express,{Request,Response} from "express";
import { signup, login, logout } from "../controllers/authControllers";
import { check } from "express-validator";
import verifyToken from "../middleware/auth";

const router = express.Router();


router.get("/validate-token", verifyToken, (req: Request, res: Response) => {
    console.log("inside validate token",req.userId)
    res.status(200).send({ userId: req.userId });
  });

router.post(
  "/sign-up",
  [
    check("name", "Name is required").isString(),
    check("email", "Email is required").isEmail(),
    check("password", "Password with 6 or more characters required").isLength({
      min: 6,
    }),
  ],
  signup
);

router.post(
  "/login",
  [
    check("email", "Email is required").isEmail(),
    check("password", "Password with 6 or more characters required").isLength({
      min: 6,
    }),
  ],
  login
);

router.post("/logout",logout);

export default router;