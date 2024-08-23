import { Request, Response } from "express";
import User, { IUser } from "../models/user.model";
import Notification from "../models/notification.model";
import bcrypt from "bcryptjs";
import { errorHandler } from "../lib/utils/errorHandler";
import {v2 as cloudinary} from  "cloudinary"

export interface CustomRequest extends Request {
  user?: IUser;
}

export const getUserProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username }).select("-password");
    if (!user) {
      res.status(404).json({ error: "User Profile Not Found" });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    errorHandler(error, res);
  }
};

// Follow unfollow scenario
export const followUnfollowUser = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const userToModify = await User.findById(id);
    const currentUser = await User.findById(req.user?._id);
    

    if (id === req.user?._id.toString()) {
      res
        .status(401)
        .json({ error: "You Can't Be Able To Follow Or UnFollow Yourself" });
      return;
    }
    if (!userToModify || !currentUser) {
      res.status(401).json({ error: "User not found" });
      return;
    }
    const isFollowing = currentUser.following.includes(id);
    // unfollow the user
    if (isFollowing) {
      // If the user is following someone
      // firstly remove the current user id from followers array of followed person
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user?._id } });
      // then remove the followed person id from followig list of current user
      await User.findByIdAndUpdate(req.user?._id, { $pull: { following: id } });

      res.status(200).json({ message: "User unfollowed successfully" });
    } else {
      // if not simply add the id's of both in followers and follwoing array
      await User.findByIdAndUpdate(id, { $push: { followers: req.user?._id } });
      await User.findByIdAndUpdate(req.user?._id, { $push: { following: id } });
      const newNotification = new Notification({
        from: req.user?._id,
        to: userToModify._id,
        type: "follow",
      });
      await newNotification.save();

      res.status(200).json({ message: "User followed successfully" });
    }
  } catch (error) {
    errorHandler(error, res);
  }
};

//* Get Suggested User

export const getSuggestedUser = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?._id;

  try {
    const usersFollowedByMe = await User.findById(userId).select("following");

    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      {
        $sample: {
          size: 15,
        },
      },
    ]);
    const filteredUsers = users.filter(
      (users) => !usersFollowedByMe.following.includes(users._id)
    );

    let suggestUsers;
    if (filteredUsers.length > 3) {
      suggestUsers = filteredUsers?.slice(0, 4);
    } else {
      suggestUsers = filteredUsers;
    }
    suggestUsers.forEach((user) => (user.password = null));
    res.status(200).send(suggestUsers);
  } catch (error) {
    errorHandler(error, res);
  }
};

//* Update User

export const updateUser = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  
  let {
    username,
    email,
    currentPassword,
    newPassword,
    fullname,
    bio,
    link,
  } = req.body;
  let { profileImg, coverImg } = req.body;

  let userId = req.user?._id;

  try {

    let user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ error: "User not Found" });

      return;
    }

    if (
      (!currentPassword && newPassword) ||
      (!newPassword && currentPassword)
    ) {
      res
        .status(404)
        .json({ error: "Both New & Current password is required" });
      return;
    }
// update the password
    if (currentPassword && newPassword) {
      const isPassMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isPassMatch) {
        res.status(401).json({ error: "Current Password in incorrect" });
        return;
      }

      if (newPassword.length < 6) {
        res
          .status(404)
          .json({ error: "Password must be at least 6 charcahters long" });
        return;
      }
      const salt =await bcrypt.genSalt(10);
     user.password = await bcrypt.hash(newPassword, salt);
    }

    // update the images
    if (profileImg) {
      if (user.profileImg) {
        const publicId = user.profileImg.split("/").pop()?.split(".")[0];
        if (publicId) await cloudinary.uploader.destroy(publicId);
      }
      const uploadResponse = await cloudinary.uploader.upload(profileImg);
      profileImg = uploadResponse.secure_url;
    }

    // Update the cover image
    if (coverImg) {
      if (user.coverImg) {
        const publicId = user.coverImg.split("/").pop()?.split(".")[0];
        if (publicId) await cloudinary.uploader.destroy(publicId);
      }
      const uploadResponse = await cloudinary.uploader.upload(coverImg);
      coverImg = uploadResponse.secure_url;
    }

    user.fullname = fullname || user.fullname;
		user.email = email || user.email;
		user.username = username || user.username;
		user.bio = bio || user.bio;
		user.link = link || user.link;
		user.profileImg = profileImg || user.profileImg;
		user.coverImg = coverImg || user.coverImg;

    user = await user.save()

    user.password=null
    res.status(200).json(user)
  } catch (error) {
    errorHandler(error, res)
  }
};
