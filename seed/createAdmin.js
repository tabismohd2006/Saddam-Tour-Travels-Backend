import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import Admin from "../models/Admin.js";

dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);

const createAdmin = async () => {
  try {
    const exist = await Admin.findOne({
      email: "admin@saddamtravels.com",
    });

    if (exist) {
      console.log("❌ Admin Already Exists");
      process.exit();
    }

    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    await Admin.create({
      name: "Saddam Travels",
      email: "admin@saddamtravels.com",
      password: hashedPassword,
    });

    console.log("✅ Admin Created Successfully");

    process.exit();

  } catch (err) {
    console.log(err.message);
    process.exit();
  }
};

createAdmin();