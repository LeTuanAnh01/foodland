# Foodland Frontend v0.9 – Report Center & Excel Export

Nâng cấp trực tiếp từ v0.8, giữ nguyên nghiệp vụ chứng từ, hóa đơn, tồn kho và khóa LocalStorage.

## Chức năng

- 34 mẫu báo cáo: Mua hàng (5), Bán hàng (6), Kho (8), Hóa đơn (4), Quản trị (5), Mẫu chờ duyệt (6).
- Giao diện thư viện lọc theo nhóm, tìm theo tên, phân biệt dữ liệu demo/mẫu chờ duyệt.
- Bộ lọc theo ngày, khoảng ngày, tuần ISO, tháng, năm cho các mẫu giao dịch.
- Báo cáo hiện trạng không áp dụng lọc ngày (không có nhật ký tồn kho lịch sử).
- Xem trước 10 dòng/trang; tìm trong báo cáo.
- Xuất Excel có đầu trang, thông tin kỳ, cảnh báo demo, kiểu ngày/tiền/số, header màu xanh, dòng xen kẽ, tổng giá trị theo công thức Excel (khi có cột tổng giá trị), cấu hình in A4 ngang, khung chữ ký; xuất toàn bộ bản ghi sau lọc.
- Giữ lựa chọn xuất CSV cho báo cáo có dữ liệu.
- Không sinh dữ liệu/công thức giả cho báo cáo công nợ, lãi/lỗ, giá vốn, tuổi nợ và thu chi.

## Phân định nguồn dữ liệu

- Giá trị mua/bán chỉ tổng hợp từ chứng từ **đã xác nhận**, không coi là doanh thu kế toán.
- Chỉ lấy phiếu nhập/xuất **đã xác nhận** cho báo cáo hoạt động kho, không tính phiếu nháp.
- Tổng số lượng luôn theo **mã mặt hàng và đơn vị**; không cộng lẫn đơn vị khác nhau.
- Tồn kho hiện tại là ảnh chụp mới nhất, **không phải tồn cuối kỳ lịch sử**.
- Các mẫu công nợ, lợi nhuận, sổ thu chi: **trống**, chờ mẫu và công thức kế toán xác nhận.

## Cách chạy

```bash
npm install
npm run typecheck
npm run test:report-center
npm run build
npm run dev
```

Mẫu workbook tham khảo có trong `samples/Foodland_Mau_Excel_Bao_Cao_v0.9.xlsx`.

**Lưu ý:** môi trường tạo source chưa cài được dependencies từ npm, nên chưa xác minh Vite build thực tế. Người dùng cần chạy `npm install && npm run build` trước khi deploy.
