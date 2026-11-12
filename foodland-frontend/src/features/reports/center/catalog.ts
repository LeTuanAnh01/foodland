export type ReportGroup = 'buy' | 'sell' | 'stock' | 'invoice' | 'manage' | 'future';
export type ReportValueType = 'text' | 'number' | 'money' | 'date';
export type ReportColumn = { key: string; label: string; type?: ReportValueType; width?: number };
export type ReportDefinition = {
  id: string;
  title: string;
  description: string;
  group: ReportGroup;
  columns: ReportColumn[];
  /** 'layout' means no validated calculation or usable source for these accounting fields. */
  mode: 'data' | 'layout';
  /** Snapshot reports cannot be reconstructed for a historical date from current stock. */
  timeframe: 'transaction' | 'current';
  note?: string;
};
const C = (key: string, label: string, type: ReportValueType = 'text', width?: number): ReportColumn => ({ key, label, type, width });
const date = C('date', 'Ngày', 'date', 15);
const doc = C('docId', 'Mã chứng từ', 'text', 18);
const partner = C('partner', 'Đối tác', 'text', 30);
const product = C('product', 'Mặt hàng', 'text', 32);
const unit = C('unit', 'ĐVT', 'text', 12);
const quantity = C('quantity', 'Số lượng', 'number', 14);
const amount = C('amount', 'Giá trị chứng từ (đ)', 'money', 24);
const group = (id: string, title: string, description: string, g: ReportGroup, columns: ReportColumn[], timeframe: ReportDefinition['timeframe'] = 'transaction', note?: string): ReportDefinition => ({ id, title, description, group: g, columns, mode: 'data', timeframe, note });
const sample = (id: string, title: string, description: string, columns: ReportColumn[]): ReportDefinition => ({ id, title, description, group: 'future', columns, mode: 'layout', timeframe: 'transaction', note: 'Chỉ có khung biểu mẫu, chưa có dữ liệu hoặc công thức kế toán được xác nhận. Không sử dụng để hạch toán.' });

export const reportGroups: { id: ReportGroup | 'all'; label: string }[] = [
  { id: 'all', label: 'Tất cả' }, { id: 'buy', label: 'Mua hàng' },
  { id: 'sell', label: 'Bán hàng' }, { id: 'stock', label: 'Kho' },
  { id: 'invoice', label: 'Hóa đơn' }, { id: 'manage', label: 'Quản trị' },
  { id: 'future', label: 'Mẫu chờ duyệt' },
];

export const reportCatalog: ReportDefinition[] = [
  group('buy-summary', 'Tổng hợp chứng từ mua', 'Danh sách và giá trị mua theo kỳ.', 'buy', [date, doc, partner, C('status', 'Trạng thái'), amount]),
  group('buy-lines', 'Chi tiết hàng mua', 'Mặt hàng, số lượng và đơn giá từng dòng chứng từ.', 'buy', [date, doc, partner, product, unit, quantity, C('unitPrice', 'Đơn giá (đ)', 'money'), amount]),
  group('buy-partners', 'Mua hàng theo nhà cung cấp', 'Gộp giá trị mua đã xác nhận theo nhà cung cấp.', 'buy', [C('code', 'Mã NCC'), partner, C('count', 'Số chứng từ', 'number'), amount]),
  group('buy-products', 'Mặt hàng mua nhiều', 'Tổng số lượng mua từng mặt hàng (không cộng khác ĐVT).', 'buy', [C('code', 'Mã hàng'), product, unit, quantity, amount]),
  group('buy-pending', 'Mua hàng chưa nhập đủ', 'Chứng từ mua còn chưa nhập đủ và trạng thái chờ xử lý.', 'buy', [date, doc, partner, C('status', 'Trạng thái CT'), C('progress', 'Tiến độ nhập'), C('pending', 'Phiếu kho nháp', 'number')]),
  group('sell-summary', 'Tổng hợp chứng từ bán', 'Giá trị chứng từ bán theo kỳ, không phải doanh thu kế toán.', 'sell', [date, doc, partner, C('status', 'Trạng thái'), amount]),
  group('sell-lines', 'Chi tiết hàng bán', 'Mặt hàng và thành tiền trên từng chứng từ bán.', 'sell', [date, doc, partner, product, unit, quantity, C('unitPrice', 'Đơn giá (đ)', 'money'), amount]),
  group('sell-partners', 'Bán hàng theo khách hàng', 'Tổng hợp giao dịch đã xác nhận theo khách hàng.', 'sell', [C('code', 'Mã KH'), partner, C('count', 'Số chứng từ', 'number'), amount]),
  group('sell-products', 'Mặt hàng bán theo số lượng', 'Tổng hợp số lượng theo mã hàng từ chứng từ bán.', 'sell', [C('code', 'Mã hàng'), product, unit, quantity, amount]),
  group('sell-top', 'Top mặt hàng bán chạy', 'Xếp hạng theo số lượng trên chứng từ bán đã xác nhận.', 'sell', [C('rank', 'Hạng', 'number'), C('code', 'Mã hàng'), product, unit, quantity, amount]),
  group('sell-pending', 'Bán hàng chưa xuất đủ', 'Chứng từ còn hàng chưa xác nhận xuất kho.', 'sell', [date, doc, partner, C('status', 'Trạng thái CT'), C('progress', 'Tiến độ xuất'), C('pending', 'Phiếu kho nháp', 'number')]),
  group('stock-current', 'Tồn kho hiện tại', 'Tồn hiện tại theo mặt hàng và vị trí.', 'stock', [C('code', 'Mã hàng'), product, unit, C('location', 'Vị trí'), C('stock', 'Tồn hiện tại', 'number'), C('min', 'Tồn tối thiểu', 'number'), C('state', 'Cảnh báo')], 'current', 'Đây là ảnh chụp tồn kho hiện tại, không phải tồn cuối kỳ lịch sử.'),
  group('stock-low', 'Hàng dưới ngưỡng tồn', 'Mặt hàng cần kiểm tra hoặc bổ sung.', 'stock', [C('code', 'Mã hàng'), product, unit, C('stock', 'Tồn hiện tại', 'number'), C('min', 'Tồn tối thiểu', 'number'), C('short', 'Thiếu so ngưỡng', 'number')], 'current'),
  group('stock-zero', 'Danh sách hết hàng', 'Các mặt hàng đang có tồn bằng không.', 'stock', [C('code', 'Mã hàng'), product, unit, C('location', 'Vị trí'), C('stock', 'Tồn hiện tại', 'number')], 'current'),
  group('stock-in', 'Chi tiết phiếu nhập kho', 'Phiếu nhập đã xác nhận trong kỳ, từng dòng hàng.', 'stock', [date, C('movementId', 'Mã phiếu'), C('source', 'Chứng từ liên kết'), product, unit, quantity, C('status', 'Trạng thái')]),
  group('stock-out', 'Chi tiết phiếu xuất kho', 'Phiếu xuất đã xác nhận trong kỳ, từng dòng hàng.', 'stock', [date, C('movementId', 'Mã phiếu'), C('source', 'Chứng từ liên kết'), product, unit, quantity, C('status', 'Trạng thái')]),
  group('stock-flow', 'Nhập – xuất theo mặt hàng', 'Tổng số nhập/xuất trong kỳ và tồn mới nhất.', 'stock', [C('code', 'Mã hàng'), product, unit, C('received', 'Nhập trong kỳ', 'number'), C('issued', 'Xuất trong kỳ', 'number'), C('stock', 'Tồn hiện tại', 'number')], 'transaction', 'Số tồn là hiện tại; không suy ra tồn đầu kỳ nếu thiếu dữ liệu lịch sử.'),
  group('stock-locations', 'Tồn kho theo vị trí', 'Danh sách mặt hàng tại từng khu vực kho.', 'stock', [C('location', 'Vị trí kho'), C('code', 'Mã hàng'), product, unit, C('stock', 'Tồn hiện tại', 'number')], 'current'),
  group('stock-checks', 'Danh sách phiếu kiểm kê', 'Các phiếu kiểm kê nháp đang lưu.', 'stock', [date, C('movementId', 'Mã kiểm kê'), C('status', 'Trạng thái'), C('note', 'Ghi chú')]),
  group('invoice-buy', 'Hóa đơn đầu vào', 'Hóa đơn đã nhận/lưu trong demo, không phải sổ thuế.', 'invoice', [date, C('invoiceId', 'Mã hóa đơn'), C('number', 'Số hóa đơn'), C('symbol', 'Ký hiệu'), doc, partner, C('status', 'Trạng thái')]),
  group('invoice-sell', 'Hóa đơn đầu ra', 'Danh sách thông tin hóa đơn bán được ghi nhận nội bộ.', 'invoice', [date, C('invoiceId', 'Mã hóa đơn'), C('number', 'Số hóa đơn'), C('symbol', 'Ký hiệu'), doc, partner, C('status', 'Trạng thái')]),
  group('invoice-pending', 'Hóa đơn chờ xác nhận', 'Hóa đơn đã nhập thông tin nhưng còn bản nháp.', 'invoice', [date, C('invoiceId', 'Mã hóa đơn'), C('direction', 'Loại hóa đơn'), doc, C('number', 'Số hóa đơn'), C('status', 'Trạng thái')]),
  group('invoice-missing', 'Chứng từ chưa có hóa đơn', 'Chứng từ chưa liên kết thông tin hóa đơn.', 'invoice', [date, doc, C('direction', 'Loại CT'), partner, C('status', 'Trạng thái CT')]),
  group('manage-attention', 'Chứng từ cần xử lý', 'Danh sách nguyên nhân còn công việc chưa hoàn thành.', 'manage', [date, doc, C('direction', 'Loại CT'), partner, C('status', 'Trạng thái CT'), C('reason', 'Việc cần xử lý')]),
  group('manage-progress', 'Tiến độ nhập/xuất từng chứng từ', 'Theo dõi từng mặt hàng cần xử lý và hàng đã xác nhận.', 'manage', [date, doc, product, unit, C('required', 'Cần giao nhận', 'number'), C('confirmed', 'Đã xác nhận', 'number'), C('remaining', 'Còn lại', 'number'), C('pending', 'Đang nháp', 'number')]),
  group('manage-warehouse', 'Phiếu kho chờ xác nhận', 'Phiếu nhập và xuất còn ở trạng thái bản nháp.', 'manage', [date, C('movementId', 'Mã phiếu'), C('direction', 'Loại phiếu'), C('source', 'Chứng từ liên kết'), C('lines', 'Số mặt hàng', 'number'), C('note', 'Ghi chú')]),
  group('manage-products', 'Danh mục hàng hóa', 'Mẫu danh mục mặt hàng đang quản lý.', 'manage', [C('code', 'Mã hàng'), product, C('category', 'Nhóm hàng'), unit, C('spec', 'Quy cách'), C('supplier', 'Nguồn nhập')], 'current'),
  group('manage-partners', 'Danh mục đối tác', 'Danh sách khách hàng và nhà cung cấp.', 'manage', [C('code', 'Mã đối tác'), partner, C('direction', 'Phân loại'), C('phone', 'Điện thoại'), C('address', 'Địa chỉ')], 'current'),
  sample('future-receivables', 'Công nợ phải thu (mẫu)', 'Mẫu sổ theo dõi khoản khách hàng phải trả.', [date, C('code', 'Mã KH'), partner, doc, C('opening', 'Nợ đầu kỳ (đ)', 'money'), C('increase', 'Phát sinh tăng (đ)', 'money'), C('paid', 'Đã thu (đ)', 'money'), C('closing', 'Nợ cuối kỳ (đ)', 'money')]),
  sample('future-payables', 'Công nợ phải trả (mẫu)', 'Mẫu sổ theo dõi các khoản phải trả nhà cung cấp.', [date, C('code', 'Mã NCC'), partner, doc, C('opening', 'Nợ đầu kỳ (đ)', 'money'), C('increase', 'Phát sinh tăng (đ)', 'money'), C('paid', 'Đã trả (đ)', 'money'), C('closing', 'Nợ cuối kỳ (đ)', 'money')]),
  sample('future-profit', 'Báo cáo lãi lỗ (mẫu)', 'Khung báo cáo chưa tính giá vốn, chi phí, lợi nhuận.', [C('period', 'Kỳ báo cáo'), C('revenue', 'Doanh thu (đ)', 'money'), C('cost', 'Giá vốn (đ)', 'money'), C('expenses', 'Chi phí (đ)', 'money'), C('profit', 'Lợi nhuận (đ)', 'money')]),
  sample('future-stock-value', 'Giá trị hàng tồn kho (mẫu)', 'Chưa xác định đơn giá vốn và phương pháp tính tồn.', [C('code', 'Mã hàng'), product, unit, C('stock', 'Số lượng tồn', 'number'), C('cost', 'Đơn giá vốn (đ)', 'money'), C('amount', 'Giá trị tồn (đ)', 'money')]),
  sample('future-debt-aging', 'Tuổi nợ (mẫu)', 'Mẫu công nợ phân theo số ngày quá hạn.', [C('code', 'Mã KH/NCC'), partner, C('dueDate', 'Ngày đến hạn', 'date'), C('days', 'Số ngày quá hạn', 'number'), C('unpaid', 'Giá trị còn nợ (đ)', 'money'), C('group', 'Nhóm tuổi nợ')]),
  sample('future-cashbook', 'Sổ thu chi (mẫu)', 'Chưa có nghiệp vụ quỹ tiền mặt hoặc ngân hàng.', [date, C('voucher', 'Số phiếu'), C('partner', 'Đối tượng'), C('description', 'Nội dung'), C('income', 'Thu (đ)', 'money'), C('expense', 'Chi (đ)', 'money'), C('balance', 'Tồn quỹ (đ)', 'money')]),
];
