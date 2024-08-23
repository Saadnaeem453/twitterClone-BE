import { Response } from "express";
import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (userId: string , res:Response ):void =>{
    const token = jwt.sign({id: userId}, process.env.JWT_SECRET || "klrjo3ir903f3n0v3ivn@#@E2",{
        expiresIn:"7d"
    })
    res.cookie("token", token, {
        httpOnly:true,
        sameSite:"strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    })
};
