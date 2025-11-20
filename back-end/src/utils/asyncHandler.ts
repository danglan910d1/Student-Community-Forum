// import { Request, Response, NextFunction, RequestHandler } from "express";
// import * as core from "express-serve-static-core";
// // // Định nghĩa kiểu cho các Controller (hàm xử lý bất đồng bộ)
// // type AsyncController = (
// //   req: Request,
// //   res: Response,
// //   next: NextFunction
// // ) => Promise<any>;

// // Dùng Generics <ReqT> để đại diện cho kiểu Request mà Controller sử dụng
// // type AsyncController<ReqT extends Request = Request> = (
// //   req: ReqT,
// //   res: Response,
// //   next: NextFunction
// // ) => Promise<any>;

// // /**
// //  * Hàm bọc để tự động bắt lỗi cho các Controller bất đồng bộ (async/await).
// //  * @param fn - Hàm Controller gốc
// //  */
// // export const asyncHandler =
// //   <ReqT extends Request = Request>(fn: AsyncController<ReqT>): RequestHandler =>
// //   (req, res, next) => {
// //     // Ép kiểu req thành kiểu generic mà hàm fn mong đợi
// //     // Nếu thành công, hàm Controller sẽ tự gọi res.json().
// //     // Nếu thất bại (catch), nó sẽ chạy .catch(next).
// //     Promise.resolve(fn(req as ReqT, res, next)).catch(next);
// //   };

// // KHAI BÁO KIỂU BỌC MỚI
// // Kiểu này đại diện cho hàm controller gốc (fn)
// // Định nghĩa kiểu Controller chấp nhận mọi kiểu Request mở rộng
// // T là kiểu Request mở rộng (ví dụ: Request<GetUserParams> hoặc AuthenticatedRequest)
// type AsyncController<T extends core.Request> = (
//   req: T,
//   res: Response,
//   next: NextFunction
// ) => Promise<any>;

// /**
//  * Hàm bọc (Wrapper) để tự động bắt lỗi cho các Controller bất đồng bộ (async/await).
//  * @param fn - Hàm Controller gốc
//  */
// export const asyncHandler =
//   <T extends core.Request>(fn: AsyncController<T>): RequestHandler =>
//   (req, res, next) => {
//     // Ép kiểu req thành T (kiểu mà hàm Controller mong đợi)
//     Promise.resolve(fn(req as T, res, next)).catch(next);
//   };

import { Request, Response, NextFunction, RequestHandler } from "express";
import * as core from "express-serve-static-core";

// Định nghĩa kiểu Controller chấp nhận bất kỳ kiểu Request mở rộng nào (ReqT)
type AsyncController<ReqT extends core.Request> = (
  req: ReqT,
  res: Response,
  next: NextFunction
) => Promise<any>;

/**
 * Hàm bọc (Wrapper) để tự động bắt lỗi cho các Controller bất đồng bộ (async/await).
 * Sử dụng Generics <T> để đại diện cho kiểu Controller HOÀN CHỈNH (Controller Function).
 * @param fn - Hàm Controller gốc (ví dụ: async (req: Request<GetUserParams>, res) => { ... })
 */
export const asyncHandler =
  <T extends Function>(fn: T): RequestHandler =>
  (req, res, next) => {
    // Lấy hàm gốc và bọc nó trong Promise.
    // Ép kiểu (type casting) req thành kiểu mà hàm gốc (fn) mong đợi (req as T)
    // là nguyên nhân gây ra lỗi Type Incompatibility.
    // Chúng ta sẽ gọi hàm gốc với các tham số gốc của Express và để lỗi tự xảy ra,
    // sau đó bắt lỗi bằng .catch(next)

    // Sử dụng Promise.resolve().catch(next) là mô hình tiêu chuẩn để bắt lỗi async.
    Promise.resolve(fn(req, res, next)).catch(next);
  };
