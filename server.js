import "dotenv/config";

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import enquiryRoutes from "./routes/enquiryRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import insuranceRoutes from "./routes/insuranceRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/enquiry", enquiryRoutes);
app.use("/api/admin", authRoutes);
app.use("/api/insurance", insuranceRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => {
  res.send("🚀 Saddam Tour & Travels API Running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server Running on http://localhost:${PORT}`);
});