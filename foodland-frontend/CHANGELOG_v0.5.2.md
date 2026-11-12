# Foodland Frontend v0.5.2 – Xác nhận phiếu cập nhật tồn kho

- **Nhập kho:** Xác nhận phiếu nháp sẽ cộng số tồn của từng dòng hàng.
- **Xuất kho:** Hiển thị tồn hiện tại, số xuất, tồn dự kiến và thông báo thiếu ngay khi nhập; phiếu thiếu vẫn được lưu nháp, nhưng không xác nhận được.
- **Xác nhận:** Mở modal so sánh từng mặt hàng trước/sau; kiểm tra đủ tồn lại ở thời điểm bấm, áp dụng toàn bộ dòng hàng cùng lúc hoặc không thay đổi gì.
- **Chống ghi trùng:** Phiếu đã xác nhận không được xác nhận lần hai, sửa hoặc xóa; các phiếu mới ghi dấu `stockApplied: true`.
- **Danh sách:** Thêm cột tình trạng kho cho phiếu xuất, tự tính từ tồn mới nhất.
- **Tương thích dữ liệu:** Giữ nguyên key localStorage; phiếu v0.4 được migrate như v0.5.1; phiếu đã xác nhận ở phiên bản cũ không cộng/trừ tồn hồi tố.
- **Giới hạn:** Mô phỏng trên một trình duyệt; không đảm bảo đồng thời giữa nhiều máy/tab. Cần transaction PostgreSQL khi tích hợp Backend; chứng từ mua/bán chưa tự sinh phiếu kho.
