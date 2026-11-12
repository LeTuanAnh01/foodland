# Foodland Frontend v0.8.0 — chuẩn hóa kỹ thuật

## Phạm vi đã triển khai

- Refactor `src/data/store.tsx`: điều phối state / commit dữ liệu theo DB mới nhất, không chứa quy tắc nghiệp vụ.
- Tách logic tạo/chỉnh sửa/xác nhận chứng từ, hóa đơn, phiếu kho, hàng hóa và đối tác sang `src/data/services/foodlandCommands.ts` dưới dạng hàm thuần. Không thay đổi thông báo và điều kiện kiểm tra so với v0.7.
- Định nghĩa `DemoDataRepository` đồng bộ, với adapter giữ nguyên `loadDemoData()/saveDemoData()` ở LocalStorage và adapter in-memory dành cho kiểm thử.
- Chuẩn bị `src/data/api/httpClient.ts` gồm HTTP error, `GET/POST/PUT/DELETE`, kiểu `PageQuery`/`PaginatedResponse` (quy ước pageSize = 10). **Chưa gọi API thật**.
- Không đổi cấu trúc các object được lưu, khóa LocalStorage hoặc các component hiện tại. Dữ liệu demo tồn tại theo trình duyệt/origin như trước.
- Thêm `test:refactor` và `typecheck:domain`. Giữ các bộ kiểm thử nghiệp vụ và báo cáo trước đó.

## Điều chưa thực hiện (cần yêu cầu nghiệp vụ từ công ty)

- Chưa định nghĩa schema PostgreSQL và API endpoint cụ thể.
- Chưa có đăng nhập, phân quyền, multi-user, API fetching/caching hoặc đồng bộ nhiều thiết bị.
- Chưa thay LocalStorage bằng API bất đồng bộ. Các hành động của Context hiện vẫn là đồng bộ; việc chuyển đổi cần kiểm soát optimistic updates, error, loading và concurrency.
- Chưa mở rộng logic giá vốn, công nợ, thuế, hóa đơn điện tử.

## Kiểm tra phiên bản

```sh
npm install
npm run typecheck
npm run typecheck:domain
npm run build
npm run test:refactor
npm run test:inventory
npm run test:workflow
npm run test:attention
npm run test:dates
npm run test:pagination
npm run test:reports
```

Nếu chạy trên môi trường không có npm dependencies thì chỉ phần `typecheck:domain` và những bài test sử dụng TypeScript có thể chạy được khi có TypeScript. Build frontend đầy đủ phải chạy trên máy đã cài `npm install`.

## Lưu ý khi thay bản đang deploy

Tải sao lưu LocalStorage trước khi deploy. Với cùng origin, các key vẫn giữ nguyên. Trước khi đẩy lên nhánh production, bắt buộc kiểm tra thủ công: thêm/xác nhận chứng từ, tạo phiếu kho liên kết, xác nhận nhập/xuất, lọc/báo cáo, tải lại trang kiểm tra dữ liệu.
