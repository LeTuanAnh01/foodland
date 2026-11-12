# Foodland Frontend v0.5.4 — Làm rõ cách hiển thị số lượng

- Bỏ hiển thị dạng `đã hiển thị / tổng số` trong chân các bảng; chỉ hiển thị số mục đang có.
- Bỏ `tồn hiện tại / ngưỡng cảnh báo` ở mục Tồn kho cần chú ý trong file wireframe tham khảo; hiển thị `Tồn: N đơn vị`.
- Trong ứng dụng React, bảng Kho đã có riêng cột **Số tồn** và **Cảnh báo dưới**; tiếp tục giữ hai cột có nhãn để người dùng không nhầm ngưỡng tối thiểu với tổng kho.
- Không thay đổi ngưỡng cảnh báo, trạng thái, nghiệp vụ xác nhận nhập/xuất, lưu trữ LocalStorage hoặc các dấu `/` thuộc đơn vị tính/quy cách hàng hóa (vd. hộp/thùng).

## Kiểm tra
- Kiểm tra không còn các cụm số lượng dạng `X/Y` trong UI source React và khối cảnh báo tồn ở wireframe.
- Chạy `npm run test:inventory` để kiểm thử nghiệp vụ.
