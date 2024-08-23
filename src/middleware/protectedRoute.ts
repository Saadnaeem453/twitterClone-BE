import { Request, Response, NextFunction } from "express";
import { JwtPayload, verify } from "jsonwebtoken";
import { IUser } from "../models/user.model";
import User from "../models/user.model";

interface CustomJwtPayload extends JwtPayload {
  userId: string;
}

interface CustomRequest extends Request {
  user?: IUser;
  cookies: {
    token?: string;
  }
}

export const protectedRoute = async (req: CustomRequest, res: Response, next: NextFunction):Promise<void> => {
    
  try {
    const token = req.cookies.token;
    
    if (!token) {
     res.status(401).json({ error: "Unauthorized: No Token Provided" })

     return;
    }

    const decoded = verify(token, process.env.JWT_SECRET as string) as CustomJwtPayload;

    if (!decoded) {
       res.status(401).json({ error: "Unauthorized: Invalid Token" })

       return;
    }

    const user = await User.findById(decoded.id).select("-password") as IUser;

    if (!user) {

       res.status(404).json({ error: "User not found" })

       return;
    }

    req.user = user;
    next();
  } catch (err: any) {
     res.status(500).json({ error: "Internal Server Error" })
     return;
  }
};
