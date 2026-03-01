## 🚀 BẢN MÔ TẢ CHI TIẾT GỬI AI (PROMPT) — Photography Marketplace (React + Tailwind)

Bạn là **chuyên gia React** và **UI/UX Designer**. Hãy xây dựng Website **Photography Marketplace** dựa trên codebase hiện có (Vite + React + TypeScript). Mục tiêu là tạo UI đẹp, tối giản, responsive mobile-first và có logic mô phỏng 3 role: **CUSTOMER / PHOTOGRAPHER / ADMIN**.

### 0) Bối cảnh dự án hiện tại (để AI hiểu đúng repo)
- Repo hiện là **Vite + React + TypeScript**.
- Chưa có Tailwind / Router / UI libs. Bạn cần **tự cài đặt** và cấu hình.
- Hãy ưu tiên code **TypeScript** (`.ts/.tsx`). Nếu bạn bắt buộc dùng `.jsx` theo yêu cầu component, hãy giải thích và/hoặc tạo `.tsx` tương đương (ưu tiên `.tsx`).

### 1) UI Style (Phong cách giao diện)
- **Phong cách**: Minimalism, sạch, nhiều khoảng trắng, typography rõ ràng.
- **Palette**:
  - Nền: `white`
  - Text/blocks: `slate-900`
  - Màu nhấn Primary: `indigo-600` (hover `indigo-700`)
  - Border: `slate-200`, subtle shadow.
- **Typography**: heading đậm, body dễ đọc; spacing thoáng (8px scale).
- **Icons**: dùng `lucide-react`.
- **Motion**: dùng `framer-motion` (hover/transition, modal, page transition nhẹ).
- **UI components**: nếu có thể, dùng `shadcn/ui` (Dialog/Popover/Dropdown/Menu/Table/Badge/Button/Input).
- **Responsive**: 100% mobile-first; đảm bảo gallery và booking flow dùng tốt trên điện thoại.

### 2) Tech stack cần cài đặt & cấu hình (AI phải làm ngay trong repo)
Hãy cài và cấu hình tối thiểu:
- **Tailwind CSS** + PostCSS + Autoprefixer (chuẩn Vite).
- **React Router** (`react-router-dom`) cho routing theo role.
- `lucide-react`, `framer-motion`.
- (Optional, nếu làm kịp) `@radix-ui/*` qua `shadcn/ui`.

Yêu cầu thêm:
- Tạo layout + routing rõ ràng, tránh code “all-in-one”.
- Không cần backend thật: dùng **mock data + state** (Context/Zustand/Redux đều được; ưu tiên đơn giản).
- Có cơ chế “đổi role” để demo nhanh (ví dụ: role switcher ở Navbar hoặc query param).

### 3) Cấu trúc Role & Tính năng (Logic/Pages)
Thiết kế theo 3 role, mỗi role có các trang và luồng sau.

#### A) Role: CUSTOMER (Khách hàng)

**(1) Home page**
- Hero section với ảnh lớn (cover) + tagline.
- Thanh search để tìm thợ ảnh (theo tên, location, style).
- CTA: “Khám phá thợ ảnh”, “Xem bộ sưu tập”.

**(2) Gallery / Explore**
- Layout **Masonry Grid** hiển thị ảnh đẹp.
- Mỗi ảnh dùng `PhotoCard`:
  - Hover: zoom nhẹ + overlay hiện **tên thợ** + **giá từ** + rating/tags.
  - Click mở detail (có thể là modal hoặc trang `/photographers/:id`).

**(3) Booking Flow**
- Mở `BookingModal` từ profile thợ hoặc từ card.
- Bước chọn ngày:
  - DatePicker tùy chỉnh (calendar).
  - Các ngày thợ đã bận: **disabled** + mờ (opacity).
- Bước chọn gói dịch vụ:
  - `Standard`, `Premium`, `Deluxe` (hiển thị giá + mô tả).
- Thanh toán mô phỏng:
  - Bấm “Đặt lịch” -> popup thanh toán cọc 30%.
  - UI thẻ ngân hàng (card number/expiry/cvv) chỉ cần validate đơn giản.
  - Sau khi “thanh toán thành công” -> lưu đơn hàng với status **PAID_DEPOSIT** (Deposited).

#### B) Role: PHOTOGRAPHER (Nhiếp ảnh gia)

**(1) Portfolio Page (cá nhân hóa)**
- Header: avatar + bio + tags + địa điểm + “Giá từ”.
- Grid album/works.
- Có nút **“Upload Album”** (mock upload).

**(2) Dashboard quản lý**
- **Lịch trình (Calendar View)**:
  - Xem danh sách booking theo ngày.
  - Filter theo status.
- **Giao ảnh (Delivery/Upload)**:
  - Upload ảnh sản phẩm cho booking.
  - Logic preview/lock:
    - Ảnh upload lên sẽ hiển thị `WatermarkImage` nếu khách chưa trả đủ.
    - Khi status chưa hoàn tất: overlay `opacity-50` + chữ **PREVIEW**.
- **Ví tiền (Wallet)**:
  - Hiển thị tổng doanh thu.
  - Nút **“Rút tiền”** (mock withdraw + toast).

#### C) Role: ADMIN (Quản trị)

**(1) User Management**
- Danh sách Photographer và Customer.
- Photographer mới có trạng thái pending -> nút **“Duyệt” (Approve)**.
- Table UI (shadcn Table nếu có).

**(2) Orders/Transactions**
- Xem tất cả giao dịch/đơn hàng.
- Có xử lý tranh chấp:
  - Admin có thể set **Refund** (mock).
  - Log lịch sử trạng thái (timeline đơn giản).

### 4) Components bắt buộc phải gen (Cấp độ Code)
Hãy viết các component sau theo Tailwind + best practices.

#### 4.1 `Layout` (Navbar + Footer)
- Navbar thay đổi theo **role**:
  - CUSTOMER: Home, Gallery, My Bookings
  - PHOTOGRAPHER: Portfolio, Dashboard, Wallet
  - ADMIN: Users, Orders
- Có role switcher để demo (không cần auth thật).
- Footer tối giản.

#### 4.2 `PhotoCard`
- Hiển thị ảnh + hover zoom (framer-motion hoặc CSS).
- Tag giá + tên thợ.
- Optional: badge “Top rated”.

#### 4.3 `BookingModal`
- Modal multi-step:
  - Step 1: chọn ngày (calendar)
  - Step 2: chọn gói (Standard/Premium/Deluxe)
  - Step 3: thanh toán cọc 30%
- Button states rõ ràng: disabled/loading/success.
- Sau success: cập nhật state booking.

#### 4.4 `WatermarkImage`
- Nhận props: `src`, `isLocked`, `label="PREVIEW"`…
- Nếu `isLocked=true`: overlay opacity + text watermark + optionally blur nhẹ.
- Nếu `isLocked=false`: show ảnh bình thường.

### 5) Routing đề xuất (AI có thể điều chỉnh nhưng phải rõ ràng)
- `/` Home
- `/gallery` Explore
- `/photographers/:id` Photographer public profile + booking
- `/customer/bookings` danh sách booking của customer
- `/photographer/portfolio`
- `/photographer/dashboard`
- `/photographer/wallet`
- `/admin/users`
- `/admin/orders`

### 6) Data model & State mock (AI phải tạo `src/types.ts` hoặc tương đương)
Hãy tạo types + mock database dạng in-memory, và state manager (Context hoặc store).

Yêu cầu mô phỏng cấu trúc đơn hàng:

```ts
// Cấu trúc đơn hàng tiêu chuẩn (mock)
export const booking = {
  id: "BK001",
  customerName: "Nguyễn Văn A",
  photographerName: "Studio X",
  date: "2024-05-20",
  totalPrice: 2000000,
  deposit: 600000, // 30% cọc
  status: "PAID_DEPOSIT", // PENDING | PAID_DEPOSIT | DELIVERED_PREVIEW | COMPLETED
  images: [{ url: "link_anh_1", isLocked: true }],
} as const
```

Ngoài ra cần:
- Photographer có `busyDates: string[]` để disable trên calendar.
- Admin approve photographer: `photographer.status = "PENDING" | "APPROVED"`.
- Transaction log đơn giản cho orders.

### 7) UI/UX yêu cầu chi tiết (AI bắt buộc tuân thủ)
- **Mọi interaction phải có feedback**: hover/focus states, loading, empty state.
- Form validation tối thiểu (required, format).
- Modal/Popover có trap focus (nếu dùng shadcn/radix).
- Masonry grid phải responsive (2 cột mobile, 3–4 cột desktop tùy width).
- Không dùng màu quá sặc sỡ; đúng minimalism.

### 8) Tiêu chuẩn output (AI phải deliver)
- Tạo cấu trúc thư mục rõ ràng: `pages/`, `components/`, `data/` (mock), `types.ts`, `store/` (nếu có).
- Code chạy được với `npm run dev`.
- Tối thiểu có dữ liệu demo để nhìn thấy:
  - Gallery có ảnh
  - Booking flow tạo được booking và đổi status
  - Photographer dashboard thấy booking theo ngày
  - Admin xem users/orders + approve/refund (mock)

---

## 💡 Bước thực hiện (để bạn dùng tiếp khi chat AI)

### Bước 1
Gửi toàn bộ prompt này cho AI và yêu cầu:
- “Hãy gen cấu trúc thư mục + routing + các page cơ bản + mock data/state theo 3 role, cài Tailwind/lucide/framer-motion/router và (nếu được) shadcn/ui.”

### Bước 2
Sau khi AI scaffold xong, yêu cầu:
> “Viết cho tôi Component **BookingCalendar** bằng Tailwind CSS, cho phép chọn ngày và hiển thị các ngày đã đầy (disabled), hỗ trợ month navigation, và trả về ngày đã chọn cho parent.”

### Bước 3
Tiếp tục yêu cầu:
> “Viết logic xử lý **thanh toán giả lập**: khi user nhập thẻ và bấm pay, giả lập delay 1–2s, nếu thành công thì cập nhật booking `status` từ `PENDING` -> `PAID_DEPOSIT`, lưu `deposit = totalPrice * 0.3`, và render UI trạng thái mới ngay.”

