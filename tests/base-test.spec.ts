import { test, expect } from '@playwright/test';

test('Login + Basic Functionalities', async ({ page }) => {
  test.setTimeout(100000); // Increase timeout for the test
  await page.goto('/');
  await page.getByRole('button', { name: 'Kirjaudu Sisään' }).click();
  await page.waitForTimeout(3000);
  await page.reload();
  await page.waitForTimeout(1000);
  if(await page.getByRole('button', { name: 'Täyden tutkinnon suorittaja' }).count() > 0){
    await page.getByRole('button', { name: 'Täyden tutkinnon suorittaja' }).click();
    await page.getByRole('button', { name: 'Kirjaudu Sisään' }).click();
  }

  await expect(page.getByText('Mukavaa opiskelupäivää')).toBeVisible(); 
  // Click the profile button so we can swap to the teachers dashboard
  await page.locator('button[aria-haspopup="menu"]').click();
  await page.getByRole('menuitem', { name: 'Vaihda roolia' }).click();
  //Create a theme and then edit it
  await page.getByRole('button', { name: 'Teemat' }).click();
  await page.getByRole('button', { name: 'Lisää Teema' }).click();
  const themeName = `Test  ${Date.now()}`;
  await page.getByRole('textbox', { name: 'Teeman Nimi' }).fill(themeName);
  await page.pause();
  await page.locator('[data-slate-editor="true"]').nth(0).click();
  await page.keyboard.type('test description');
  await page.locator('button[title="H1"]').nth(0).click();
  await page.locator('[data-slate-editor="true"]').nth(1).click();
  await page.keyboard.type('test description 2');
  await page.locator('button[title="H2"]').nth(1).click();
  const themeBlock = page.locator('label:has-text("Tutkinnon Osa")').locator('..');
  await themeBlock.locator('button').click();
  await page.getByRole('button', { name: 'Ohjelmointi' }).click();
  await page.getByRole('button', { name: 'Lisää Tutkinnon osa' }).click();
  await page.getByRole('button', { name: 'Luo Teema' }).click();
  const themeItem = page.locator(`text=${themeName}`).locator('..'); 
  await themeItem.getByRole('button', { name: 'Muokkaa' }).click();
  await page.locator('[data-slate-editor="true"]').nth(0).click();
  await page.keyboard.type(' [Edited]');
  await page.getByRole('button', { name: 'Tallenna muutokset' }).click();
  await page.waitForTimeout(2000);
  //Create a project and then edit it
  await page.getByRole('button', { name: 'Projektit' }).click();
  await page.getByRole('button', { name: 'Lisää Projekti' }).click();
  const projectName = `Test Project ${Date.now()}`;
  await page.getByRole('textbox', { name: 'Projektin nimi' }).fill(projectName);
  await page.locator('[data-slate-editor="true"]').nth(0).click();
  await page.keyboard.type('test project description');
  await page.locator('button[title="H1"]').nth(0).click();
  const projectBlock = page.locator('label:has-text("Teema")').locator('..');
  await projectBlock.locator('button').click();
  await page.getByRole('button', { name: themeName }).click();
  await page.getByRole('button', { name: 'Lisää Teemat' }).click();
  await page.locator('[data-slate-editor="true"]').nth(1).click();
  await page.keyboard.type('test project description');
  await page.locator('button[title="H2"]').nth(1).click();
  await page.getByRole('button', { name: 'Luo Projekti' }).click();
  const projectItem = page.locator(`text=${projectName}`).locator('..'); 
  await projectItem.getByRole('button', { name: 'Muokkaa' }).click();
  await page.locator('[data-slate-editor="true"]').nth(0).click();
  await page.keyboard.type(' [Edited]');
  await page.getByRole('button', { name: 'Tallenna muutokset' }).click();
});