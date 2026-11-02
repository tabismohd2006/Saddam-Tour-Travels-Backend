
import express from "express";

import {
  createInsurance,
  getAllInsurance,
  getInsuranceById,
  updateInsurance,
  deleteInsurance,
} from "../controllers/insuranceController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All insurance routes are protected
router.use(protect);

// Add new insurance
router.post("/", createInsurance);

// Get all insurance + search + filter
router.get("/", getAllInsurance);

// Get single insurance by ID
router.get("/:id", getInsuranceById);

// Update insurance
router.put("/:id", updateInsurance);

// Delete insurance
router.delete("/:id", deleteInsurance);

export default router;
