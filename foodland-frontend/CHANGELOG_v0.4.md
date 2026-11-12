# Foodland Frontend v0.4 – Khôi phục phiếu kho

## Chức năng được khôi phục

- **Kho → Nhập kho:** nút `Thêm phiếu nhập`, form ngày/mã phiếu/mặt hàng/số lượng/diễn giải, xem danh sách, tìm kiếm, xuất CSV và xem chi tiết.
- **Kho → Xuất kho:** thao tác tương tự cho phiếu xuất.
- **Kho → Kiểm kê:** tạo phiếu kiểm kê bản nháp và xem danh sách.
- **Dashboard:** mục Nhập – xuất kho gần đây lấy dữ liệu phiếu từ `useFoodland()` thay vì dữ liệu tĩnh.
- **Dữ liệu:** `stockMovements` và `stockChecks` được lưu localStorage cùng dữ liệu hiện có. Tự bổ sung 2 trường khi phát hiện dữ liệu v0.3 chưa có, giữ nguyên key lưu trữ.
- **TypeScript:** xóa `baseUrl` đã deprecated, giữ alias `@/*`.

## Giới hạn prototype

Việc tạo phiếu kho **không làm tăng/giảm tồn kho**, không tính công nợ, không tự phát sinh chứng từ mua bán hoặc bút toán. Phần nghiệp vụ này phải xác nhận với kế toán và thủ kho trước khi triển khai Backend.

## Cách thử

1. `npm install && npm run dev`
2. Vào **Kho → Nhập kho → Thêm phiếu nhập**, tạo phiếu và lưu.
3. Kiểm tra dòng vừa tạo trong danh sách; làm tương tự với Xuất kho và Kiểm kê.
4. Xem **Dashboard → Nhập – xuất kho gần đây**.
5. F5 và kiểm tra phiếu vẫn tồn tại, số tồn không tự thay đổi.

**Kiểm tra tự động đã thực hiện:** cú pháp TypeScript/TSX và import nội bộ, sinh mã PN/PX/KK, migration và persist localStorage. **Chưa thể thực hiện build Vite:** môi trường đóng gói không truy cập được npm registry.
