# Foodland Frontend v0.7.0 — Báo cáo động

## Hoàn thành

1. Bỏ toàn bộ số giả lập cố định trên Dashboard: KPI, biểu đồ và Top mặt hàng đều lấy từ store.
2. Thống kê giá trị chứng từ **đã xác nhận** cho Mua/Bán; số lượng từng SKU trong Top lấy từ chứng từ bán đã xác nhận.
3. Dashboard lọc ngày/tuần/tháng/năm cho KPI và Top; biểu đồ chọn năm riêng để xem đủ 12 tháng; cảnh báo tồn/phiếu chờ luôn là hiện tại.
4. Báo cáo chứng từ với bộ lọc ngày, loại, trạng thái và tìm kiếm; giá trị tổng chỉ của kết quả đã lọc. Mặc định chỉ hiển thị chứng từ xác nhận; khi chọn bản nháp ghi rõ có tính giá trị nháp.
5. Báo cáo kho: tồn hiện tại, ngưỡng, phiếu nhập/xuất đã xác nhận trong kỳ, số lượng nhập/xuất theo từng mã hàng, cảnh báo hết/dưới ngưỡng.
6. CSV xuất toàn bộ kết quả lọc; UI phân trang 10 dòng như v0.6.5.
7. Không thay đổi type DB, localStorage key, hay logic xác nhận phiếu kho/hóa đơn.

## Ranh giới nghiệp vụ

- Không gọi giá trị chứng từ là doanh thu chính thức; chưa xác định VAT, chiết khấu, hàng trả lại, giá vốn, hạch toán hoặc công nợ.
- Không gọi báo cáo tồn hiện tại là tồn cuối kỳ lịch sử. Để tái dựng tồn đầu/cuối mỗi kỳ cần bổ sung chứng từ điều chỉnh, số dư đầu kỳ và nhật ký bất biến trong Backend.
- Các phiếu được xác nhận từ phiên bản cũ nhưng chưa tác động tồn (`stockApplied` rỗng) có thể khiến tổng nhập/xuất lịch sử không khớp chênh lệch tồn hiện tại. Báo cáo luôn diễn đạt tách bạch hai đại lượng.
- Dữ liệu ở từng trình duyệt vẫn độc lập.

## Kiểm thử

Chạy `npm run test:reports` để kiểm thử 8 trường hợp KPI, biểu đồ, phiếu nháp, lọc kỳ, top sản phẩm và nhập xuất. Các bộ kiểm thử cũ không thay đổi.
