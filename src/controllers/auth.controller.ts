import { Request, Response } from "express";
import User, { IUser } from "../models/user.model";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../lib/utils/generateToken";
import { errorHandler } from "../lib/utils/errorHandler";

interface CustomRequest extends Request {
  user?: IUser;
}

export const signup = async (req: Request, res: Response): Promise<void> => {
  const { username, fullname, email, password } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    res.status(400).json({ error: "Invalid email format" });
    return;
  }
  if (password.length < 6) {
    res
      .status(400)
      .json({ error: "Password must be at least 6 characters long" });
    return;
  }

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    res.status(400).json({ error: "Username is already taken" });
    return;
  }

  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    res.status(400).json({ error: "Email Already in use" });
    return;
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser: IUser = new User({
      fullname,
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    const resUser = await User.findById(newUser._id).select("-password");
    if (!resUser) {
      res.status(400).json({ error: "Unable to create user" });
      return;
    }
    const userId: string = newUser._id.toString();

    generateTokenAndSetCookie(userId, res);
    res.status(201).json(resUser);
  } catch (error) {
   errorHandler(error ,res)
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      res.status(400).json({ error: "Invalid Credientials" });
      return;
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(400).json({ error: "Invalid username or password." });
      return;
    }
    const resUser = await User.findOne(user._id).select("-password");
    generateTokenAndSetCookie(user._id, res);
    res.status(200).json(resUser);
  } catch (error) {
    errorHandler(error ,res)
  }
};

export const logOut = (req: Request, res: Response) => {
  try {
    res.cookie("token", " ", { maxAge: 0 });
    res.status(200).json({ message: "Logout successfully" });
  } catch (error) {
    res.status(200).json({ error: "Unable to logout the user" });
  }
};

export const getMe = async (req: CustomRequest, res: Response) => {
  try {
    console.log("called");
    
      if (!req.user?._id) {
          return res.status(400).json({ error: "User ID is missing" });
      }

      const user = await User.findById(req.user._id).select("-password");
      if (!user) {
          return res.status(404).json({ error: "User not found" });
      }

      res.status(200).json(user);
  } catch (error) {
      errorHandler(error, res);
  }
};