// ============================================================
// MODULE REGISTER/SIGN-UP - mhm.vn
// ============================================================

import { test, expect } from '@playwright/test';
import { RegisterPage } from '../../pages/RegisterPage';

test.describe('Chức năng đăng ký', () => {
    let registerPage: RegisterPage;

    const randomEmail = () => `test.${Date.now()}@example.com`;
    const randomPhone = () => `09${Math.floor(10000000 + Math.random() * 88999999)}`;

    const buildValidData = () => ({
        lastName: 'Nguyen',
        firstName: 'An',
        phone: randomPhone(),
        email: randomEmail(),
        password: 'Test1234'
    });

    const fillAllValid = async (overrides: Partial<ReturnType<typeof buildValidData>> = {}) => {
        await registerPage.fillForm({ ...buildValidData(), ...overrides });
    };

    test.beforeEach(async ({ page }) => {
        registerPage = new RegisterPage(page);
        await page.goto('https://mhm.vn/account/register');
        await page.waitForLoadState('domcontentloaded');
    });

    test('TC_REGISTER_001: Không điền thông tin nào', async ({ page }, testInfo) => {
        await registerPage.submit();

        await testInfo.attach('screenshot', {
            body: await page.screenshot(),
            contentType: 'image/png'
        });

        // Vẫn ở trang register
        await expect(page).toHaveURL(/\/account\/register/);

        // Check tất cả 5 field required đều có validation message
        const fields = [
            { id: '#lastName', label: 'Họ' },
            { id: '#firstName', label: 'Tên' },
            { id: '#Phone', label: 'Số điện thoại' },
            { id: '#email', label: 'Email' },
            { id: '#password', label: 'Mật khẩu' },
        ];

        for (const field of fields) {
            const msg = await page
                .locator(field.id)
                .evaluate((el: HTMLInputElement) => el.validationMessage);
            expect(msg, `Field "${field.label}" phải có validation message`).toBeTruthy();
        }
    });

    test('TC_REGISTER_002: Không điền họ', async ({ page }, testInfo) => {
        await fillAllValid({ lastName: '' });
        await registerPage.submit();

        await testInfo.attach('Current URL', {
            body: page.url(),
            contentType: 'text/plain'
        });

        await expect(page).toHaveURL(/\/account\/register/);

        const lastNameValidation = await page
            .locator('#lastName')
            .evaluate((el: HTMLInputElement) => el.validationMessage);
        expect(lastNameValidation).toBeTruthy();
    });

    test('TC_REGISTER_003: Không điền tên', async ({ page }, testInfo) => {
        await fillAllValid({ firstName: '' });
        await registerPage.submit();

        await testInfo.attach('Current URL', {
            body: page.url(),
            contentType: 'text/plain'
        });

        await expect(page).toHaveURL(/\/account\/register/);

        const firstNameValidation = await page
            .locator('#firstName')
            .evaluate((el: HTMLInputElement) => el.validationMessage);
        expect(firstNameValidation).toBeTruthy();
    });

    test('TC_REGISTER_004: Không điền số điện thoại', async ({ page }, testInfo) => {
        await fillAllValid({ phone: '' });
        await registerPage.submit();

        await testInfo.attach('Current URL', {
            body: page.url(),
            contentType: 'text/plain'
        });

        await expect(page).toHaveURL(/\/account\/register/);

        const phoneValidation = await page
            .locator('#Phone')
            .evaluate((el: HTMLInputElement) => el.validationMessage);
        expect(phoneValidation).toBeTruthy();
    });

    test('TC_REGISTER_005: Số điện thoại chứa ký tự chữ', async ({ page }, testInfo) => {
        await fillAllValid({ phone: '09ab123' });
        await registerPage.submit();

        await testInfo.attach('Current URL', {
            body: page.url(),
            contentType: 'text/plain'
        });

        await expect(page).toHaveURL(/\/account\/register/);

        const phoneValidation = await page
            .locator('#Phone')
            .evaluate((el: HTMLInputElement) => el.validationMessage);
        expect(phoneValidation).toBeTruthy();
    });

    test('TC_REGISTER_006: Không điền email', async ({ page }, testInfo) => {
        await fillAllValid({ email: '' });
        await registerPage.submit();

        await testInfo.attach('Current URL', {
            body: page.url(),
            contentType: 'text/plain'
        });

        await expect(page).toHaveURL(/\/account\/register/);

        const emailValidation = await page
            .locator('#email')
            .evaluate((el: HTMLInputElement) => el.validationMessage);
        expect(emailValidation).toBeTruthy();
    });

    test('TC_REGISTER_007: Email sai định dạng "abc@"', async ({ page }, testInfo) => {
        await fillAllValid({ email: 'abc@' });
        await registerPage.submit();

        await testInfo.attach('Current URL', {
            body: page.url(),
            contentType: 'text/plain'
        });

        await expect(page).toHaveURL(/\/account\/register/);

        const emailValidation = await page
            .locator('#email')
            .evaluate((el: HTMLInputElement) => el.validationMessage);
        expect(emailValidation).toBeTruthy();
    });

    test('TC_REGISTER_008: Email có khoảng trắng ở đầu', async ({ page }, testInfo) => {
        await fillAllValid({ email: `  ${randomEmail()}` });
        await registerPage.submit();

        await testInfo.attach('Current URL', {
            body: page.url(),
            contentType: 'text/plain'
        });
 // Chờ navigation hoàn tất sau khi server xử lý
    await page.waitForURL(/\/account/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/account/);
    await expect(page).not.toHaveURL(/\/account\/register/)
    });

    test('TC_REGISTER_009: Email có khoảng trắng ở cuối', async ({ page }, testInfo) => {
        await fillAllValid({ email: `${randomEmail()}  ` });
        await registerPage.submit();

        await testInfo.attach('Current URL', {
            body: page.url(),
            contentType: 'text/plain'
        });

     // Chờ navigation hoàn tất sau khi server xử lý
    await page.waitForURL(/\/account/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/account/);
    await expect(page).not.toHaveURL(/\/account\/register/)
    });

    test('TC_REGISTER_010: Không điền mật khẩu', async ({ page }, testInfo) => {
        await fillAllValid({ password: '' });
        await registerPage.submit();

        await testInfo.attach('Current URL', {
            body: page.url(),
            contentType: 'text/plain'
        });

        await expect(page).toHaveURL(/\/account\/register/);

        const passwordValidation = await page
            .locator('#password')
            .evaluate((el: HTMLInputElement) => el.validationMessage);
        expect(passwordValidation).toBeTruthy();
    });

    test('TC_REGISTER_011: Mật khẩu có chữ hoa', async ({ page }, testInfo) => {
        await fillAllValid({ password: 'Abc12345' });
        await registerPage.submit();

        await testInfo.attach('Current URL', {
            body: page.url(),
            contentType: 'text/plain'
        });

 // Chờ navigation hoàn tất sau khi server xử lý
    await page.waitForURL(/\/account/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/account/);
    await expect(page).not.toHaveURL(/\/account\/register/)
    });

    test('TC_REGISTER_012: Mật khẩu 1 ký tự', async ({ page }, testInfo) => {
        await fillAllValid({ password: 'a' });
        await registerPage.submit();

        await testInfo.attach('Current URL', {
            body: page.url(),
            contentType: 'text/plain'
        });

        // Chờ navigation hoàn tất sau khi server xử lý
    await page.waitForURL(/\/account/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/account/);
    await expect(page).not.toHaveURL(/\/account\/register/)

        const bodyText = await page.locator('body').textContent();
        expect(bodyText ?? '').toContain('Mật khẩu quá ngắn');
    });

    test('TC_REGISTER_013: Mật khẩu siêu dài', async ({ page }, testInfo) => {
        const longPassword = 'a'.repeat(256);

        await fillAllValid({ password: longPassword });
        await registerPage.submit();

        await testInfo.attach('Current URL', {
            body: page.url(),
            contentType: 'text/plain'
        });

 // Chờ navigation hoàn tất sau khi server xử lý
    await page.waitForURL(/\/account/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/account/);
    await expect(page).not.toHaveURL(/\/account\/register/)
    });

    test('TC_REGISTER_014: Họ là số', async ({ page }, testInfo) => {
        await fillAllValid({ lastName: '12345' });
        await registerPage.submit();

        await testInfo.attach('Current URL', {
            body: page.url(),
            contentType: 'text/plain'
        });

 // Chờ navigation hoàn tất sau khi server xử lý
    await page.waitForURL(/\/account/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/account\/register/)
    });

    test('TC_REGISTER_015: Tên là số', async ({ page }, testInfo) => {
        await fillAllValid({ firstName: '67890' });
        await registerPage.submit();

        await testInfo.attach('Current URL', {
            body: page.url(),
            contentType: 'text/plain'
        });

 // Chờ navigation hoàn tất sau khi server xử lý
    await page.waitForURL(/\/account/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/account\/register/)
    });

    test('TC_REGISTER_016: Họ là khoảng trắng', async ({ page }, testInfo) => {
        await fillAllValid({ lastName: '    ' });
        await registerPage.submit();

        await testInfo.attach('Current URL', {
            body: page.url(),
            contentType: 'text/plain'
        });

 // Chờ navigation hoàn tất sau khi server xử lý
    await page.waitForURL(/\/account/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/account\/register/)
    });

    test('TC_REGISTER_017: Tên là khoảng trắng', async ({ page }, testInfo) => {
        await fillAllValid({ firstName: '    ' });
        await registerPage.submit();

        await testInfo.attach('Current URL', {
            body: page.url(),
            contentType: 'text/plain'
        });

 // Chờ navigation hoàn tất sau khi server xử lý
    await page.waitForURL(/\/account/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/account\/register/)
    });

    test('TC_REGISTER_018: Đăng ký thành công với thông tin hợp lệ', async ({ page }, testInfo) => {
        await fillAllValid({
            email: `test.${Date.now()}@example.com`,
            phone: `09${Math.floor(10000000 + Math.random() * 89999999)}`
        });
        await registerPage.submit();

        await testInfo.attach('Current URL', {
            body: page.url(),
            contentType: 'text/plain'
        });

        // Chờ navigation hoàn tất sau khi server xử lý
        await page.waitForURL(/\/account/, { timeout: 10000 });
        await expect(page).toHaveURL(/\/account/);
        await expect(page).not.toHaveURL(/\/account\/register/);
    });

    test('TC_REGISTER_019: Email đã tồn tại', async ({ page }, testInfo) => {
        await fillAllValid({ email: 'danghung2004@gmail.com' });
        await registerPage.submit();

        await testInfo.attach('Current URL', {
            body: page.url(),
            contentType: 'text/plain'
        });

        await expect(page).toHaveURL(/\/account\/register/);

        const errorText = await registerPage.getErrorMessage();
        expect(errorText.length).toBeGreaterThan(0);
    });
});
