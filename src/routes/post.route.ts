
import express from "express"
import { protectedRoute } from "../middleware/protectedRoute"
import { createComment, createPost, deletePost, getAllPosts, getFollowingPosts, getLikedPosts, getUserPosts, likeUnlikePost } from "../controllers/post.controller"

const router =  express.Router()

router.get("/posts" ,protectedRoute ,  getAllPosts)
router.get("/following", protectedRoute , getFollowingPosts)
router.get("/liked/:id", protectedRoute , getLikedPosts)
router.get("/user/:username" ,protectedRoute, getUserPosts)
router.post("/createPost" ,protectedRoute, createPost)
router.post("/like/:id" ,protectedRoute, likeUnlikePost)
router.post("/comment/:id" ,protectedRoute, createComment)
router.delete("/deletePost/:id" ,protectedRoute, deletePost)



export default router