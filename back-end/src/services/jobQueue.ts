import Post from "../models/Post"; // Import Post Model để mock DB write

/**
 * Interface cho dữ liệu cần được cập nhật
 */
interface PostCountJobData {
  postId: string;
  update: any; // Ví dụ: { $inc: { views_count: 1 } }
}

/**
 * Mô phỏng việc thêm Job vào Hàng đợi (Producer Logic).
 * Trong Task 5 thực tế, hàm này sẽ gọi: `postCountsQueue.add('update', jobData);`
 *
 * @param jobName - Tên của Job (Ví dụ: 'updatePostCounts')
 * @param data - Dữ liệu Job cần xử lý
 */
export const addJobToQueue = (
  jobName: string,
  data: PostCountJobData
): void => {
  // --- MOCK LOGIC (THAY THẾ BẰNG BullMQ HOẶC Kue) ---
  console.log(`[JOB QUEUE MOCK] Job added: ${jobName} for post ${data.postId}`);

  // Dùng setTimeout để mô phỏng sự bất đồng bộ của Worker Process
  setTimeout(() => {
    Post.updateOne({ _id: data.postId }, data.update)
      .exec()
      .then(() => {
        console.log(
          `[JOB QUEUE MOCK] Worker executed update for ${data.postId}`
        );
      })
      .catch((err) => {
        console.error(
          `[JOB QUEUE MOCK] Worker failed for ${data.postId}:`,
          err
        );
        // Logic retry hoặc DLQ (Dead Letter Queue) sẽ được xử lý ở đây
      });
  }, 50); // Mô phỏng độ trễ vài mili giây của Worker
  // ---------------------------------------------------
};
