
import mongoose from "mongoose";

const insuranceSchema = new mongoose.Schema(
  {
    // Customer Details
    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    customerPhone: {
      type: String,
      required: true,
      trim: true,
    },

    // Vehicle Details
    vehicleNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    vehicleType: {
      type: String,
      required: true,
      trim: true,
    },

    vehicleModel: {
      type: String,
      required: true,
      trim: true,
    },

    // Insurance Details
    insurer: {
      type: String,
      required: true,
      trim: true,
    },

    policyNumber: {
      type: String,
      required: true,
      trim: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    expiryDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return !this.startDate || value >= this.startDate;
        },
        message: "Expiry date cannot be before start date",
      },
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    // Reminder Tracking
    reminderSent: {
      fifteenDays: {
        type: Boolean,
        default: false,
      },

      sevenDays: {
        type: Boolean,
        default: false,
      },

      expiryDay: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Insurance", insuranceSchema);
