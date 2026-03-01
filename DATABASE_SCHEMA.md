# Database Schema Design cho Photography Marketplace

Dưới đây là thiết kế Relational Database (SQL - PostgreSQL/MySQL) cho hệ thống PhotoMarket với luồng thanh toán Escrow, Tranh chấp (Dispute) và Phân quyền (Auth).

Tài liệu này dùng cú pháp DBML (Database Markup Language), bạn có thể copy dán vào [dbdiagram.io](https://dbdiagram.io) để xem sơ đồ trực quan (ERD).

```dbml
// ==========================================
// 1. NGƯỜI DÙNG & PHÂN QUYỀN (USERS & ROLES)
// ==========================================

Enum UserRole {
  USER
  PHOTOGRAPHER
  ADMIN
}

Table users {
  id varchar [pk, note: 'Khóa chính, ví dụ: uuid']
  email varchar [unique, not null]
  password_hash varchar [not null]
  name varchar [not null]
  role UserRole [default: 'USER']
  avatar_url text
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}

// Bảng thông tin mở rộng dành riêng cho Photographer
Enum PhotographerStatus {
  PENDING
  APPROVED
  REJECTED
}

Table photographer_profiles {
  user_id varchar [pk, ref: - users.id]
  location varchar
  bio text
  cover_url text
  starting_price decimal [not null, default: 0]
  rating float [default: 0]
  review_count int [default: 0]
  status PhotographerStatus [default: 'PENDING']
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}

// Bảng chứa các Tag phong cách của Photographer (nhiều nhiều)
Table tags {
  id int [pk, increment]
  name varchar [unique, note: 'Wedding, Portrait, Landscape...']
}

Table photographer_tags {
  photographer_id varchar [ref: > photographer_profiles.user_id]
  tag_id int [ref: > tags.id]
  
  indexes {
    (photographer_id, tag_id) [pk]
  }
}

// Lịch bận của Photographer
Table busy_dates {
  id int [pk, increment]
  photographer_id varchar [ref: > photographer_profiles.user_id]
  date date [not null]
  
  indexes {
    (photographer_id, date) [unique]
  }
}

// Ảnh Portfolio của Photographer
Table portfolios {
  id varchar [pk]
  photographer_id varchar [ref: > photographer_profiles.user_id]
  url text [not null]
  title varchar
  order_index int [default: 0]
}


// ==========================================
// 2. NGHIỆP VỤ ĐẶT LỊCH (BOOKINGS)
// ==========================================

Enum BookingStatus {
  PENDING    // chờ photographer nhận
  CONFIRMED  // photographer đã nhận
  DELIVERED  // đã gửi ảnh preview
  COMPLETED  // khách hài lòng / release
  DISPUTED   // khách khiếu nại
  REFUNDED   // admin hoàn tiền
  CANCELLED  // hủy trước khi confirm
}

Enum PackageTier {
  STANDARD
  PREMIUM
  DELUXE
}

Table bookings {
  id varchar [pk]
  customer_id varchar [not null, ref: > users.id]
  photographer_id varchar [not null, ref: > photographer_profiles.user_id]
  date date [not null]
  package_tier PackageTier [not null]
  total_price decimal [not null]
  status BookingStatus [default: 'PENDING']
  dispute_reason text
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}

// Ảnh Photographer giao cho Booking (Watermark/Gốc)
Table booking_images {
  id varchar [pk]
  booking_id varchar [ref: > bookings.id]
  url text [not null]
  is_locked boolean [default: true, note: 'True: hiện watermark, False: mở khóa gốc']
  created_at timestamp [default: `now()`]
}


// ==========================================
// 3. THANH TOÁN & VÍ TIỀN (PAYMENTS & WALLET)
// ==========================================

// Bảng quản lý giao dịch thanh toán cụ thể cho 1 booking (Escrow)
Enum PaymentStatus {
  HOLDING   // Đang giữ trên platform
  RELEASED  // Đã chuyển cho thợ
  REFUNDED  // Đã hoàn lại cho khách
}

Table payments {
  id varchar [pk]
  booking_id varchar [unique, not null, ref: - bookings.id]
  amount decimal [not null, note: 'Số tiền khách đã trả (Full)']
  platform_fee decimal [not null, note: 'Hoa hồng nền tảng (10%)']
  net_to_photographer decimal [not null, note: 'amount - platform_fee']
  status PaymentStatus [default: 'HOLDING']
  paid_at timestamp [default: `now()`]
  released_at timestamp
}

// Lịch sử dòng tiền (Transaction History) rải rác
Enum TransactionType {
  PAYMENT       // Khách nạp/trả tiền booking
  RELEASE       // Nhả tiền từ hệ thống vào ví thợ
  REFUND        // Trả tiền lại cho khách
  WITHDRAW      // Thợ rút tiền ra ngân hàng ngoài
  PLATFORM_FEE  // Doanh thu hệ thống ghi nhận
}

Table transactions {
  id varchar [pk]
  user_id varchar [ref: > users.id, note: 'Ví của ai bị ảnh hưởng']
  booking_id varchar [null, ref: > bookings.id]
  type TransactionType [not null]
  amount decimal [not null, note: 'Giá trị dương/âm tùy type']
  note text
  created_at timestamp [default: `now()`]
}


// ==========================================
// 4. TRANH CHẤP & HỖ TRỢ (DISPUTES)
// ==========================================

Enum DisputeStatus {
  OPEN
  RESOLVED_REFUND
  RESOLVED_RELEASE
}

Table disputes {
  id varchar [pk]
  booking_id varchar [unique, not null, ref: - bookings.id]
  reason text [not null]
  status DisputeStatus [default: 'OPEN']
  admin_note text
  created_at timestamp [default: `now()`]
  resolved_at timestamp
  resolved_by varchar [ref: > users.id, note: 'Admin nào xử lý']
}
```

## Diễn giải kiến trúc:

1. **Relation Users - Photographers (`1:1`)**
   - Mọi thực thể đăng nhập đều nằm trong `users`. Dựa vào trường `role` phân ra quyền hạn.
   - Chỉ khi `role = 'PHOTOGRAPHER'` thì hệ thống mới tham chiếu thêm bảng `photographer_profiles`. Tránh trường hợp bảng Users quá phình to với các field chỉ dành cho nhiếp ảnh.

2. **Luồng giữ tiền Escrow (`bookings` `1:1` `payments`)**
   - Khi tạo record `bookings`, khách hàng thanh toán qua cổng điện tử, Record `payments` được tạo với `status = HOLDING`. Bảng này lưu trực tiếp các con số cố định như phí Platform và phí Net nhận được để sau này dễ dàng lập rmb / tính toán.

3. **Luồng dòng tiền / Ví (`transactions`)**
   - Đóng vai trò là Sổ cái (Ledger).
   - Số dư ví khả dụng của Photographer = Tổng (`amount`) nơi `type = RELEASE` TRỪ Đi (`type = WITHDRAW`).
   - Tổng Escrow đang giữ của thợ = Sum (`net_to_photographer`) trên bảng `payments` nơi `status = HOLDING`.

4. **Tranh chấp (Disputes)**
   - Cấu trúc `1:1` với Booking để đảm bảo một Đơn từ trạng thái bình thường chỉ có thể vào quy trình Resolve cao nhất là 1 lần. Lưu lại `admin_note` và mã định danh admin `resolved_by`.

5. **Hình ảnh giao (`booking_images`)**
   - Khi Photographer nhấn *Giao file*, hệ thống lưu URL ảnh vào đây. Cột `is_locked` quan trọng: Ban đầu mặc định `True` (Tức Frontend tự phủ mờ Watermark bên trên giao diện). Khi luồng Payment thành `RELEASE`, tự động Update `is_locked = False`, từ nay Khách xem sẽ được load URL gốc nét.
