// Khởi tạo Cấu hình Tổng thể
// Là trung tâm, nơi ứng dụng chính (app.ts hoặc server.ts) gọi để khởi tạo tất cả các dịch vụ.

import * as dotenv from "dotenv";
import { connectDB } from "./database"; // Import hàm kết nối DB

// 1. Tải biến môi trường
dotenv.config();

/**
 * Loads all configurations and initializes necessary services.
 */
export const initializeConfig = async () => {
  console.log("--- Starting Server Configuration ---");

  // Khởi tạo kết nối Database
  await connectDB();

  // Kiểm tra và in ra thông tin cấu hình cơ bản
  console.log(`Current Environment: ${process.env.NODE_ENV || "Development"}`);
  console.log(`JWT Secret Loaded: ${!!process.env.JWT_SECRET}`);

  // Gán các biến env không cần thiết ở đây, nhưng có thể thêm logic kiểm tra khác.

  console.log("--- Configuration Complete ---");
};

// Lưu ý: Các file app.ts sẽ gọi initializeConfig() trước khi khởi động Express.
