# Foodland Frontend v0.6.5 — Phân trang mọi bảng

- Mỗi bảng, kể cả bảng trong modal chi tiết, bảng trong form và bảng báo cáo, chỉ hiển thị tối đa 10 dòng mỗi trang. Có nút Trước/Sau, số trang, tổng dòng.
- Các bảng dữ liệu được lọc/sắp xếp rồi mới phân trang. Thay đổi tìm kiếm/bộ lọc đưa về trang đầu.
- Các form nhiều mặt hàng giữ đủ dữ liệu khi chuyển trang, thêm dòng sẽ tự chuyển tới trang cuối. Tính toán tổng tiền, kiểm tra hợp lệ, kiểm tra tồn kho vẫn xét TOÀN BỘ phiếu.
- Xuất CSV giữ TOÀN BỘ bản ghi sau lọc, không giới hạn 10 dòng của trang đang xem. Thống kê và dấu nhắc luôn tính trên toàn bộ dữ liệu.
- `PAGE_SIZE = 10` dùng chung. Khi làm Backend, dùng page/pageSize và totalItems trả từ API.
- Không đổi LocalStorage hoặc nghiệp vụ mua/bán/kho.
