# 💻 THE UNRAVELLER - FRONTEND INTERFACE

Giao diện người dùng cho dự án **The Unraveller**, được thiết kế theo phong cách **Hacker/Cyberpunk** chuyên nghiệp để tạo ra trải nghiệm nhập vai tốt nhất cho việc học tiếng Anh.

## 🛠 Công Nghệ Sử Dụng (Tech Stack)

- **Library:** React + TypeScript
- **Styling:** TailwindCSS v3 (Cyberpunk custom theme)
- **Icons:** Lucide-React
- **Animations:** Framer Motion
- **Router:** React Router v6
- **Build Tool:** Vite

## 🎨 Phong Cách Thiết Kế (Design System)

- **Màu sắc chính:** `#0a0a0a` (Spy-Black), `#00ff41` (Spy-Green), `#ff0000` (Spy-Red), `#00d8ff` (Spy-Blue).
- **Phông chữ:** `JetBrains Mono` (Hacker Terminal style).
- **HUD Interface:** Các thanh HUD, hiệu ứng Glitch và "Thanh Nghi Ngờ" (Suspicion Meter) tương tác mượt mà.

## 🏗 Cấu Trúc Thư Mục (Folder Structure)

Dự án được tổ chức theo chuẩn **Component-based architecture**:

1.  **src/pages:** Chứa các màn hình chính.
    - `/Home`: Landing page giới thiệu game.
    - `/Auth`: Đăng nhập/Đăng ký phong cách console.
    - `/Missions`: Bản đồ chọn nhiệm vụ (Mission Control).
    - `/Game`: Giao diện chat Cyberpunk và thanh độ nghi ngờ.
    - `/Result`: Tổng kết kết quả và phân tích lỗi tiếng Anh.
    - `/About`: Thông tin dự án và đội ngũ phát triển.
2.  **src/components:** Chứa các thành phần nhỏ để tái sử dụng.
    - `common/`: Button, Input, Container.
    - `game/`: SuspicionMeter, ChatHistory, AgentConsole.

## 🚀 Hướng Dẫn Cài Đặt (Installation)

1.  **Yêu cầu:** Đã cài đặt [Node.js](https://nodejs.org/).
2.  **Di chuyển vào thư mục:** `cd FrontEnd`
3.  **Cài đặt thư viện:** `npm install`
4.  **Chạy dự án:** `npm run dev`
5.  **Mở trình duyệt:** Truy cập `http://localhost:5173`.

## ✨ Các Tính Năng Nổi Bật

- **Giao diện Chat:** Giống như Messenger/Telegram nhưng mang phong cách điệp viên.
- **Thanh Nghi Ngờ:** Tương tác thời gian thực, thay đổi trạng thái và màu sắc theo mức độ an toàn.
- **Phản hồi ngôn ngữ:** Màn hình Result phân tích các lỗi sai và đưa ra gợi ý học tập.
- **Team Info:** Màn hình About chi tiết cho cả 5 thành viên trong nhóm.
