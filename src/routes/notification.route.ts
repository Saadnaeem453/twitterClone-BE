

import express  from "express"
import { protectedRoute } from "../middleware/protectedRoute";
import {getNotifications , deleteNotifications,} from "../controllers/notification.controller"
const router = express.Router();

router.get("/"  , protectedRoute , getNotifications)
router.delete("/delete", protectedRoute , deleteNotifications)
// router.delete("/delete/:id", protectedRoute , deleteNotification)

export default router