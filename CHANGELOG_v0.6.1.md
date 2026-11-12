# Foodland Frontend v0.6.1 – Tiến độ nhập/xuất theo chứng từ

Nâng cấp trực tiếp từ v0.6.0. **Không thay đổi cấu trúc LocalStorage, số tồn hay cơ chế xác nhận kho.**

## Tính năng

- **Danh sách Chứng từ Mua/Bán:** thêm cột **TRẠNG THÁI KHO** độc lập với **TRẠNG THÁI CHỨNG TỪ**.
  - Mua: `Chưa nhập` / `Nhập một phần` / `Đã nhập đủ`.
  - Bán: `Chưa xuất` / `Xuất một phần` / `Đã xuất đủ`.
  - Hiển thị thêm số phiếu đang chờ xác nhận; chỉ những phiếu đã xác nhận mới được tính là đã nhập/xuất.
- **Ngoài bảng danh sách:** thanh tổng hợp số chứng từ ở từng trạng thái, tự tính lại khi tìm kiếm hoặc khi dữ liệu kho thay đổi.
- **Chi tiết chứng từ:** trạng thái kho nổi bật bên cạnh trạng thái duyệt; bảng tiến độ thể hiện rõ số cần nhập/xuất, đã xác nhận kho, còn phải nhập/xuất, số trên phiếu nháp và số còn có thể lập phiếu.
- **Xuất CSV chứng từ:** thêm trường `Trạng thái kho`.
- **Nghiệp vụ:** tình trạng nhập/xuất tự động tính từ các phiếu kho *đã xác nhận* của từng chứng từ, riêng từng mặt hàng; không cộng phiếu nháp, không cộng phiếu của chứng từ khác.

Lưu ý: `Đã xuất đủ` có nghĩa là hoàn tất **tiến độ xuất kho**, không có nghĩa là khách đã thanh toán hay giao dịch đã hoàn tất về mặt kế toán.

## Test nhanh

1. `npm install && npm run dev`; vào trang **Bán hàng → Chứng từ bán**.
2. Chọn chứng từ đã xác nhận, chọn **Tạo phiếu xuất kho**, chỉ xuất một phần mặt hàng rồi lưu.
3. Quay lại danh sách: có nhãn `Chưa xuất` và dòng `1 phiếu chờ xác nhận`.
4. Vào **Kho → Xuất kho**, xác nhận phiếu (nếu đủ tồn). Trở lại trang Bán hàng: chứng từ chuyển `Xuất một phần`.
5. Tạo và xác nhận phiếu xuất tiếp cho lượng còn lại. Chỉ khi *mọi mặt hàng* đã xuất đủ, chứng từ mới hiện `Đã xuất đủ`.
6. Thử Mua hàng tương tự để thấy `Nhập một phần` / `Đã nhập đủ`.
7. Bấm **Xuất CSV** ở tab chứng từ, kiểm tra cột `Trạng thái kho`.

## Kiểm tra logic

```bash
npm run test:workflow
npm run test:inventory
npm run typecheck
npm run build
```

`npm run typecheck` và `npm run build` cần cài dependencies trước. Dữ liệu vẫn là prototype lưu LocalStorage, không phải dữ liệu kế toán thực tế.
