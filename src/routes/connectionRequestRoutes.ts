import express from "express";
import { check } from "express-validator";
import verifyToken from "../middleware/auth";
import { acceptConnectionRequest, declineConnectionRequest, getAllConnectionRequests, sendConnectionRequest } from "../controllers/connectionRequestControllers";

const router = express.Router();

router.post("/send",verifyToken,sendConnectionRequest);

router.post("/accept",verifyToken,acceptConnectionRequest);

router.post("/decline",verifyToken,declineConnectionRequest);

router.get("/",verifyToken,getAllConnectionRequests);


export default router;