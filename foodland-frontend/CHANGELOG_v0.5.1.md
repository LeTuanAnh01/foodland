# Foodland Frontend v0.5.1 – Cải thiện bảng mặt hàng

## Thay đổi giao diện

- `StockMovementLinesEditor.tsx`: thay các khung mặt hàng xếp theo chiều dọc thành một bảng nhập liệu gồm STT, mặt hàng, mã hàng, đơn vị, số lượng và thao tác xóa.
- `StockMovementsTable.tsx`: modal chi tiết phiếu chuyển từ các dòng nhãn/giá trị xen kẽ sang bảng có tiêu đề cột thống nhất; thông tin chung và ghi chú tách riêng.
- Bảng hỗ trợ cuộn ngang trên màn hình hẹp; vẫn có nút thêm/xóa dòng và kiểm tra trùng mặt hàng như v0.5.

## Giữ nguyên

- Chức năng thêm, sửa, xóa, xác nhận phiếu; trạng thái và kiểm tra dữ liệu.
- Dữ liệu `stockMovements`, localStorage, migration, Dashboard, nhập/xuất CSV.
- Không tự động cộng/trừ tồn kho sau khi tạo hoặc xác nhận phiếu.

## Kiểm tra

- Đã kiểm tra cú pháp TypeScript/TSX và đường dẫn import tương đối/alias của 71 file: không phát hiện lỗi.
- Chưa kiểm chứng đầy đủ `npm run build` trong môi trường đóng gói vì thiếu `node_modules`; chạy `npm install && npm run typecheck && npm run build` trên máy sử dụng.
