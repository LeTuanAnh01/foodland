# Foodland Frontend v0.6.4 – Bộ lọc thời gian

Nâng cấp từ v0.6.3, không thay đổi nghiệp vụ và không thay đổi cấu trúc lưu trữ LocalStorage.

## Thay đổi
- Bộ lọc thời gian tái sử dụng trong `src/components/shared/DateFilter.tsx`.
- Chọn ngày, khoảng ngày, tuần ISO (Thứ Hai đến Chủ nhật), tháng hoặc năm.
- Áp dụng theo **ngày chứng từ** tại tab Chứng từ, **ngày hóa đơn** tại tab Hóa đơn, **ngày phiếu** tại Nhập/Xuất kho và Kiểm kê.
- Kết hợp với tìm kiếm và trạng thái, nút xóa lọc.
- Thống kê trạng thái toàn hệ thống và số việc đang chờ không bị thay đổi bởi bộ lọc.
- Xuất CSV từ bảng Chứng từ/Hóa đơn/Kho lấy dữ liệu sau khi đã lọc.

## Test thủ công
1. Vào Mua hàng hoặc Bán hàng → Chứng từ → Bộ lọc ngày; chọn từng chế độ.
2. Lọc khoảng ngày, thử chỉ nhập Từ ngày hoặc Đến ngày.
3. Lọc Tuần 42/2026 (12/10/2026 – 18/10/2026) để kiểm tra tuần.
4. Đổi sang Hóa đơn rồi lọc theo ngày hóa đơn; kiểm tra thống kê toàn bộ chứng từ không đổi.
5. Vào Kho → Nhập kho/Xuất kho/Kiểm kê, thử lọc theo tháng; kiểm tra trạng thái chờ xử lý vẫn đủ.
6. Xuất CSV sau khi lọc và kiểm tra số dòng.

Không có Backend; dữ liệu vẫn lưu theo LocalStorage ở mỗi trình duyệt.
