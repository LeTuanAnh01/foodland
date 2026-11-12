# Foodland Frontend v0.6.0 — Liên kết chứng từ / Kho / Hóa đơn

## Luồng v0.6

1. Tại **Mua hàng** hoặc **Bán hàng** tạo chứng từ (bản nháp), có thể sửa hoặc xóa trước khi xác nhận.
2. Trong danh sách chứng từ, bấm **Xem** rồi **Xác nhận chứng từ**. Chỉ chứng từ đã xác nhận mới được lập phiếu kho liên kết.
3. Trong chi tiết, bấm **Tạo phiếu nhập/xuất kho**. Form lấy sẵn các mặt hàng **chưa lập phiếu**. Có thể giảm số lượng để giao/nhận từng đợt. Lưu sẽ tạo **phiếu kho nháp**, **không thay đổi tồn kho**.
4. Vào **Kho** tương ứng, kiểm tra hàng thực tế rồi xác nhận phiếu kho. Phiếu nhập cộng tồn, phiếu xuất trừ tồn nếu đủ; đã xác nhận không cập nhật thêm lần nữa.
5. Tại tab **Nhận hóa đơn / Hóa đơn bán hàng**, ghi nhận hóa đơn với chứng từ đã xác nhận, lưu nháp và **Xác nhận thông tin** trong bảng hóa đơn. Xác nhận hóa đơn **không** tác động chứng từ hoặc tồn kho.

## Điểm mới

- Chi tiết chứng từ: hàng hóa, tổng giá trị, tiến độ theo từng mặt hàng, phiếu kho liên kết, hóa đơn liên kết.
- Theo dõi riêng trạng thái **chứng từ**, **phiếu kho**, **hóa đơn**.
- Khóa không cho lập phiếu vượt số lượng trên chứng từ, tính cả phiếu nháp và phiếu đã xác nhận; được phép giao nhiều đợt.
- Phiếu kho từ chứng từ có mã chứng từ gốc; phiếu tạo thủ công tại Kho tiếp tục hoạt động.
- Xác nhận phiếu kho sử dụng kiểm tra tồn mới nhất và bảo đảm tính nguyên khối cho tất cả dòng hàng.
- Giữ LocalStorage key `foodland-react-prototype-v1`, chuyển hóa đơn cũ sang trạng thái `confirmed` khi đọc; giữ phiếu kho cũ.
- Không sử dụng cách ghi số lượng theo kiểu `đã nhập/tổng` gây nhầm lẫn.

## Giới hạn bản demo

- Hóa đơn chỉ là bản ghi liên kết nội bộ, **không** phát hành hóa đơn điện tử hoặc xử lý thuế.
- V0.6 cho phép **một hóa đơn cho mỗi chứng từ**; hóa đơn chia đợt, hóa đơn điều chỉnh và nghiệp vụ hoàn trả sẽ bổ sung sau khi xác nhận quy trình với kế toán.
- Không có thanh toán, công nợ, phân quyền, cơ chế điều chỉnh chứng từ sau xác nhận.
- Dữ liệu LocalStorage chỉ phục vụ demo một trình duyệt; các thao tác đồng thời phải được xử lý trong transaction của backend khi triển khai thật.
- Chưa tự suy diễn số tiền công nợ từ chứng từ/hóa đơn.

## Chạy & kiểm thử

```bash
npm install
npm run typecheck
npm run test:workflow
npm run test:inventory
npm run dev
```

**Dữ liệu demo để thử:** Mua hàng → Xem `NK00002` (bản nháp) → Xác nhận → Tạo phiếu nhập 20 gói bánh (giảm từ 50) → Lưu → xem Kho, xác nhận → quay lại chứng từ lập phiếu nhập 30 gói còn lại → Nhận hóa đơn & xác nhận thông tin. Bán hàng cũng thực hiện tương tự (kiểm tra đủ tồn trước khi xác nhận xuất).

**Lưu ý khi nâng cấp:** Sao lưu LocalStorage trong DevTools trước; dùng cùng origin `localhost:5173` để giữ dữ liệu đang có. Không bấm đặt lại dữ liệu mẫu.
