
import mongoose from "mongoose";
import Insurance from "../models/Insurance.js";

// Add New Insurance
export const createInsurance = async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      vehicleNumber,
      vehicleType,
      vehicleModel,
      insurer,
      policyNumber,
      startDate,
      expiryDate,
      notes,
    } = req.body;

    // Required field validation
    if (
      !customerName ||
      !customerPhone ||
      !vehicleNumber ||
      !vehicleType ||
      !vehicleModel ||
      !insurer ||
      !policyNumber ||
      !startDate ||
      !expiryDate
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    // Date validation
    const start = new Date(startDate);
    const expiry = new Date(expiryDate);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(expiry.getTime()) ||
      expiry < start
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter valid insurance dates",
      });
    }

    const insurance = await Insurance.create({
      customerName,
      customerPhone,
      vehicleNumber,
      vehicleType,
      vehicleModel,
      insurer,
      policyNumber,
      startDate: start,
      expiryDate: expiry,
      notes,
    });

    res.status(201).json({
      success: true,
      message: "Insurance added successfully",
      insurance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Insurance + Search + Filter
export const getAllInsurance = async (req, res) => {
  try {
    const { search, status } = req.query;

    const filter = {};

    // Search by customer, phone, vehicle or policy
    if (search && search.trim()) {
      const searchRegex = new RegExp(
        search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i"
      );

      filter.$or = [
        { customerName: searchRegex },
        { customerPhone: searchRegex },
        { vehicleNumber: searchRegex },
        { policyNumber: searchRegex },
        { insurer: searchRegex },
      ];
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const soonDate = new Date(today);
    soonDate.setDate(soonDate.getDate() + 15);

    if (status === "Expired") {
      filter.expiryDate = { $lt: today };
    } else if (status === "Expiring Soon") {
      filter.expiryDate = {
        $gte: today,
        $lte: soonDate,
      };
    } else if (status === "Active") {
      filter.expiryDate = { $gt: soonDate };
    }

    const insurances = await Insurance.find(filter).sort({
      expiryDate: 1,
    });

    // Calculate status dynamically
    const insuranceWithStatus = insurances.map((item) => {
      const insurance = item.toObject();
      const expiry = new Date(insurance.expiryDate);
      expiry.setHours(0, 0, 0, 0);

      let currentStatus;

      if (expiry < today) {
        currentStatus = "Expired";
      } else if (expiry <= soonDate) {
        currentStatus = "Expiring Soon";
      } else {
        currentStatus = "Active";
      }

      return {
        ...insurance,
        status: currentStatus,
      };
    });

    res.status(200).json({
      success: true,
      count: insuranceWithStatus.length,
      insurances: insuranceWithStatus,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Single Insurance
export const getInsuranceById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid insurance ID",
      });
    }

    const insurance = await Insurance.findById(id);

    if (!insurance) {
      return res.status(404).json({
        success: false,
        message: "Insurance not found",
      });
    }

    res.status(200).json({
      success: true,
      insurance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Insurance
export const updateInsurance = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid insurance ID",
      });
    }

    const allowedFields = [
      "customerName",
      "customerPhone",
      "vehicleNumber",
      "vehicleType",
      "vehicleModel",
      "insurer",
      "policyNumber",
      "startDate",
      "expiryDate",
      "notes",
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (updates.startDate) {
      updates.startDate = new Date(updates.startDate);
    }

    if (updates.expiryDate) {
      updates.expiryDate = new Date(updates.expiryDate);
    }

    const existing = await Insurance.findById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Insurance not found",
      });
    }

    const finalStartDate = updates.startDate || existing.startDate;
    const finalExpiryDate = updates.expiryDate || existing.expiryDate;

    if (
      Number.isNaN(new Date(finalStartDate).getTime()) ||
      Number.isNaN(new Date(finalExpiryDate).getTime()) ||
      new Date(finalExpiryDate) < new Date(finalStartDate)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid insurance dates",
      });
    }

    const insurance = await Insurance.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Insurance updated successfully",
      insurance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Insurance
export const deleteInsurance = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid insurance ID",
      });
    }

    const insurance = await Insurance.findByIdAndDelete(id);

    if (!insurance) {
      return res.status(404).json({
        success: false,
        message: "Insurance not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Insurance deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
