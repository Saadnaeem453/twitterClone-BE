import express from "express";
import authRoutes from "../src/routes/auth.route"
import userRoutes from "../src/routes/user.route"
import postRoutes from "../src/routes/post.route"
import notificationRoutes from "../src/routes/notification.route"
import {v2 as cloudinary} from  "cloudinary"

import dotenv from "dotenv"
import dbConnect from "./config/dbConnect";
import cookieParser from "cookie-parser";

const app = express();
dotenv.config();
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json())
const PORT =process.env.PORT || 5000
dbConnect();

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
})

app.use(express.json())
app.use("/api/auth", authRoutes)
app.use("/api/user", userRoutes)
app.use("/api/post", postRoutes)
app.use("/api/notifications", notificationRoutes)




app.listen(PORT, ()=> {
    console.log(`Server running on ${PORT}`)
    
})