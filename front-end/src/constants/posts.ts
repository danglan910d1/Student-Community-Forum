export interface PostTag {
  label: string;
}

export interface PostItemData {
  id: number;
  title: string;
  description?: string;
  author: string;
  views: number;
  commentCount: number;
  isResolved: boolean;
  createdAt: string; // Định dạng ISO 8601 để dễ sắp xếp
  tags: PostTag[];
}

export const POSTS_DATA: PostItemData[] = [
  {
    id: 1,
    title: "Làm thế nào để tối ưu hóa hiệu suất ứng dụng React Hooks?",
    description:
      "Trong bài viết này, chúng ta sẽ đi sâu vào việc phân tích các cơ chế re-render của React. Tôi sẽ chia sẻ các kỹ thuật thực tế như tối ưu memoization với useMemo, useCallback và cách cấu trúc lại Context API để tránh tình trạng render lan truyền. Đây là những kinh nghiệm xương máu giúp ứng dụng của bạn chạy mượt mà ngay cả với dữ liệu lớn.",
    author: "Jane Doe",
    views: 120,
    commentCount: 30,
    isResolved: true,
    createdAt: "2024-01-01T08:00:00Z",
    tags: [{ label: "React" }, { label: "Performance" }],
  },
  {
    id: 2,
    title: "Giới thiệu về mô hình ngôn ngữ lớn (LLM) và ứng dụng trong học tập",
    description:
      "Công nghệ AI đang thay đổi cách chúng ta tiếp cận tri thức. Bài viết phân tích chi tiết cách các mô hình như Gemini hay GPT xử lý ngôn ngữ tự nhiên. Bên cạnh đó, tôi cũng hướng dẫn các bạn sinh viên cách đặt câu lệnh (prompt engineering) sao cho hiệu quả để hỗ trợ việc giải bài tập và nghiên cứu tài liệu khoa học một cách chính xác.",
    author: "John Smith",
    views: 85,
    commentCount: 15,
    isResolved: false,
    createdAt: "2024-01-02T09:00:00Z",
    tags: [{ label: "AI" }, { label: "Tech" }],
  },
  {
    id: 3,
    title: "Kinh nghiệm tìm nhóm làm đồ án tốt nghiệp và phân chia công việc",
    description:
      "Việc chọn sai đồng đội có thể khiến đồ án của bạn trở thành ác mộng. Tôi muốn chia sẻ quy trình 5 bước để tìm kiếm những cộng sự có cùng mục tiêu. Nội dung bao gồm cách đánh giá kỹ năng của từng thành viên, lập bảng phân công nhiệm vụ (WBS) và sử dụng các công cụ quản lý dự án như Trello hay Jira để đảm bảo tiến độ.",
    author: "Alice",
    views: 12,
    commentCount: 8,
    isResolved: true,
    createdAt: "2024-01-03T10:00:00Z",
    tags: [{ label: "Đồ án" }, { label: "Soft Skills" }],
  },
  {
    id: 4,
    title: "Ghi chú hữu ích và phương pháp ôn thi hiệu quả cho kỳ thi cuối kỳ",
    description:
      "Kỳ thi sắp tới đang gây áp lực lớn? Đừng lo lắng, tôi đã tổng hợp bộ tài liệu ôn tập độc quyền cho các môn cơ sở ngành. Ngoài ra, bài viết còn giới thiệu phương pháp học tập Spaced Repetition (lặp lại ngắt quãng) giúp bạn ghi nhớ kiến thức lâu hơn mà không cần phải 'học vẹt' suốt cả đêm.",
    author: "Bob",
    views: 35,
    commentCount: 15,
    isResolved: false,
    createdAt: "2024-01-04T11:00:00Z",
    tags: [{ label: "Kinh nghiệm" }, { label: "Study Tips" }],
  },
  {
    id: 5,
    title: "Hướng dẫn sử dụng MongoDB cơ bản cho dự án Web Fullstack",
    description:
      "Nếu bạn đã quen với SQL, việc chuyển sang NoSQL như MongoDB có thể gây chút bối rối. Bài hướng dẫn này sẽ đi từ cách cài đặt, thiết kế Schema linh hoạt cho đến việc thực hiện các truy vấn CRUD phức tạp. Tôi cũng đính kèm một dự án mẫu nhỏ sử dụng Express.js để bạn có thể thực hành ngay lập tức.",
    author: "Charlie",
    views: 20,
    commentCount: 8,
    isResolved: true,
    createdAt: "2024-01-05T12:00:00Z",
    tags: [{ label: "MongoDB" }, { label: "Database" }],
  },
  {
    id: 6,
    title: "Lập trình game 2D đơn giản bằng Javascript và Canvas API",
    description:
      "Bạn không cần những engine đồ sộ như Unity để tạo ra một trò chơi hay. Chỉ với Javascript thuần và thẻ Canvas trong HTML5, chúng ta sẽ cùng nhau xây dựng một tựa game platformer cơ bản. Bài viết giải thích về vòng lặp game (game loop), xử lý va chạm và cách tạo ra các hiệu ứng hình ảnh chuyển động mượt mà.",
    author: "David",
    views: 18,
    commentCount: 5,
    isResolved: false,
    createdAt: "2024-01-06T13:00:00Z",
    tags: [{ label: "Javascript" }, { label: "Game Dev" }],
  },
  {
    id: 7,
    title:
      "Tình hình phát triển AI và ảnh hưởng thực tế đến thị trường việc làm sinh viên",
    description:
      "AI có thực sự thay thế lập trình viên? Chúng ta sẽ cùng phân tích các báo cáo mới nhất về thị trường lao động năm 2024. Bài viết đưa ra góc nhìn khách quan về những kỹ năng mới mà sinh viên cần trang bị để không bị tụt hậu, đồng thời chỉ ra những cơ hội nghề nghiệp mới đang mở ra nhờ sự bùng nổ của trí tuệ nhân tạo.",
    author: "Eve",
    views: 50,
    commentCount: 25,
    isResolved: true,
    createdAt: "2024-01-07T14:00:00Z",
    tags: [{ label: "AI" }, { label: "Career" }],
  },
  {
    id: 8,
    title:
      "Chia sẻ chi tiết kinh nghiệm phỏng vấn thực tập sinh tại FPT Software",
    description:
      "Vừa qua tôi đã trải qua 3 vòng phỏng vấn tại FPT và muốn chia sẻ lại toàn bộ quy trình cho các bạn. Từ cách chuẩn bị bài test thuật toán, các câu hỏi về tư duy logic cho đến cách trả lời phỏng vấn hành vi (behavioral questions). Đặc biệt là danh sách những lỗi sai thường gặp khiến ứng viên bị loại đáng tiếc.",
    author: "Frank",
    views: 40,
    commentCount: 18,
    isResolved: false,
    createdAt: "2024-01-08T15:00:00Z",
    tags: [{ label: "Kinh nghiệm" }, { label: "Internship" }],
  },
  {
    id: 9,
    title:
      "Cách viết CV chuyên nghiệp cho sinh viên IT chưa có kinh nghiệm thực tế",
    description:
      "Làm sao để CV nổi bật khi bạn chưa từng đi làm ở đâu? Tôi sẽ hướng dẫn cách bạn 'show' các dự án cá nhân trên GitHub, cách làm nổi bật điểm mạnh về tư duy lập trình và các chứng chỉ online. Bài viết cũng cung cấp các mẫu CV (Template) chuẩn ATS giúp bạn dễ dàng lọt qua vòng lọc hồ sơ của các công ty lớn.",
    author: "Grace",
    views: 60,
    commentCount: 30,
    isResolved: true,
    createdAt: "2024-01-09T16:00:00Z",
    tags: [{ label: "Kỹ năng" }, { label: "CV Tips" }],
  },
  {
    id: 10,
    title:
      "Giải đáp thắc mắc về lộ trình tự học Machine Learning cho người mới bắt đầu",
    description:
      "Machine Learning không khó như bạn nghĩ nếu có một lộ trình đúng. Bài viết này tổng hợp các khóa học miễn phí chất lượng cao từ Coursera, Udemy và các kênh Youtube uy tín. Tôi cũng giải đáp các thắc mắc về toán học cần thiết (đại số tuyến tính, xác suất thống kê) và cách bắt đầu với thư viện Scikit-Learn hay TensorFlow.",
    author: "Henry",
    views: 33,
    commentCount: 11,
    isResolved: false,
    createdAt: "2024-01-10T17:00:00Z",
    tags: [{ label: "Data Science" }, { label: "Học tập" }],
  },
];
