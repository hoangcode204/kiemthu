// ============================================================
// CUSTOM FIXTURES - Tái sử dụng Page Objects qua test.extend()
// Giúp các test file không cần khởi tạo page object thủ công
// ============================================================

import { test as base, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { SearchPage } from '../pages/SearchPage';
import { RegisterPage } from '../pages/RegisterPage';

// Định nghĩa kiểu cho các fixture
type PageFixtures = {
  homePage: HomePage;
  searchPage: SearchPage;
  registerPage: RegisterPage;
};

// Mở rộng test với các page object sẵn sàng dùng
export const test = base.extend<PageFixtures>({
  // Fixture: homePage - tự động mở trang chủ trước mỗi test
  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await homePage.open();
    await use(homePage);
  },

  // Fixture: searchPage - chỉ khởi tạo, không tự navigate
  searchPage: async ({ page }, use) => {
    await use(new SearchPage(page));
  },

  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },

});

// Re-export expect để dùng cùng với custom test
export { expect };
