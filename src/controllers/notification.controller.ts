import { errorHandler } from "../lib/utils/errorHandler";
import Notification from '../models/notification.model';
import { CustomRequest } from "./user.controller";
import { Request, Response } from "express";


export const getNotifications = async (req: CustomRequest, res: Response) : Promise<void> => {
const userId = req.user?._id;
try {
    const notifications = await Notification.find({to : userId})
    .populate({
        path:"from",
        select:"username profileImg"
    })
   await Notification.updateMany({to:userId} , {read:true})
   res.status(200).json(notifications);
} catch (error) {
    errorHandler(error, res)
}
}

export const deleteNotifications = async (req: CustomRequest, res: Response) : Promise<void> => {
    const userId = req.user?._id;
try {
    await Notification.deleteMany({to : userId})
    res.status(200).json({ message: "Notifications deleted successfully" });
} catch (error) {
    errorHandler(error, res)
}
}

// export const deleteNotification  = async (req: CustomRequest, res: Response) : Promise<void> => {

//     const notificationId = req.params.id
//     try {
//         await Notification.findByIdAndDelete(notificationId)
//         res.status(200).json({ message: "Notification deleted successfully" });
//     } catch (error) {
//         errorHandler(error, res)
//     }
// }