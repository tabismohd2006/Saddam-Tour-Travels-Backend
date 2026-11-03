
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { verifyCronSecret } from "../middleware/cronAuth.js";

import {
  registerDevice,
  sendTestNotification,
  runExpiryReminders,
} from "../controllers/notificationController.js";

const router = express.Router();

// Admin device registration
router.post("/register-device", protect, registerDevice);

// Admin test notification
router.post("/test", protect, sendTestNotification);

// Secure automatic insurance expiry reminders
router.post(
  "/run-expiry-reminders",
  verifyCronSecret,
  runExpiryReminders
);

export default router;
