# Foodland FE v0.8 — bản đồ kiến trúc dành cho lập trình viên

## Luồng dữ liệu hiện tại

```text
React Pages / Components
        |
        | useFoodland()
        v
  data/store.tsx                 (Context + dbRef + React state)
        |
        | truyền DB mới nhất và input
        v
  data/services/foodlandCommands.ts (hàm thuần, validate + next DB)
        |
        | trả về DB / kết quả lỗi
        v
  data/store.tsx -> setDb(next)
        |
        | useEffect khi DB thay đổi
        v
  data/repositories/demoDataRepository.ts
        |
        v
  localStorageRepository.ts    (key nguyên trạng từ v0.7)
```

- `foodlandCommands.ts` có thể test mà không render React.
- Các hàm validation/confirm kho hiện hữu tại `features/documents/utils/documentWorkflow.ts` và `features/inventory/utils/stockConfirmation.ts` vẫn được tái sử dụng.
- Các chức năng khác truy cập `useFoodland()` như v0.7, không cần thay import.
- `src/data/api/httpClient.ts` chỉ là chuẩn bị lớp request/response. Không được sử dụng trên demo v0.8.

## Khi nhận được yêu cầu nghiệp vụ và chuẩn bị Backend

1. Chốt nghiệp vụ + fields với kế toán trước khi thiết kế schema hoặc endpoint cụ thể.
2. Thiết kế response phân trang thống nhất: `{ items, totalItems, page, pageSize }`, `pageSize=10`, lọc/sort do server thực hiện trước khi phân trang. Export báo cáo theo toàn bộ phạm vi lọc.
3. Thêm API service bất đồng bộ và trạng thái `loading/error/success` tại tầng UI hoặc data fetching; không ép adapter bất đồng bộ vào `DemoDataRepository` đồng bộ.
4. Dời validation nghiệp vụ trọng yếu (đặc biệt xác nhận kho) vào Backend. Dùng transaction và kiểm soát đồng thời của PostgreSQL.
5. Chọn chiến lược migration của mock data rõ ràng (không tự đẩy dữ liệu của từng browser lên server).
6. Bổ sung test API và browser E2E, giữ các test domain cũ.

## Kiểm tra nhanh

```bash
npm install
npm run typecheck
npm run build
npm run test:refactor
npm run test:inventory
npm run test:workflow
npm run test:attention
npm run test:dates
npm run test:pagination
npm run test:reports
```

`npm run typecheck:domain` có thể chạy riêng với trình biên dịch TypeScript mà không cần dependencies React/Vite.

## Nâng cấp website Cloudflare

- Sao lưu dữ liệu demo tại tab Application -> Local Storage (mỗi trình duyệt có dữ liệu riêng).
- Không đổi domain production hoặc xóa localStorage nếu muốn giữ dữ liệu hiện có.
- Chạy typecheck/build + kiểm tra thủ công, commit và push lên đúng branch mà Cloudflare Pages đang theo dõi.
- Test `Mua hàng -> Xác nhận chứng từ -> Phiếu nhập liên kết -> Xác nhận kho`, tiếp theo kiểm tra Dashboard/Báo cáo.
