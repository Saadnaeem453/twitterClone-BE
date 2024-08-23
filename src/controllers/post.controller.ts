import {  Response } from "express";
import { CustomRequest } from "./user.controller";
import User from "../models/user.model";
import cloudinary from "../config/cloudinaryConfig";
import Post, { IComment } from "../models/post.model";
import { errorHandler } from "../lib/utils/errorHandler";
import mongoose from "mongoose";
import Notification from "../models/notification.model";


export const createPost=async(req:CustomRequest , res:Response):Promise<void> => {
    try {

    const {text} = req.body;
    let {img}= req.body;
    const userId = req.user?._id.toString();

    const user= await User.findById(userId);
    if(!user) {
        res.status(200).json({message:"User not found"});
        return
    } 
    
    if(img){
        const uplaodedResponse =await cloudinary.uploader.upload(img)
        img= uplaodedResponse.secure_url
    }

    const newPost = new Post({
        user:userId,
        text,
        img
    })
await newPost.save();
res.status(201).json(newPost)
    } catch (error) {
        errorHandler(error,res)
    }
}

export const deletePost = async (req:CustomRequest , res:Response):Promise<void> => {
    const postId= req.params.id
    try {
        const post = await Post.findById(postId);
        if(!post){
            res.status(404).json({message:"Post not found"})
            return;
        }
        if(post?.user?.toString() !== req.user?._id.toString()){
            res.status(403).json({message:"You are not allowred to delete the post "})
          return
        }
        if(post.img){
            const imgId= post.img?.split("/").pop()?.split(".")[0]
            if(imgId) await cloudinary.uploader.destroy(imgId)
        }
        await Post.findByIdAndDelete(postId);

        res.status(200).json({message:"Post has been deleted successfully"})
    } catch (error) {
        errorHandler(error, res)
    }
}

export const createComment = async (req: CustomRequest, res: Response): Promise<void> => {
    const userId = req.user?._id;
    const postId = req.params.id;
    const { text } = req.body;
  
    try {
      if (!userId) {
        res.status(401).json({ message: "User not authenticated" });
        return;
      }
  
      if (!text) {
        res.status(400).json({ message: "Text field is required" });
        return;
      }
  
      const post = await Post.findById(postId);
      if (!post) {
        res.status(404).json({ message: "Post not found" });
        return;
      }
  
      const comment: IComment = { user: userId as unknown as mongoose.Schema.Types.ObjectId, text };
      post.comments.push(comment);
      await post.save();
  
      res.status(200).json({ message: "Comment added successfully", post }); // Sending a response after successful save
    } catch (error) {
      errorHandler(error, res);
    }
  };
  
  
  export const likeUnlikePost = async (req: CustomRequest, res: Response): Promise<void> => {
    const userId = req.user?._id;
    const { id: postId } = req.params;
  
    try {
      const post = await Post.findById(postId);
  
      if (!post) {
        res.status(404).json({ message: "Post not found" });
        return; // Early return to avoid further processing
      }
  
      const userLikedPost = post.likes.find((item)=> item.toString() === userId?.toString());
  
      if (userLikedPost) {

        // User has already liked the post, so unlike it
        await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
        await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });
  
        const updatedLikes = post.likes.filter((id) => id.toString() !== userId?.toString());
        res.status(200).json(updatedLikes);
      } else {
        // User hasn't liked the post, so like it
        post.likes.push(userId as any);
        await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
  
        const newNotification = new Notification({
          from: req.user?.id,
          to: post.user,
          type: "like",
        });
        await newNotification.save();
  
        await post.save();

        res.status(200).json(post.likes)
      }
    } catch (error) {
      
      errorHandler(error, res);
    }
  };


  export const getFollowingPosts = async (req: CustomRequest, res: Response): Promise<void> =>{
    try {
      const posts = await Post.find()
      .sort({createdAt: -1})
      .populate(
        {
        path:"user",
        select:"-password"
      })
      .populate({
        path:"comments.user",
        select:"-password"
      })

      if(posts.length === 0){
        res.status(200).json([]);
        return;
      }
      res.status(200).json(posts);
    } catch (error) {
      errorHandler(error, res);
      console.log("Error in getAllPosts controller: ", error);
    }
  }

  export const getLikedPosts = async (req: CustomRequest, res: Response): Promise<void> =>{
const userId = req.params.id;
try {
  const user  = await User.findById(userId);
  if(!user) {
    res.status(404).json({ error: "User not found" });
    return
  }
  const posts = await Post.find({_id: {$in:user.likedPosts}})
  .populate({
    path:"user",
    select:"-password"
  })
  .populate({
    path:"comments.user",
    select:"-password"
  })
  if(posts.length ===0){
    res.status(200).json([]);
    return;
  }
  res.status(200).json(posts);
} catch (error) {
  errorHandler(error, res)
}
  }

   export const getUserPosts = async (req: CustomRequest, res: Response): Promise<void> =>{
const {username}  = req.params
try {
  const user = await User.findOne({username});
  if(!user){
    res.status(404).json({message:"User not found"})
    return
  }

  const posts  = await Post.find({user : user._id})
  .sort({createdAt: -1})
  .populate({
    path:"user",
    select:"-password"
  })
  .populate({
    path:"comments.user",
    select:"-password"
  })
  if(posts.length ===0){
    res.status(200).json([]);
    return;
  }
  res.status(200).json(posts);
} catch (error) {
  errorHandler(error, res)
}
  }

  
  export const getAllPosts = async (req: CustomRequest, res: Response): Promise<void> =>{
    try {
      const posts = await Post.find()
        .sort({ createdAt: -1 })
        .populate({
          path: "user",
          select: "-password",
        })
        .populate({
          path: "comments.user",
          select: "-password",
        });
  
      if (posts.length === 0) {
         res.status(200).json([]);
         return
      }
  
      res.status(200).json(posts);
    } catch (error) {
      console.log("Error in getAllPosts controller: ", error);
      errorHandler(error,res)
    }
  }
  