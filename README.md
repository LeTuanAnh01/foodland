# Foodland Frontend v0.7.0 — Dashboard & Báo cáo lấy từ dữ liệu đang lưu

Xem [CHANGELOG v0.7](./CHANGELOG_v0.7.md). Kế thừa toàn bộ tính năng v0.6.5: phân trang 10 dòng trên mọi bảng, lọc theo ngày/tuần/tháng/năm, chứng từ – phiếu kho – hóa đơn độc lập, cảnh báo và thao tác xác nhận kho.

**Tính mới v0.7**

- Dashboard: KPI giá trị chứng từ mua/bán **đã xác nhận**, Top hàng trên chứng từ bán, biểu đồ 12 tháng tính từ store; tồn kho/cảnh báo theo trạng thái hiện tại.
- Báo cáo chứng từ: lọc thời gian, loại, trạng thái, tìm kiếm; hiển thị tổng giá trị trong phạm vi lọc và xuất CSV đầy đủ (không giới hạn trang).
- Báo cáo kho: tồn hiện tại kèm ngưỡng cảnh báo, số nhập/xuất theo từng mã hàng từ phiếu kho đã xác nhận trong kỳ.
- Không tính lãi/lỗ, giá vốn, nợ, thuế, hay tồn đầu kỳ nếu chưa có dữ liệu và quy tắc kế toán.

**Chạy dự án**

```bash
npm install
npm run typecheck
npm run test:reports
npm run test:pagination
npm run test:workflow
npm run test:inventory
npm run test:dates
npm run test:attention
npm run build
npm run dev
```

Dữ liệu chỉ lưu ở `localStorage` của mỗi trình duyệt. Không dùng dữ liệu kế toán thật trên demo công khai. Cùng domain (origin) thì dữ liệu localStorage cũ vẫn còn khi cập nhật FE; nên sao lưu trước khi reset hoặc thay đổi domain.

**Phân biệt ý nghĩa số liệu:** KPI và biểu đồ là *giá trị chứng từ đã xác nhận*, không phải doanh thu kế toán; Top mặt hàng lấy từ chứng từ bán đã xác nhận, không phải lượng đã giao; báo cáo tồn hiện tại là snapshot mới nhất, không phải tồn của một ngày lịch sử.

---

# Foodland Frontend v0.6.5 — Phân trang đồng bộ

Xem [CHANGELOG v0.6.5](./CHANGELOG_v0.6.5.md).

**Toàn bộ bảng đều hiển thị tối đa 10 dòng/trang**, kể cả bảng trong form và modal chi tiết. Xuất CSV luôn lấy đủ dữ liệu sau lọc, không chỉ trang đang xem. Chưa thay đổi LocalStorage và nghiệp vụ nhập/xuất kho.

---

# Foodland Frontend v0.6.1

**Changelog mới nhất:** [CHANGELOG_v0.6.1.md](./CHANGELOG_v0.6.1.md).

Phiên bản thử nghiệm có **trạng thái nhập/xuất kho tự tính trên danh sách và chi tiết chứng từ**, liên kết **chứng từ mua/bán → phiếu kho nháp** và **hóa đơn độc lập**. Xác nhận phiếu kho mới thay đổi số tồn; hóa đơn không cập nhật số tồn.

---

# Foodland Frontend v0.5.4 – Hiển thị số lượng rõ ràng

**Nâng cấp v0.5.4:** Bỏ cách hiển thị số lượng dạng `N / M` ở chân bảng dữ liệu và ở khu vực Tồn kho cần chú ý của wireframe cũ. Số tồn luôn hiển thị riêng; ngưỡng cảnh báo vẫn được lưu và dùng tính trạng thái. Không đổi dữ liệu LocalStorage hoặc nghiệp vụ kho.

## Các phiên bản trước

### v0.5.3 – Đồng bộ cảnh báo tồn kho trong chi tiết phiếu

**Nâng cấp v0.5.3:** Xem chi tiết phiếu nhập/xuất nháp đã có tồn hiện tại, tồn dự kiến và trạng thái từng mặt hàng giống phần chỉnh sửa. Phiếu xuất nháp thiếu tồn hiển thị cảnh báo và số lượng thiếu ngay trong màn hình chi tiết. Phiếu đã xác nhận chỉ hiển thị số tồn hiện tại để tham khảo, không đánh giá thiếu hàng ngược thời gian. Không thay đổi logic ghi kho hay dữ liệu đã lưu.

**Nghiệp vụ v0.5.2:** Phiếu nhập/xuất có nhiều mặt hàng, bảng nhập liệu hiển thị tồn hiện tại và tồn dự kiến. Phiếu xuất cảnh báo thiếu hàng ngay khi nhập và trong hộp thoại xác nhận. Xác nhận phiếu nhập sẽ **cộng** tồn kho; xác nhận phiếu xuất sẽ **trừ** tồn kho nếu **mọi mặt hàng đều đủ tồn**. Xác nhận là một thao tác toàn bộ hoặc không thay đổi gì. Phiếu đã xác nhận không thể sửa, xóa hoặc xác nhận lại. Vẫn dùng dữ liệu mock trên trình duyệt, chưa phải nghiệp vụ kho đã kiểm duyệt.

**Nền tảng:** React 19 + TypeScript + Vite + Tailwind CSS v4. Kế thừa giao diện dạng bảng v0.5.1, dữ liệu lưu LocalStorage. Chứng từ mua/bán không tự làm thay đổi tồn kho.

## Chạy trên Mac

```bash
npm install
npm run dev
```

Truy cập `http://localhost:5173`. Trước khi bàn giao/thử nghiệm thêm, chạy:

```bash
npm run typecheck
npm run build
```

> Chạy `npm install && npm run typecheck && npm run build` trên máy trước khi sử dụng.

## Kiến trúc

```text
src/
├── app/
│   ├── App.tsx
│   └── router/AppRoutes.tsx
├── layouts/DashboardLayout/
│   ├── DashboardLayout.tsx       # full width, Outlet
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   ├── MobileNavigation.tsx
│   ├── Breadcrumbs.tsx
│   └── navigation.ts
├── components/
│   ├── ui/                       # UI primitives
│   └── shared/                   # PageHeading, MetricCard, SectionCard,
│                                  SearchInput, TableScroll, Tabs,
│                                  FormField, EmptyState, TableFooter
├── features/
│   ├── dashboard/{pages,components,data}/
│   ├── products/{pages,components,data}/
│   ├── inventory/{pages,components,data,utils}/
│   ├── purchases/pages/
│   ├── sales/pages/
│   ├── documents/{pages,components,utils}/
│   ├── invoices/components/
│   ├── partners/{pages,components}/
│   ├── reports/{pages,components}/
│   └── settings/pages/
├── data/
│   ├── types.ts                  # Models dùng chung
│   ├── mocks/initialData.ts
│   ├── repositories/localStorageRepository.ts
│   └── store.tsx                 # Context và các thao tác mock
└── lib/utils.ts
```

## Quy tắc đặt component

- `components/ui`: component UI cơ sở có thể tùy biến.
- `components/shared`: UI tái sử dụng ở nhiều feature, không chứa nghiệp vụ.
- `features/*/components`: chỉ chứa UI của feature tương ứng.
- `features/*/pages`: điều phối trạng thái, lọc dữ liệu và dựng các component, hạn chế chứa bảng/form dài.
- `data/types.ts`: dùng chung kiểu dữ liệu; `data/repositories/` là lớp persistence tạm. Chưa kết nối REST API.
- Các quy trình chưa được kế toán duyệt **không được triển khai như nghiệp vụ chính thức**.

## Các chức năng v0.5

1. Sidebar và Full Width Layout, các đường dẫn `/dashboard`, `/products`, `/inventory`, `/purchases`, `/sales`, `/partners`, `/reports`, `/settings`.
2. Danh mục hàng hóa thêm/sửa; số lượng và trạng thái chỉ hiển thị tại **Kho**.
3. Kho: sửa số tồn demo, tạo phiếu nhập/xuất nhiều mặt hàng, lưu/sửa/xóa bản nháp. Khi xác nhận phiếu nhập thì cộng tồn, xuất thì kiểm tra đủ tồn và trừ. Có cảnh báo ngay trên form, danh sách, chi tiết phiếu và hộp thoại xác nhận. Phiếu đã xác nhận khóa sửa/xóa; có tìm kiếm, CSV và xem chi tiết. Tab **Kiểm kê** hỗ trợ tạo bản nháp.
4. Chứng từ mua/bán tạo bản nháp có nhiều dòng hàng.
5. Nhận hóa đơn đầu vào / thêm hóa đơn bán dùng **chung một form** và popup chọn chứng từ. Lưu xong số hóa đơn cập nhật trong bảng chứng từ.
6. Danh sách đối tác, báo cáo có phân loại **MUA HÀNG/BÁN HÀNG**, tìm kiếm, lọc và xuất CSV.
7. Dữ liệu chỉ là mock, thêm chứng từ mua/bán không tự cập nhật kho; chỉ thao tác **xác nhận phiếu kho** mới cộng/trừ số tồn. Chưa xử lý công nợ, thuế hoặc tính lợi nhuận.

## Nâng cấp dữ liệu từ v0.3/v0.4

`localStorage` tiếp tục dùng key `foodland-react-prototype-v1`. Khi có phiếu định dạng cũ, ứng dụng lưu một bản sao JSON gốc tại `foodland-react-prototype-v1-backup-v0.4` (nếu còn đủ dung lượng). Khi nâng từ v0.3/v0.4, ứng dụng tự chuyển phiếu kho một mặt hàng (`productId`, `qty`) thành nhiều dòng (`lines`) và mặc định trạng thái `draft`. Dữ liệu cũ còn lại vẫn được giữ, **không ghi đè hàng hóa, tồn kho, chứng từ hay hóa đơn cũ**. Phiếu đã xác nhận từ bản v0.5/v0.5.1 không được cộng/trừ hồi tố; phiếu được xác nhận từ v0.5.2 có `stockApplied: true`. Dữ liệu được giữ khi chạy trên **cùng origin** (`localhost:5173`). Nếu muốn làm mới, dùng nút **Thiết lập → Khôi phục dữ liệu mẫu**.

## Checklist thủ công cần thực hiện sau khi cài dependencies

- [ ] Chạy `npm run typecheck && npm run build` thành công.
- [ ] Kiểm tra trang kho luôn full width trên màn hình desktop.
- [ ] Kho → Nhập kho → Thêm phiếu nhập → nhập ngày, thêm 2–3 mặt hàng/số lượng → Lưu → phiếu xuất hiện trên bảng.
- [ ] Mở chi tiết: tất cả dòng mặt hàng đều đúng; sửa/xóa phiếu nháp, xác nhận phiếu và thử kiểm tra rằng phiếu đã xác nhận không sửa/xóa được.
- [ ] Kho → Xuất kho → Thêm phiếu xuất → Lưu → phiếu xuất hiện trên bảng; nhập trùng mã hoặc trùng mặt hàng phải báo lỗi.
- [ ] Xuất CSV phiếu nhiều mặt hàng phải ra nhiều dòng có cùng mã phiếu.
- [ ] Kho → Kiểm kê → Tạo phiếu kiểm kê → Lưu bản nháp.
- [ ] Tải lại trang: các phiếu vẫn còn; Dashboard hiển thị phiếu nhập/xuất gần đây.
- [ ] Lưu phiếu nháp: số tồn ở tab Tổng quan phải giữ nguyên.
- [ ] Xác nhận phiếu nhập 2 mặt hàng: tồn của cả 2 sản phẩm tăng tương ứng và phiếu khóa sửa/xóa.
- [ ] Phiếu xuất có mặt hàng thiếu tồn: cảnh báo ngay trên form, bảng và hộp xác nhận; nút xác nhận không cho bấm.
- [ ] Phiếu xuất đủ hàng: tồn của tất cả mặt hàng giảm đúng và không âm; tải lại trang vẫn đúng.
- [ ] Xác nhận hai phiếu xuất cùng sản phẩm: phiếu thứ hai phải dùng tồn mới; không trừ kho hai lần khi xác nhận lại.
- [ ] Phiếu đã xác nhận từ v0.5.1 không tự được áp dụng vào tồn khi nâng cấp.
- [ ] Thêm hàng hóa và làm mới trang vẫn còn mặt hàng mới.
- [ ] Tạo chứng từ mua chưa có hóa đơn; vào **Nhận hóa đơn**, chọn chứng từ, lưu; quay về bảng mua thấy số hóa đơn.
- [ ] Tạo chứng từ bán và thêm hóa đơn tương tự.
- [ ] Lọc báo cáo theo Đơn mua/Đơn bán, xuất CSV; các trang khác không bị lỗi.
- [ ] Thử modal trên màn hình laptop nhỏ và bảng có cuộn ngang.

Bản HTML duyệt UI vẫn được lưu tại `public/wireframe-v2.html`.

## Phạm vi giới hạn

- Số tồn lấy từ mỗi mã hàng một dòng `stocks` (prototype chưa có nhiều kho/lô hàng cho một sản phẩm).
- Phiếu kho và chứng từ mua/bán vẫn độc lập, không đồng bộ tự động.
- Bản demo vẫn cho chỉnh trực tiếp tồn mẫu trong tab Tổng quan (không ghi lịch sử điều chỉnh).
- Các phiếu xác nhận ở v0.5.1 chưa từng thay đổi tồn nên **không xử lý hồi tố**.
- LocalStorage không hỗ trợ giao dịch đồng thời nhiều máy hoặc nhiều tab an toàn. Khi có backend PostgreSQL, kiểm tra đủ tồn và trừ/cộng phải diễn ra **trong transaction** với khóa dữ liệu phù hợp.

## Kiểm tra riêng giao diện v0.5.3

- [ ] Kho → Xuất kho → mở chi tiết một phiếu **bản nháp** thiếu hàng → bảng có cột Tồn dự kiến, Tình trạng (Thiếu N) và khung cảnh báo.
- [ ] Nhập bổ sung hàng bằng phiếu nhập khác, xác nhận → mở lại chi tiết phiếu xuất nháp, tình trạng đủ/thiếu tự cập nhật.
- [ ] Kho → Xuất kho → xem phiếu **đã xác nhận** → không gán nhãn thiếu hàng dựa vào tồn hiện tại, chỉ hiển thị nhãn đã cập nhật kho.


## v0.6.3
Đã bỏ PageHeading ở mọi màn hình. Xem CHANGELOG_v0.6.3.md.

## v0.6.4 – Lọc theo thời gian
- Mua hàng/Bán hàng: lọc danh sách chứng từ theo ngày, khoảng ngày, tuần ISO (Thứ Hai–Chủ nhật), tháng hoặc năm.
- Tab Hóa đơn: bộ lọc tương tự theo ngày hóa đơn.
- Kho: tab Nhập kho, Xuất kho và Kiểm kê có bộ lọc thời gian theo ngày phiếu.
- Ngày chọn bằng lịch của trình duyệt (input date, week, month); khoảng ngày cho phép một đầu mốc.
- Kết hợp lọc thời gian với tìm kiếm và lọc trạng thái. Xuất CSV chỉ xuất các dòng đang xem.
- Thống kê toàn bộ chứng từ và tín hiệu công việc ở Sidebar **không bị ảnh hưởng** bởi bộ lọc thời gian.
- Kiểm tra: `npm run test:dates`, `npm run test:workflow`, `npm run test:inventory`, `npm run test:attention`.
