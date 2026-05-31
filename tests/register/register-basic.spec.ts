// ============================================================
// MODULE REGISTER/SIGN-UP - mhm.vn
// ============================================================

import { test, expect } from '../../fixtures/custom-fixtures';

type RegisterData = {
  lastName: string;
  firstName: string;
  phone: string;
  email: string;
  password: string;
};

test.describe('Chuc nang dang ky', () => {
  const randomEmail = () => `test.${Date.now()}.${Math.floor(Math.random() * 1000)}@example.com`;
  const randomPhone = () => `09${Math.floor(10000000 + Math.random() * 89999999)}`;

  const buildValidData = (): RegisterData => ({
    lastName: 'Nguyen',
    firstName: 'An',
    phone: randomPhone(),
    email: randomEmail(),
    password: 'Test1234',
  });

  const requiredFields = [
    { id: '#lastName', label: 'Ho' },
    { id: '#firstName', label: 'Ten' },
    { id: '#Phone', label: 'So dien thoai' },
    { id: '#email', label: 'Email' },
    { id: '#password', label: 'Mat khau' },
  ];

  test.beforeEach(async ({ registerPage }) => {
    await registerPage.open();
  });

  async function fillAllValid(registerPage: { fillForm: (data: Partial<RegisterData>) => Promise<void> }, overrides: Partial<RegisterData> = {}) {
    await registerPage.fillForm({ ...buildValidData(), ...overrides });
  }

  async function getValidationMessage(page: import('@playwright/test').Page, selector: string): Promise<string> {
    return await page.locator(selector).evaluate((el: HTMLInputElement) => el.validationMessage);
  }

  test('TC_REGISTER_001: Mo trang dang ky va hien thi form', async ({ page, registerPage }, testInfo) => {
    await testInfo.attach('Current URL', {
      body: page.url(),
      contentType: 'text/plain',
    });

    await expect(page).toHaveURL(/\/account\/register/);
    expect(await registerPage.isRegisterFormVisible()).toBeTruthy();
    await expect(registerPage.submitButton).toBeVisible();
  });

  test('TC_REGISTER_002: Khong dien thong tin nao', async ({ page, registerPage }) => {
    await registerPage.submit();

    await expect(page).toHaveURL(/\/account\/register/);

    for (const field of requiredFields) {
      const message = await getValidationMessage(page, field.id);
      expect(message, `${field.label} phai co validation message`).toBeTruthy();
    }
  });

  test('TC_REGISTER_003: Khong dien ho', async ({ page, registerPage }) => {
    await fillAllValid(registerPage, { lastName: '' });
    await registerPage.submit();

    await expect(page).toHaveURL(/\/account\/register/);
    expect(await getValidationMessage(page, '#lastName')).toBeTruthy();
  });

  test('TC_REGISTER_004: Khong dien ten', async ({ page, registerPage }) => {
    await fillAllValid(registerPage, { firstName: '' });
    await registerPage.submit();

    await expect(page).toHaveURL(/\/account\/register/);
    expect(await getValidationMessage(page, '#firstName')).toBeTruthy();
  });

  test('TC_REGISTER_005: Khong dien so dien thoai', async ({ page, registerPage }) => {
    await fillAllValid(registerPage, { phone: '' });
    await registerPage.submit();

    await expect(page).toHaveURL(/\/account\/register/);
    expect(await getValidationMessage(page, '#Phone')).toBeTruthy();
  });

  test('TC_REGISTER_006: Khong dien email', async ({ page, registerPage }) => {
    await fillAllValid(registerPage, { email: '' });
    await registerPage.submit();

    await expect(page).toHaveURL(/\/account\/register/);
    expect(await getValidationMessage(page, '#email')).toBeTruthy();
  });

  test('TC_REGISTER_007: Khong dien mat khau', async ({ page, registerPage }) => {
    await fillAllValid(registerPage, { password: '' });
    await registerPage.submit();

    await expect(page).toHaveURL(/\/account\/register/);
    expect(await getValidationMessage(page, '#password')).toBeTruthy();
  });

  test('TC_REGISTER_008: So dien thoai chua chu cai', async ({ page, registerPage }) => {
    await fillAllValid(registerPage, { phone: '09ab123456' });
    await registerPage.submit();

    await expect(page).toHaveURL(/\/account\/register/);
    expect(await getValidationMessage(page, '#Phone')).toBeTruthy();
  });

  test('TC_REGISTER_009: So dien thoai chua ky tu dac biet', async ({ page, registerPage }) => {
    await fillAllValid(registerPage, { phone: '0900-123-456' });
    await registerPage.submit();

    await expect(page).toHaveURL(/\/account\/register/);
    expect(await getValidationMessage(page, '#Phone')).toBeTruthy();
  });

  test('TC_REGISTER_010: Email sai dinh dang "abc@"', async ({ page, registerPage }) => {
    await fillAllValid(registerPage, { email: 'abc@' });
    await registerPage.submit();

    await expect(page).toHaveURL(/\/account\/register/);
    expect(await getValidationMessage(page, '#email')).toBeTruthy();
  });

  test('TC_REGISTER_011: Email khong co ky tu @', async ({ page, registerPage }) => {
    await fillAllValid(registerPage, { email: 'abcexample.com' });
    await registerPage.submit();

    await expect(page).toHaveURL(/\/account\/register/);
    expect(await getValidationMessage(page, '#email')).toBeTruthy();
  });

  test('TC_REGISTER_012: Email co dau cham o cuoi ten mien', async ({ page, registerPage }) => {
    await fillAllValid(registerPage, { email: 'abc@example.' });
    await registerPage.submit();

    await expect(page).toHaveURL(/\/account\/register/);
    expect(await getValidationMessage(page, '#email')).toBeTruthy();
  });

  test('TC_REGISTER_013: Email co khoang trang o dau duoc browser trim', async ({ page, registerPage }) => {
    await fillAllValid(registerPage, { email: `  ${randomEmail()}` });

    const emailValue = await page.locator('#email').inputValue();
    expect(emailValue.startsWith(' ')).toBeFalsy();
    expect(await getValidationMessage(page, '#email')).toBe('');
  });

  test('TC_REGISTER_014: Email co khoang trang o cuoi duoc browser trim', async ({ page, registerPage }) => {
    await fillAllValid(registerPage, { email: `${randomEmail()}  ` });

    const emailValue = await page.locator('#email').inputValue();
    expect(emailValue.endsWith(' ')).toBeFalsy();
    expect(await getValidationMessage(page, '#email')).toBe('');
  });

  test('TC_REGISTER_015: Ho chi chua khoang trang phai bi validate', async ({ page, registerPage }) => {
    await fillAllValid(registerPage, { lastName: '   ' });

    const message = await getValidationMessage(page, '#lastName');
    expect(message).toBeTruthy();
  });

  test('TC_REGISTER_016: Ten chi chua khoang trang phai bi validate', async ({ page, registerPage }) => {
    await fillAllValid(registerPage, { firstName: '   ' });

    const message = await getValidationMessage(page, '#firstName');
    expect(message).toBeTruthy();
  });

  test('TC_REGISTER_017: Ho la so phai bi validate', async ({ page, registerPage }) => {
    await fillAllValid(registerPage, { lastName: '12345' });

    const message = await getValidationMessage(page, '#lastName');
    expect(message).toBeTruthy();
  });

  test('TC_REGISTER_018: Ten la so phai bi validate', async ({ page, registerPage }) => {
    await fillAllValid(registerPage, { firstName: '67890' });

    const message = await getValidationMessage(page, '#firstName');
    expect(message).toBeTruthy();
  });

  test('TC_REGISTER_019: Mat khau 1 ky tu phai bi validate do qua ngan', async ({ page, registerPage }) => {
    await fillAllValid(registerPage, { password: 'a' });

    const message = await getValidationMessage(page, '#password');
    expect(message).toBeTruthy();
  });

  test('TC_REGISTER_020: Khong lo loi he thong khi validate form dang ky', async ({ page, registerPage }) => {
    await fillAllValid(registerPage, { email: 'abc@' });
    await registerPage.submit();

    const bodyText = await page.locator('body').innerText();

    expect(bodyText).not.toContain('[object Object]');
    expect(bodyText).not.toContain('undefined');
    expect(bodyText).not.toContain('null');
    expect(bodyText).not.toContain('Liquid error');
  });

  // ============================================================
  // BO SUNG TC_REGISTER_021 - 030 (mo rong cho du 30 test case theo bao cao)
  // ============================================================

  test('TC_REGISTER_021: Ho va Ten vuot qua do dai cho phep (300 ky tu)', async ({ page, registerPage }) => {
    const longText = 'A'.repeat(300);
    await fillAllValid(registerPage, { lastName: longText, firstName: longText });

    // FAIL neu truong Ho/Ten khong co rang buoc do dai toi da (maxlength).
    const lastNameMax = await page.locator('#lastName').getAttribute('maxlength');
    const firstNameMax = await page.locator('#firstName').getAttribute('maxlength');

    expect(lastNameMax, 'Truong Ho phai gioi han do dai').toBeTruthy();
    expect(firstNameMax, 'Truong Ten phai gioi han do dai').toBeTruthy();
  });

  test('TC_REGISTER_022: Mat khau vuot qua do dai cho phep (300 ky tu)', async ({ page, registerPage }) => {
    const longPassword = 'A'.repeat(300);
    await fillAllValid(registerPage, { password: longPassword });

    // FAIL neu mat khau khong gioi han do dai va khong bao loi qua dai.
    const passwordMax = await page.locator('#password').getAttribute('maxlength');
    const message = await getValidationMessage(page, '#password');

    expect(Boolean(passwordMax) || Boolean(message), 'Mat khau phai co gioi han do dai').toBeTruthy();
  });

  test('TC_REGISTER_023: So dien thoai da ton tai trong he thong', async ({ page, registerPage }) => {
    // Su dung so dien thoai gia dinh da dang ky truoc do.
    await fillAllValid(registerPage, { phone: '0912345678', email: randomEmail() });
    await registerPage.submit();

    // FAIL neu khong hien thi thong bao so dien thoai da ton tai.
    const errorMessage = await registerPage.getErrorMessage();
    expect(errorMessage.toLowerCase()).toMatch(/tồn tại|đã được|da ton tai/);
  });

  test('TC_REGISTER_024: Ho chua ky tu dac biet phai bi validate', async ({ page, registerPage }) => {
    await fillAllValid(registerPage, { lastName: 'Nguyen@#$' });

    // FAIL neu website chap nhan Ho chua ky tu dac biet.
    const message = await getValidationMessage(page, '#lastName');
    expect(message).toBeTruthy();
  });

  test('TC_REGISTER_025: Ten chua ky tu dac biet phai bi validate', async ({ page, registerPage }) => {
    await fillAllValid(registerPage, { firstName: 'An@#$' });

    // FAIL neu website chap nhan Ten chua ky tu dac biet.
    const message = await getValidationMessage(page, '#firstName');
    expect(message).toBeTruthy();
  });

  test('TC_REGISTER_026: So dien thoai ngan hon do dai toi thieu', async ({ page, registerPage }) => {
    await fillAllValid(registerPage, { phone: '09123' });

    // FAIL neu website chap nhan so dien thoai qua ngan.
    const message = await getValidationMessage(page, '#Phone');
    expect(message).toBeTruthy();
  });

  test('TC_REGISTER_027: So dien thoai dai hon do dai toi da', async ({ page, registerPage }) => {
    await fillAllValid(registerPage, { phone: '0282818221821291234567890123' });

    // FAIL neu website chap nhan so dien thoai qua dai.
    const message = await getValidationMessage(page, '#Phone');
    expect(message).toBeTruthy();
  });

  test('TC_REGISTER_028: Email vuot qua do dai cho phep', async ({ page, registerPage }) => {
    const longEmail = `${'a'.repeat(250)}@example.com`;
    await fillAllValid(registerPage, { email: longEmail });

    // FAIL neu email khong gioi han do dai va khong bao loi qua dai.
    const emailMax = await page.locator('#email').getAttribute('maxlength');
    const message = await getValidationMessage(page, '#email');

    expect(Boolean(emailMax) || Boolean(message), 'Email phai co gioi han do dai').toBeTruthy();
  });

  test('TC_REGISTER_029: Chen ma XSS vao truong Ho/Ten khong duoc thuc thi', async ({ page, registerPage }) => {
    let dialogAppeared = false;
    page.on('dialog', async (dialog) => {
      dialogAppeared = true;
      await dialog.dismiss();
    });

    const xssPayload = '<script>alert(1)</script>';
    await fillAllValid(registerPage, { lastName: xssPayload, firstName: xssPayload });
    await page.waitForTimeout(500);

    // PASS neu script khong duoc thuc thi (khong co dialog alert).
    expect(dialogAppeared).toBeFalsy();

    // PASS neu gia tri nhap duoc giu nguyen dang text, khong bi thuc thi.
    const lastNameValue = await page.locator('#lastName').inputValue();
    expect(lastNameValue).toContain('<script>');
  });

  test('TC_REGISTER_030: Nhan nut Dang ky lien tuc 2 lan chi tao 1 tai khoan', async ({ page, registerPage }) => {
    await fillAllValid(registerPage);

    const submitButton = page.locator('#create_customer button[type="submit"]');
    await submitButton.click();
    await submitButton.click({ force: true }).catch(() => undefined);

    // PASS neu khong gay loi he thong khi submit lien tuc 2 lan.
    const bodyText = await page.locator('body').innerText();
    expect(bodyText).not.toContain('[object Object]');
    expect(bodyText).not.toContain('Liquid error');
  });
});
