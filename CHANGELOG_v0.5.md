# Foodland Frontend v0.5 – Nâng cấp phiếu kho

## Mới
- Mỗi phiếu nhập/xuất kho lưu nhiều mặt hàng theo `lines: [{ productId, quantity }]`.
- Form thêm/xóa dòng hàng, chọn mặt hàng, kiểm tra trùng và số lượng hợp lệ.
- Chỉnh sửa, xóa phiếu **bản nháp**; trạng thái bản nháp/đã xác nhận.
- Xác nhận phiếu sẽ **khóa** sửa/xóa, **KHÔNG** cập nhật số tồn kho.
- Danh sách tìm theo tất cả mặt hàng, xem chi tiết từng dòng; CSV xuất một dòng/mặt hàng.
- Dashboard hiển thị phiếu nhiều mặt hàng mà không cộng sai các đơn vị đo khác nhau.
- Tự chuyển dữ liệu phiếu v0.4 sang v0.5; giữ key localStorage và tạo backup v0.4 khi có dữ liệu cũ.

## Giữ nguyên
- Hàng hóa, đối tác, kho tổng quan và điều chỉnh số tồn mẫu, kiểm kê.
- Mua/Bán, hóa đơn liên kết, báo cáo, sidebar, Dashboard và bản HTML tham chiếu.
- Chưa có API/backend/DB, chưa xử lý kế toán hay tự động biến động kho.

## Cài đặt
```sh
npm install
npm run typecheck
npm run build
npm run dev
```

Nếu nâng từ v0.4 trên **cùng origin**, vui lòng sao lưu LocalStorage trước khi thay source nếu có dữ liệu quan trọng. Dữ liệu giả lập chỉ nằm ở trình duyệt.
