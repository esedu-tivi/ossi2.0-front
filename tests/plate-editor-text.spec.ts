import { test, expect } from "@playwright/test";

test.describe("Teacher dashboard", () => {
  test.beforeEach(async ({ page }) => {
    // Login and reload website
    await page.goto("http://localhost:5174/");
    await page.getByRole("button", { name: "Kirjaudu Sisään" }).click();
    await page.waitForTimeout(5000);
    await page.reload();
    await page.waitForTimeout(5000);
    // Change to "teacher" role
    await page.locator('button[aria-haspopup="menu"]').click();
    await page.getByRole("menuitem", { name: "Vaihda roolia" }).click();
    await page.getByRole("button", { name: "projektit" }).click();
  });

  test("Project can be created", async ({ page }, testInfo) => {
    // Make project
    await page.getByRole("button", { name: "Lisää Projekti" }).first().click();
    // Name project
    await page
      .getByRole("textbox", { name: "Projektin Nimi" })
      .fill("REGRESSION TEST: TITLE");

    // Fill project description with every possible text type
    await page.locator('[data-slate-editor="true"]').nth(0).click();

    // H1
    await page.locator('button[title="H1"]').nth(0).click();
    await page.keyboard.type("REGRESSION TEST: H1");
    await page.keyboard.press("Enter");

    // H2
    await page.locator('button[title="H2"]').nth(0).click();
    await page.keyboard.type("REGRESSION TEST: H2");
    await page.keyboard.press("Enter");

    // H3
    await page.locator('button[title="H3"]').nth(0).click();
    await page.keyboard.type("REGRESSION TEST: H3");
    await page.keyboard.press("Enter");
    await page.locator('button[title="H3"]').nth(0).click();

    // Bold
    await page.locator('button[title="Bold"]').nth(0).click();
    await page.keyboard.type("REGRESSION TEST: Bold");
    await page.keyboard.press("Enter");
    await page.locator('button[title="Bold"]').nth(0).click();

    // Italic
    await page.locator('button[title="Italic"]').nth(0).click();
    await page.keyboard.type("REGRESSION TEST: Italic");
    await page.keyboard.press("Enter");
    await page.locator('button[title="Italic"]').nth(0).click();

    // Underline
    await page.locator('button[title="Underline"]').nth(0).click();
    await page.keyboard.type("REGRESSION TEST: Underlined");
    await page.keyboard.press("Enter");
    await page.locator('button[title="Underline"]').nth(0).click();

    // List
    await page.locator('button[title="List"]').nth(0).click();
    await page.keyboard.type("REGRESSION TEST: List 1");
    await page.keyboard.press("Enter");
    await page.keyboard.type("REGRESSION TEST: List 2");
    await page.keyboard.press("Enter");
    await page.locator('button[title="List"]').nth(0).click();

    // Numbered list
    await page.locator('button[title="Numbered list"]').nth(0).click();
    await page.keyboard.type("REGRESSION TEST: Numbered list 1");
    await page.keyboard.press("Enter");
    await page.keyboard.type("REGRESSION TEST: Numbered list 2");
    await page.keyboard.press("Enter");
    await page.locator('button[title="Numbered list"]').nth(0).click();

    // Quote
    await page.locator('button[title="Quote"]').nth(0).click();
    await page.keyboard.type("REGRESSION TEST: Quote");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");

    // Link
    await page.locator('button[title="Link"]').nth(0).click();
    await page.keyboard.type("https://www.google.com");
    await page.keyboard.press("Enter");

    // Take screenshot of page
    const screenshot = await page.screenshot();
    await testInfo.attach("Näkymä", {
      body: screenshot,
      contentType: "image/png",
    });

    // Timeout so text will save
    await page.waitForTimeout(500);

    // Create project
    await page
      .locator('button[type="submit"]:has-text("Luo Projekti")')
      .nth(0)
      .click();
  });
  test("Project seen", async ({ page }, testInfo) => {
    await page
      .locator("tr")
      .filter({ hasText: "REGRESSION TEST: TITLE" })
      .nth(0)
      .getByRole("button", { name: "Muokkaa" })
      .click();

    // Timeout so text will show in second screenshot
    await page.waitForTimeout(500);

    const screenshot2 = await page.screenshot();
    await testInfo.attach("Näkymä", {
      body: screenshot2,
      contentType: "image/png",
    });

    const testTitles = [
      "REGRESSION TEST: H1",
      "REGRESSION TEST: H2",
      "REGRESSION TEST: H3",
      "REGRESSION TEST: Bold",
      "REGRESSION TEST: Italic",
      "REGRESSION TEST: Underlined",
      "REGRESSION TEST: List 1",
      "REGRESSION TEST: List 2",
      "REGRESSION TEST: Numbered list 1",
      "REGRESSION TEST: Numbered List 2",
      "REGRESSION TEST: Quote"

    ];

    for (const text of testTitles) {
      await expect(page.getByText(text)).toBeVisible();
    }
    await expect(page.getByText("https://www.google.com")).toBeVisible();
  });
});
