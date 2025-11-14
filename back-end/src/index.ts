import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
// import userRoutes from "./routes/userRoutes";
// import categoryRoutes from "./routes/categoryRoutes";
// import transactionRoutes from "./routes/transactionRoutes";
// import analyticsRoutes from "./routes/analyticsRoutes";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Middleware toàn cục
app.use(cors());
app.use(express.json()); // Cho phép Express đọc JSON từ request body

// Kết nối MongoDB
mongoose
  .connect(process.env.MONGO_URI || "")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Định tuyến (Routing)
app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/categories", categoryRoutes);
// app.use("/api/transactions", transactionRoutes);
// app.use("/api/analytics", analyticsRoutes);

app.listen(5000, () => console.log("Server running on port 5000"));
