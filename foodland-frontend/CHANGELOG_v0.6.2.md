# Foodland Frontend v0.6.2 – Ưu tiên công việc còn tồn

## Thay đổi

1. **Thống kê toàn bộ**: "Tình trạng nhập/xuất kho" ở trang Mua/Bán luôn được tính từ tất cả chứng từ trong module, không phụ thuộc tìm kiếm hoặc bộ lọc.
2. **Bộ lọc chứng từ**: theo công việc cần xử lý, tiến độ kho, trạng thái xác nhận chứng từ, hóa đơn; có nút xóa lọc.
3. **Thứ tự mặc định**: chứng từ chưa duyệt / chưa nhập-xuất đủ ở trên, trong nhóm này chứng từ cũ ở trên để tránh bị quên. Có thể đổi thành Mới nhất/Cũ nhất.
4. **Bảng danh sách**: cột "Cần xử lý" cho biết lý do, tô nhẹ các dòng chưa hoàn tất. Tiến độ kho vẫn tính **chỉ từ phiếu đã xác nhận**.
5. **Dấu nhắc thao tác**: badge đếm ở menu Mua hàng, Bán hàng, Kho (bao gồm bản mobile), đồng thời có danh sách theo module khi bấm chuông trên Header.
6. **Tab Hóa đơn**: thông báo số hóa đơn nháp chờ xác nhận; có bộ lọc hóa đơn nháp/đã xác nhận.
7. **Tab Nhập/Xuất kho**: hiện số phiếu nháp, tự đưa phiếu nháp lên đầu và hỗ trợ lọc theo trạng thái.

## Cách hiểu "Cần xử lý"

Một chứng từ còn việc cần xử lý khi: chưa được xác nhận, chưa đủ hàng theo phiếu kho đã xác nhận, có phiếu kho nháp, chưa có hóa đơn liên kết hoặc hóa đơn còn nháp. **Một chứng từ chỉ được tính một lần** trong badge mua/bán, dù có nhiều vấn đề. Badge Kho đếm số **phiếu kho nháp** (không đếm các dòng mặt hàng). Số đếm menu phản ánh công việc của từng phân hệ và có thể cùng liên quan một giao dịch.

Thông tin hóa đơn ở Foodland chỉ là dữ liệu liên kết nội bộ; không phát hành hóa đơn điện tử thực.

## An toàn dữ liệu

Không đổi schema DB, khóa LocalStorage, nghiệp vụ xác nhận chứng từ, trừ/cộng tồn hoặc cấu trúc phiếu. Nên sao lưu LocalStorage trước khi chuyển phiên bản.

## Test

```bash
npm install
npm run typecheck
npm run test:workflow
npm run test:inventory
npm run test:attention
npm run build
npm run dev
```
