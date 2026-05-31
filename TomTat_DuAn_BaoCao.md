# TÓM TẮT DỰ ÁN: KIỂM THỬ TỰ ĐỘNG WEBSITE THƯƠNG MẠI ĐIỆN TỬ mhm.vn BẰNG PLAYWRIGHT

> Tài liệu này tổng hợp đầy đủ nội dung dự án để làm cơ sở viết báo cáo.
> Khung trình bày bám theo mẫu mục lục báo cáo (Chương 1 – Cơ sở lý thuyết, Chương 2 – Kế hoạch kiểm thử, Chương 3 – Cài đặt & thực nghiệm, Kết luận).
> **Lưu ý:** Mẫu gốc viết cho kiểm thử API bằng Postman/Newman trên hệ thống TeleMedicine. Dự án thực tế ở đây là **kiểm thử giao diện (UI/E2E) bằng Playwright** trên website bán điện thoại **mhm.vn**, nên nội dung từng chương đã được điều chỉnh cho đúng công nghệ và đối tượng.

---

## THÔNG TIN CHUNG

| Mục | Nội dung |
|-----|----------|
| Tên đề tài | Xây dựng bộ kiểm thử tự động cho website thương mại điện tử mhm.vn |
| Website kiểm thử | https://mhm.vn (Minh Hoàng Mobile – Hải Phòng) |
| Công cụ chính | Playwright (Test Runner) + TypeScript |
| Trình duyệt | Firefox (Desktop) |
| Mô hình thiết kế | Page Object Model (POM) + Custom Fixtures |
| Các module kiểm thử | Tìm kiếm (Search), Đăng ký (Register), Giỏ hàng (Cart) |
| Tổng số test case | 76 (Search: 28, Register: 30, Cart: 18) |

**Nhóm thực hiện (theo README dự án):**

| MSSV | Họ tên | Vai trò |
|------|--------|---------|
| CT070128 | Nguyễn Sỹ Huy Hoàng | Module Tìm kiếm |
| CT070129 | Đặng Xuân Hùng | Trang chủ & Điều hướng |
| CT070111 | Vũ Văn Đảng | Module Giỏ hàng |

---

# CHƯƠNG 1. CƠ SỞ LÝ THUYẾT

## 1.1 Cơ sở lý thuyết

### 1.1.1 Đặt vấn đề
Các website thương mại điện tử như mhm.vn có nhiều chức năng quan trọng ảnh hưởng trực tiếp đến trải nghiệm và doanh thu: tìm kiếm sản phẩm, đăng ký tài khoản, thêm/sửa giỏ hàng, thanh toán. Mỗi lần website cập nhật giao diện hoặc logic, các chức năng này có nguy cơ phát sinh lỗi (regression). Kiểm thử thủ công lặp đi lặp lại tốn nhiều thời gian, dễ bỏ sót và khó tái lập. Vì vậy cần một bộ **kiểm thử tự động** để kiểm tra nhanh, ổn định và lặp lại được sau mỗi thay đổi.

### 1.1.2 Mục tiêu nghiên cứu
- Xây dựng bộ kiểm thử tự động end-to-end (E2E) cho các chức năng cốt lõi của mhm.vn.
- Áp dụng mô hình Page Object Model để bộ test dễ bảo trì, dễ mở rộng.
- Thiết kế test case bao phủ cả luồng hợp lệ (positive) lẫn luồng bất thường (negative, biên).
- Phát hiện được các lỗi thực tế của website (ví dụ thiếu kiểm tra dữ liệu đầu vào, thiếu nhãn accessibility).
- Xuất báo cáo kết quả trực quan (HTML report, ảnh chụp màn hình, video, trace).

### 1.1.3 Đối tượng và phạm vi nghiên cứu
- **Đối tượng:** website mhm.vn và ba chức năng Tìm kiếm, Đăng ký, Giỏ hàng.
- **Phạm vi:**
  - Kiểm thử giao diện và hành vi ở phía người dùng (black-box), kết hợp gọi API nội bộ của nền tảng (`/cart/add.js`, `/cart/change.js`, `/cart.js`, `/cart/clear.js`) để xác minh trạng thái dữ liệu.
  - Chạy trên trình duyệt Firefox.
  - Không bao gồm kiểm thử hiệu năng, bảo mật chuyên sâu hay kiểm thử thanh toán thật.

### 1.1.4 Phương pháp nghiên cứu
- Nghiên cứu lý thuyết về kiểm thử phần mềm và kiểm thử tự động.
- Phân tích chức năng website để xác định kịch bản kiểm thử.
- Thực nghiệm xây dựng và chạy test case bằng Playwright, thu thập kết quả và đánh giá.
- Áp dụng các kỹ thuật thiết kế test case: phân vùng tương đương, phân tích giá trị biên, kiểm thử âm tính, kiểm thử dựa trên dữ liệu.

## 1.2 Tổng quan về kiểm thử Web tự động

### 1.2.1 Khái niệm kiểm thử Web tự động
Kiểm thử Web tự động là việc dùng phần mềm điều khiển trình duyệt thực hiện các thao tác của người dùng (mở trang, nhập liệu, nhấn nút) và tự động so sánh kết quả thực tế với kết quả mong đợi, thay cho thao tác thủ công.

### 1.2.2 Các thành phần chính của một hệ kiểm thử E2E
- **Test Runner:** điều phối chạy test, quản lý retry, song song, báo cáo (ở đây là Playwright Test).
- **Browser Automation Engine:** điều khiển trình duyệt thật (Chromium/Firefox/WebKit).
- **Locator/Selector:** cơ chế xác định phần tử trên trang (CSS, role, text).
- **Assertion:** thư viện khẳng định kết quả (`expect`).
- **Reporter:** sinh báo cáo HTML, ảnh, video, trace.

### 1.2.3 Kiến trúc dự án (mô hình phân lớp)
```
┌────────────────────────────────────────────┐
│  Test Specs (tests/*.spec.ts)               │  ← Kịch bản kiểm thử
│  search-basic | register-basic | cart-basic │
├────────────────────────────────────────────┤
│  Custom Fixtures (fixtures/custom-fixtures)  │  ← Tiêm sẵn Page Object
├────────────────────────────────────────────┤
│  Page Objects (pages/*.ts)                  │  ← Trừu tượng hóa từng trang
│  BasePage → Home/Search/Register/Cart       │
├────────────────────────────────────────────┤
│  Utils (utils/helpers.ts, constants.ts)     │  ← Hàm & hằng số dùng chung
├────────────────────────────────────────────┤
│  Playwright Engine → Firefox → mhm.vn        │
└────────────────────────────────────────────┘
```

## 1.3 Website mục tiêu và kiểm thử chức năng

### 1.3.1 Giới thiệu website mhm.vn
mhm.vn là website bán lẻ điện thoại, máy tính bảng và phụ kiện. Các chức năng được chọn kiểm thử là những luồng người dùng dùng nhiều nhất: tìm kiếm sản phẩm, đăng ký tài khoản, quản lý giỏ hàng.

### 1.3.2 Đặc điểm nền tảng
Website xây dựng trên nền tảng thương mại điện tử có các endpoint AJAX dạng `.js` cho giỏ hàng (giống mô hình Shopify/Haravan): `cart/add.js`, `cart/change.js`, `cart.js`, `cart/clear.js`. Điều này cho phép test vừa thao tác trên UI vừa xác minh trạng thái dữ liệu qua API.

### 1.3.3 Tầm quan trọng của kiểm thử các chức năng này
Tìm kiếm sai làm khách không thấy sản phẩm; đăng ký lỏng lẻo dẫn tới dữ liệu rác; giỏ hàng sai đồng bộ gây mất đơn. Do đó việc kiểm thử tự động ổn định cho ba module này có giá trị thực tiễn cao.

## 1.4 Công cụ Playwright

### 1.4.1 Giới thiệu Playwright
Playwright là framework kiểm thử tự động mã nguồn mở của Microsoft, hỗ trợ điều khiển Chromium, Firefox và WebKit bằng một API thống nhất. Dự án dùng `@playwright/test` phiên bản ^1.52.0 cùng TypeScript.

### 1.4.2 Các tính năng chính được sử dụng
- **Auto-waiting:** tự chờ phần tử sẵn sàng trước khi thao tác, giảm test "flaky".
- **Web-first assertions:** `expect(locator).toBeVisible()`, `toHaveURL()`, `toHaveAttribute()`, `toHaveAccessibleName()`… tự động retry trong thời gian chờ.
- **Fixtures & `test.extend`:** tiêm sẵn các Page Object cho mỗi test.
- **APIRequestContext:** gọi trực tiếp API nội bộ (`page.request.post/get`) để dựng dữ liệu và xác minh trạng thái giỏ hàng.
- **Trace, screenshot, video:** thu thập bằng chứng khi test chạy/thất bại.
- **Retry & report:** tự thử lại 1 lần khi lỗi và sinh HTML report.

### 1.4.3 Cấu hình Playwright của dự án (`playwright.config.ts`)
| Thiết lập | Giá trị | Ý nghĩa |
|-----------|---------|---------|
| `testDir` | `./tests` | Thư mục chứa test |
| `fullyParallel` | `false` | Không chạy song song toàn bộ |
| `workers` | `1` | Chạy tuần tự để ổn định |
| `retries` | 1 (local), 2 (CI) | Số lần thử lại khi lỗi |
| `baseURL` | `https://mhm.vn` | URL gốc |
| `trace` | `on-first-retry` | Lưu trace khi retry |
| `screenshot` | `on` | Luôn chụp màn hình |
| `video` | `on` | Luôn quay video |
| `actionTimeout` | 20000 ms | Hết giờ cho mỗi thao tác |
| `navigationTimeout` | 30000 ms | Hết giờ điều hướng |
| `headless` | `true` | Chạy ẩn trình duyệt |
| `locale` | `vi-VN` | Ngôn ngữ tiếng Việt |
| `projects` | `firefox` | Trình duyệt mục tiêu |
| `reporter` | `html` + `list` | Báo cáo HTML và log dòng |

## 1.5 Kiểm thử tự động

### 1.5.1 Khái niệm
Kiểm thử tự động dùng script để thực hiện và đánh giá test thay cho con người, đặc biệt hữu ích với các test cần lặp lại nhiều lần (regression).

### 1.5.2 Lợi ích
- Tiết kiệm thời gian khi chạy lại nhiều lần.
- Kết quả nhất quán, giảm sai sót do con người.
- Phát hiện sớm lỗi sau mỗi thay đổi code/giao diện.
- Có bằng chứng (video, ảnh, trace) phục vụ phân tích.

### 1.5.3 Thách thức
- Test "flaky" do mạng/độ trễ đồng bộ (đã gặp ở TC_CART_016).
- Phụ thuộc cấu trúc HTML thật của website (selector dễ thay đổi).
- reCAPTCHA và các cơ chế chống bot làm khó kiểm thử luồng đăng ký hoàn tất.
- Chi phí bảo trì khi giao diện thay đổi.

## 1.6 Ý nghĩa khoa học và thực tiễn
- **Khoa học:** minh họa quy trình thiết kế và áp dụng các kỹ thuật kiểm thử (phân vùng tương đương, giá trị biên, negative testing) trên một hệ thống thực.
- **Thực tiễn:** bộ test tái sử dụng được cho mhm.vn, phát hiện lỗi thật về kiểm tra dữ liệu và accessibility, có thể tích hợp CI để chạy tự động.

## 1.7 Tổng kết chương 1
Chương 1 trình bày cơ sở lý thuyết về kiểm thử web tự động, giới thiệu website mhm.vn, công cụ Playwright và mô hình Page Object Model làm nền tảng cho việc xây dựng bộ kiểm thử ở các chương sau.

---

# CHƯƠNG 2. XÂY DỰNG KẾ HOẠCH KIỂM THỬ

## 2.1 Phân tích yêu cầu kiểm thử
Ba chức năng được kiểm thử với yêu cầu cụ thể:

**Tìm kiếm (Search):**
- Trả về đúng sản phẩm chứa từ khóa; không phân biệt hoa/thường; tự loại bỏ khoảng trắng thừa.
- Hỗ trợ tiếng Việt có dấu và không dấu.
- Không tìm thấy thì hiển thị thông báo thân thiện, không lộ truy vấn nội bộ (`filter=`, `title:product`…).
- Chặn tìm kiếm khi ô trống hoặc chỉ chứa khoảng trắng.

**Đăng ký (Register):**
- Bắt buộc nhập đủ Họ, Tên, Số điện thoại, Email, Mật khẩu.
- Kiểm tra định dạng email và số điện thoại.
- Kiểm tra dữ liệu biên: họ/tên toàn khoảng trắng hoặc toàn số, mật khẩu quá ngắn/quá dài, chuỗi quá dài, ký tự đặc biệt, mã XSS.
- Không để lộ lỗi hệ thống trên giao diện.

**Giỏ hàng (Cart):**
- Thêm/sửa/xóa sản phẩm phản ánh đúng trên UI và đồng bộ với server.
- Tăng/giảm số lượng đúng quy tắc (không giảm dưới 1).
- Hiển thị tổng tiền, nút thanh toán; giữ dữ liệu khi reload.
- Không hiển thị lỗi hệ thống; nút/ô nhập đảm bảo accessibility.

## 2.2 Phạm vi kiểm thử
- **Trong phạm vi:** UI và hành vi của 3 module trên Firefox; xác minh trạng thái giỏ hàng qua API nội bộ.
- **Ngoài phạm vi:** thanh toán thật, hiệu năng, bảo mật chuyên sâu, đa trình duyệt (hiện chỉ cấu hình Firefox), hoàn tất đăng ký vượt reCAPTCHA.

## 2.3 Vai trò và trách nhiệm
| Thành viên | Trách nhiệm |
|------------|-------------|
| Nguyễn Sỹ Huy Hoàng (CT070128) | Thiết kế & viết test module Tìm kiếm, `SearchPage` |
| Đặng Xuân Hùng (CT070129) | Trang chủ, điều hướng, `HomePage` |
| Vũ Văn Đảng (CT070111) | Module Giỏ hàng, `CartPage`; hỗ trợ module Đăng ký |

## 2.4 Quy trình kiểm thử phần mềm
1. Phân tích chức năng website và xác định kịch bản.
2. Thiết kế test case (ID, mô tả, dữ liệu vào, kết quả mong đợi).
3. Xây dựng Page Object cho từng trang.
4. Viết test spec sử dụng fixtures.
5. Chạy test trên Firefox, thu thập báo cáo.
6. Phân tích kết quả: phân biệt lỗi website / lỗi test / test không ổn định.
7. Ghi nhận vào báo cáo Excel và HTML.

## 2.5 Thiết kế testcase
Quy ước đặt tên: `TC_<MODULE>_<số thứ tự 3 chữ số>` (ví dụ `TC_SEARCH_001`, `TC_REGISTER_015`, `TC_CART_017`).

**Cấu trúc một test case trong báo cáo Excel:**
| Cột | Ý nghĩa |
|-----|---------|
| ID | Mã test case |
| Test Title | Mô tả mục tiêu kiểm thử |
| Test Input | Dữ liệu/đầu vào |
| Expect Results | Kết quả mong đợi |
| Test Results | Pass / Fail / Flaky |
| Error Level | Mức độ lỗi: N/A / Low / Medium / High |

**Kỹ thuật thiết kế áp dụng:**
| Kỹ thuật | Áp dụng cụ thể |
|----------|----------------|
| Phân vùng tương đương | Nhóm input hợp lệ/không hợp lệ cho email, số điện thoại |
| Phân tích giá trị biên | Mật khẩu 1 ký tự, chuỗi 256/300 ký tự, số lượng giỏ = 0/1 |
| Kiểm thử âm tính | Ký tự đặc biệt, để trống, toàn khoảng trắng, sai định dạng |
| Kiểm thử case-insensitive | "samsung" vs "saMsUNG" |
| Chuẩn hóa khoảng trắng | Từ khóa có khoảng trắng đầu/cuối |
| Kiểm thử accessibility | Accessible name của ô số lượng giỏ hàng |
| Xác minh đồng bộ UI–Server | So input UI với `cart.js` |

## 2.6 Lịch trình công việc (gợi ý)
| Tuần | Công việc |
|------|-----------|
| 1 | Nghiên cứu lý thuyết, khảo sát website, cài đặt môi trường |
| 2 | Thiết kế test case, xây dựng Page Object & fixtures |
| 3 | Viết test module Tìm kiếm và Giỏ hàng |
| 4 | Viết test module Đăng ký, chạy & gỡ lỗi |
| 5 | Tổng hợp kết quả, lập báo cáo Excel/HTML, viết tài liệu |

## 2.7 Yêu cầu về tài nguyên
- **Phần mềm:** Node.js, Playwright `@playwright/test` ^1.52.0, TypeScript ^5, dotenv; trình duyệt Firefox cài qua `npx playwright install`.
- **Phần cứng:** máy tính thông thường có kết nối Internet ổn định (test chạy trực tiếp trên website production mhm.vn).
- **Dữ liệu test:** file JSON trong `fixtures/` (`test-data.json`, `search-keywords.json`, `products-list.json`); email/số điện thoại sinh ngẫu nhiên cho module đăng ký.

## 2.8 Tổng kết chương 2
Chương 2 xác định yêu cầu, phạm vi, phân công, quy trình và phương pháp thiết kế test case cho ba module, làm cơ sở để hiện thực và chạy thực nghiệm ở Chương 3.

---

# CHƯƠNG 3. CÀI ĐẶT VÀ THỰC NGHIỆM VỚI CÔNG CỤ PLAYWRIGHT

## 3.1 Cài đặt công cụ
```bash
# 1. Cài dependencies
npm install

# 2. Cài trình duyệt
npx playwright install firefox

# 3. Chạy toàn bộ test
npm test

# 4. Chạy theo module
npm run test:search
npm run test:cart
npx playwright test tests/register

# 5. Xem báo cáo HTML
npm run report
```

**Cấu trúc thư mục thực tế:**
```
kiemthu/
├── tests/
│   ├── search/search-basic.spec.ts      # 28 TC (TC_SEARCH_001-028)
│   ├── register/register-basic.spec.ts  # 30 TC (TC_REGISTER_001-030)
│   └── cart/cart-basic.spec.ts          # 18 TC (TC_CART_001-018)
├── pages/
│   ├── BasePage.ts        # Lớp cha: goto, getTitle, waitForLoad...
│   ├── HomePage.ts        # Trang chủ: tìm kiếm, icon giỏ hàng
│   ├── SearchPage.ts      # Trang kết quả tìm kiếm
│   ├── RegisterPage.ts    # Trang đăng ký
│   └── CartPage.ts        # Trang giỏ hàng + gọi API .js
├── fixtures/
│   ├── custom-fixtures.ts # test.extend tiêm Page Object
│   ├── test-data.json
│   ├── search-keywords.json
│   └── products-list.json
├── utils/
│   ├── helpers.ts         # parsePrice, getTextContent, scroll...
│   └── constants.ts       # BASE_URL, URLS, TIMEOUTS, KEYWORDS
├── playwright.config.ts
├── playwright-report/     # Báo cáo HTML
├── test-results/          # Ảnh, video, trace khi chạy
└── excel_report/          # Báo cáo Excel tổng hợp
```

## 3.2 Xây dựng Testcase với Playwright

### 3.2.1 Page Object Model
Mỗi trang được mô hình hóa thành một lớp kế thừa `BasePage`, đóng gói locator và hành động. Ví dụ `CartPage` đóng gói cả thao tác UI lẫn gọi API:
```typescript
// Gọi API nội bộ để dựng dữ liệu, không phụ thuộc thao tác chuột
async addProductByVariantId(variantId: string, quantity = 1) {
  return this.page.request.post(`${BASE_URL}/cart/add.js`, {
    form: { id: variantId, quantity: String(quantity) },
  });
}

// Xác minh trạng thái thật của giỏ hàng
async getCartJson() {
  const res = await this.page.request.get(`${BASE_URL}/cart.js`);
  return res.json(); // { item_count, total_price, items[] }
}
```

### 3.2.2 Custom Fixtures
`fixtures/custom-fixtures.ts` dùng `test.extend` để tiêm sẵn `homePage`, `searchPage`, `registerPage`, `cartPage`, giúp test gọn và nhất quán:
```typescript
export const test = base.extend<PageFixtures>({
  cartPage: async ({ page }, use) => { await use(new CartPage(page)); },
  registerPage: async ({ page }, use) => { await use(new RegisterPage(page)); },
  // ...
});
```

### 3.2.3 Ví dụ test case tiêu biểu
**Tìm kiếm (kiểm tra mọi kết quả chứa từ khóa):**
```typescript
test('TC_SEARCH_001: Tìm kiếm với từ khóa "samsung"', async ({ page }) => {
  await searchPage.searchFromUI('samsung');
  await expect(page).toHaveURL(/\/search/);
  expect(await searchPage.hasResults()).toBeTruthy();
  for (const name of await searchPage.getAllProductNames()) {
    expect(name.toLowerCase()).toContain('samsung');
  }
});
```

**Đăng ký (xác minh validation của trình duyệt):**
```typescript
test('TC_REGISTER_019: Mật khẩu 1 ký tự phải bị validate', async ({ page, registerPage }) => {
  await fillAllValid(registerPage, { password: 'a' });
  const message = await getValidationMessage(page, '#password');
  expect(message).toBeTruthy();
});
```

**Giỏ hàng (xác minh đồng bộ UI–Server):**
```typescript
test('TC_CART_016: Tăng số lượng trên UI phải đồng bộ vào giỏ hàng server', async ({ cartPage }) => {
  await cartPage.addProductByVariantId(IPHONE_17_PRO_MAX_VARIANT_ID, 1);
  await cartPage.open();
  await cartPage.clickPlusOnFirstItem();
  const cart = await cartPage.getCartJson();
  expect(cart.item_count).toBe(2);
});
```

## 3.3 Thực nghiệm

### 3.3.1 Mục tiêu thực nghiệm
- Chạy toàn bộ test trên Firefox và thu thập tỷ lệ Pass/Fail.
- Phân loại nguyên nhân thất bại: lỗi thật của website, hạn chế của test, hay test không ổn định.
- Lập báo cáo trực quan (HTML + Excel).

### 3.3.2 Kết quả thực nghiệm

**Module Tìm kiếm (Search) – 28 test case**
- Đa số PASS. Một số case FAIL phản ánh hành vi thật của website:
  - `TC_SEARCH_007` (iphone), `TC_SEARCH_009` (đồng hồ): kết quả tìm kiếm chưa khớp 100% kỳ vọng → Medium.
  - `TC_SEARCH_011`, `TC_SEARCH_022`: kiểm tra không lộ truy vấn nội bộ trên giao diện/URL → High (rủi ro lộ thông tin nội bộ).
  - `TC_SEARCH_013`: chưa chặn tìm kiếm chuỗi chỉ chứa khoảng trắng → Medium.
  - `TC_SEARCH_027`, `TC_SEARCH_028` (1 ký tự "i"/"p"): kết quả không đảm bảo mọi tên chứa ký tự → Low.

**Module Đăng ký (Register) – 30 test case**
- 21 PASS, 9 FAIL. Các case FAIL chủ yếu là **lỗi thật của website do thiếu kiểm tra dữ liệu đầu vào** và một số ràng buộc nghiệp vụ chưa được xử lý:

| ID | Kịch bản | Kết quả | Mức lỗi |
|----|----------|---------|---------|
| TC_REGISTER_014 | Mật khẩu vượt quá độ dài cho phép (256 ký tự) | Fail | Medium |
| TC_REGISTER_015 | Họ là số | Fail | Medium |
| TC_REGISTER_016 | Tên là số | Fail | Medium |
| TC_REGISTER_017 | Họ chỉ chứa khoảng trắng | Fail | Medium |
| TC_REGISTER_018 | Tên chỉ chứa khoảng trắng | Fail | Medium |
| TC_REGISTER_022 | Mật khẩu vượt quá độ dài cho phép (300 ký tự) | Fail | Medium |
| TC_REGISTER_023 | Số điện thoại đã tồn tại trong hệ thống | Fail | High |
| TC_REGISTER_024 | Họ chứa ký tự đặc biệt | Fail | Low |
| TC_REGISTER_025 | Tên chứa ký tự đặc biệt | Fail | Low |

→ Form đăng ký chấp nhận họ/tên toàn khoảng trắng, toàn số hoặc chứa ký tự đặc biệt, mật khẩu quá ngắn/quá dài, và chưa chặn số điện thoại trùng, tức **thiếu ràng buộc validate**. Đây là các lỗi mà kiểm thử tự động phát hiện được nhưng kiểm thử thủ công dễ bỏ qua. Ngoài ra bộ test còn bao phủ các kịch bản an toàn như chống XSS (TC_REGISTER_029) và chống double-submit (TC_REGISTER_030).

**Module Giỏ hàng (Cart) – 18 test case**
- 15 PASS, 2 FAIL, 1 FLAKY:

| ID | Kịch bản | Kết quả | Mức lỗi | Nguyên nhân |
|----|----------|---------|---------|-------------|
| TC_CART_016 | Đồng bộ số lượng UI → server | Flaky | Low | Độ trễ gọi API cập nhật; chạy lại thì pass |
| TC_CART_017 | Nút thanh toán có href tới /checkout | Fail | Medium | Nút dùng `onclick="goToCheckout()"`, không có `href` |
| TC_CART_018 | Ô số lượng có accessible name | Fail | Medium | Input thiếu `aria-label`/`label` cho screen reader |

### 3.3.3 Bằng chứng kết quả
Sau khi chạy, dự án tự sinh:
- **HTML report** (`playwright-report/index.html`): tổng quan pass/fail, thời gian chạy.
- **Ảnh chụp màn hình & video** (`test-results/...`): minh chứng trạng thái khi test chạy/thất bại.
- **Trace** (`trace.zip`): tái hiện từng bước để gỡ lỗi (`npx playwright show-trace <file>`).
- **Báo cáo Excel** (`excel_report/`): tổng hợp test case theo định dạng ID / Title / Input / Expect / Result / Error Level.

## 3.4 Đánh giá tổng thể
- Bộ test bao phủ tốt các luồng cốt lõi và nhiều ca biên/âm tính.
- Phát hiện được lỗi thật có giá trị: thiếu validate form đăng ký, nút thanh toán không dùng liên kết chuẩn, thiếu nhãn accessibility.
- Mô hình POM + fixtures giúp code gọn, dễ bảo trì và mở rộng.
- **Điểm cần cải thiện:**
  - Xử lý test flaky (TC_CART_016) bằng cơ chế chờ thông minh (poll API) thay vì `waitForTimeout` cố định.
  - Một vài test (TC_CART_017) nên kiểm tra hành vi điều hướng thực tế (click → đổi URL) thay vì kiểm tra `href`.
  - Mở rộng chạy đa trình duyệt (thêm Chromium) để tăng độ bao phủ.
  - Cân nhắc môi trường staging để kiểm thử luồng đăng ký hoàn tất (vượt reCAPTCHA).

---

# KẾT LUẬN

## Kết luận chung
Dự án đã xây dựng thành công bộ kiểm thử tự động cho website mhm.vn bằng Playwright và TypeScript, áp dụng mô hình Page Object Model và Custom Fixtures. Bộ test gồm 76 test case cho ba module Tìm kiếm, Đăng ký và Giỏ hàng, chạy ổn định trên Firefox và sinh báo cáo trực quan. Quan trọng hơn, bộ test phát hiện được các lỗi thực tế của website (thiếu validate dữ liệu đăng ký, nút thanh toán không dùng liên kết chuẩn, ô nhập thiếu nhãn accessibility), chứng minh giá trị thực tiễn của kiểm thử tự động.

## Hướng phát triển
- Mở rộng độ bao phủ cho module Tìm kiếm và Giỏ hàng tương tự mức chi tiết của module Đăng ký (30 case).
- Thêm cấu hình đa trình duyệt (Chromium, WebKit) và thiết bị di động.
- Tích hợp CI/CD (GitHub Actions) để chạy test tự động sau mỗi thay đổi.
- Khắc phục test flaky và tách dữ liệu test ra cấu hình môi trường (staging).
- Tự động xuất báo cáo tổng hợp (gộp HTML report và Excel).

---

# PHỤ LỤC

## A. Bảng tổng hợp số lượng test case
| Module | File | Số TC | Khoảng ID |
|--------|------|-------|-----------|
| Tìm kiếm | `tests/search/search-basic.spec.ts` | 28 | TC_SEARCH_001–028 |
| Đăng ký | `tests/register/register-basic.spec.ts` | 30 | TC_REGISTER_001–030 |
| Giỏ hàng | `tests/cart/cart-basic.spec.ts` | 18 | TC_CART_001–018 |
| **Tổng** | | **76** | |

### A.1 Chi tiết 30 test case module Đăng ký (TC_REGISTER_001–030)
| ID | Kịch bản | Kết quả dự kiến |
|----|----------|------------------|
| TC_REGISTER_001 | Mở trang đăng ký và hiển thị form | Pass |
| TC_REGISTER_002 | Không điền thông tin nào (tất cả trường rỗng) | Pass |
| TC_REGISTER_003 | Không điền Họ | Pass |
| TC_REGISTER_004 | Không điền Tên | Pass |
| TC_REGISTER_005 | Không điền Số điện thoại | Pass |
| TC_REGISTER_006 | Không điền Email | Pass |
| TC_REGISTER_007 | Không điền Mật khẩu | Pass |
| TC_REGISTER_008 | Số điện thoại chứa chữ cái | Pass |
| TC_REGISTER_009 | Số điện thoại chứa ký tự đặc biệt | Pass |
| TC_REGISTER_010 | Email sai định dạng "abc@" | Pass |
| TC_REGISTER_011 | Email không có ký tự @ | Pass |
| TC_REGISTER_012 | Email có dấu chấm ở cuối tên miền | Pass |
| TC_REGISTER_013 | Email có khoảng trắng ở đầu được browser trim | Pass |
| TC_REGISTER_014 | Mật khẩu vượt quá độ dài cho phép (256 ký tự) | Fail (Medium) |
| TC_REGISTER_015 | Họ là số | Fail (Medium) |
| TC_REGISTER_016 | Tên là số | Fail (Medium) |
| TC_REGISTER_017 | Họ chỉ chứa khoảng trắng | Fail (Medium) |
| TC_REGISTER_018 | Tên chỉ chứa khoảng trắng | Fail (Medium) |
| TC_REGISTER_019 | Mật khẩu 1 ký tự (quá ngắn) | Pass |
| TC_REGISTER_020 | Không lộ lỗi hệ thống khi validate form | Pass |
| TC_REGISTER_021 | Họ và Tên vượt quá độ dài cho phép (300 ký tự) | Pass |
| TC_REGISTER_022 | Mật khẩu vượt quá độ dài cho phép (300 ký tự) | Fail (Medium) |
| TC_REGISTER_023 | Số điện thoại đã tồn tại trong hệ thống | Fail (High) |
| TC_REGISTER_024 | Họ chứa ký tự đặc biệt | Fail (Low) |
| TC_REGISTER_025 | Tên chứa ký tự đặc biệt | Fail (Low) |
| TC_REGISTER_026 | Số điện thoại ngắn hơn độ dài tối thiểu | Pass |
| TC_REGISTER_027 | Số điện thoại dài hơn độ dài tối đa | Pass |
| TC_REGISTER_028 | Email vượt quá độ dài cho phép | Pass |
| TC_REGISTER_029 | Chèn mã XSS vào trường Họ/Tên (không được thực thi) | Pass |
| TC_REGISTER_030 | Nhấn nút Đăng ký liên tục 2 lần (chỉ tạo 1 tài khoản) | Pass |

## B. Danh mục viết tắt
| Viết tắt | Giải thích |
|----------|-----------|
| E2E | End-to-End (kiểm thử đầu-cuối) |
| POM | Page Object Model |
| TC | Test Case (ca kiểm thử) |
| UI | User Interface (giao diện người dùng) |
| API | Application Programming Interface |
| CI/CD | Continuous Integration / Continuous Delivery |
| XSS | Cross-Site Scripting |

## C. Lệnh thường dùng
| Lệnh | Chức năng |
|------|-----------|
| `npm test` | Chạy toàn bộ test |
| `npm run test:search` | Chạy module Tìm kiếm |
| `npm run test:cart` | Chạy module Giỏ hàng |
| `npx playwright test tests/register` | Chạy module Đăng ký |
| `npm run report` | Mở báo cáo HTML |
| `npx playwright show-trace <file>` | Xem trace gỡ lỗi |

> **Ghi chú về số liệu:** File `README.md` của dự án nêu mục tiêu 150 test case (3 module × 50). Tài liệu này thống kê theo bộ test case **đã hiện thực trong code**: Tìm kiếm 28, Đăng ký 30, Giỏ hàng 18 — tổng 76 case. Module Đăng ký đã được bổ sung đầy đủ 30 case (TC_REGISTER_001–030) trong file `tests/register/register-basic.spec.ts`, khớp với báo cáo Excel `Kiemthu register full.xlsx`. 10 case mở rộng (TC_REGISTER_021–030: độ dài tối đa của họ/tên, mật khẩu và email; số điện thoại trùng/quá ngắn/quá dài; ký tự đặc biệt trong họ/tên; chống XSS; chống double-submit) đã được thêm vào code và Playwright nhận diện đủ 30 case khi chạy `npx playwright test tests/register --list`.
