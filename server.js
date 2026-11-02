import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import enquiryRoutes from "./routes/enquiryRoutes.js";
dotenv.config();
import authRoutes from "./routes/authRoutes.js";
import insuranceRoutes from "./routes/insuranceRoutes.js";

// Connect Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/enquiry", enquiryRoutes);
app.use("/api/admin", authRoutes);
app.use("/api/insurance", insuranceRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("🚀 Saddam Tour & Travels API Running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server Running on http://localhost:${PORT}`);
});