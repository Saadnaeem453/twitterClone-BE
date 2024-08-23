import express from "express";
import {getMe, loginUser,logOut, signup} from "../controllers/auth.controller"
import { protectedRoute } from "../middleware/protectedRoute";
const router = express.Router();

router.get("/me",protectedRoute, getMe)
router.post("/login", loginUser)
router.post("/signup", signup)
router.post("/logout", logOut)

export default router