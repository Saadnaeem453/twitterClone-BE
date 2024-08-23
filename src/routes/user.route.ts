import express from "express";
import { followUnfollowUser, getUserProfile,getSuggestedUser, updateUser } from "../controllers/user.controller";
import { protectedRoute } from "../middleware/protectedRoute";
const router = express.Router();

router.get("/profile/:username" ,protectedRoute, getUserProfile)
router.get("/suggested" , protectedRoute, getSuggestedUser )
router.post("/follow/:id" , protectedRoute, followUnfollowUser )
router.post("/update" , protectedRoute, updateUser )

export default router