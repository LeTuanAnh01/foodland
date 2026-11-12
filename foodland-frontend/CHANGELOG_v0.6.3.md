# Foodland Frontend v0.6.3 — Giao diện không PageHeading

Kế thừa v0.6.2. Đã xóa toàn bộ khối PageHeading trên Dashboard, Hàng hóa, Kho, Mua/Bán, Đối tác, Báo cáo và Thiết lập; loại bỏ component và export thừa.

- Các nút **Thêm hàng hóa**, **Thêm đối tác** được chuyển vào góc phải của SectionCard; nút **Xuất CSV** vẫn hoạt động.
- Nút tạo chứng từ, tạo hóa đơn và phiếu kho vẫn ở SectionCard như trước.
- Badge **CHỈ MINH HỌA** ở Báo cáo được chuyển vào tiêu đề thẻ nội dung.
- Dashboard vào thẳng thẻ KPI, không còn thanh tiêu đề lớn hoặc ngày tháng tĩnh ở đầu.
- SectionCard cho phép header xuống hàng trên màn hình nhỏ.
- Không thay đổi model, store, dữ liệu LocalStorage, validation hoặc nghiệp vụ đã có.

Cách chạy: `npm install && npm run dev`.
Kiểm tra thêm: `npm run typecheck`, `npm run build`, `npm run test:workflow`, `npm run test:inventory`, `npm run test:attention`.
