import express from "express";

import {
  createEnquiry,
  getAllEnquiries,
  updateEnquiryStatus,
  deleteEnquiry,
} from "../controllers/enquiryController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", createEnquiry);

router.get("/", protect, getAllEnquiries);

router.patch("/:id", protect, updateEnquiryStatus);

router.delete("/:id", protect, deleteEnquiry);

export default router;