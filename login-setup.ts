import { chromium } from 'playwright';

const authFile = 'playwright/.auth/user.json';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    baseURL: 'http://localhost:5174' 
  });
  const page = await context.newPage();

  page.setDefaultTimeout(1000000); // Increase timeout for the setup

  //Navigate to the login page
  await page.goto('/');

  //Perform the MSAL login flow 
  await page.getByRole('button', { name: 'Kirjaudu Sisään' }).click();
  //Wait for the app to redirect back and MSAL to populate LocalStorage
  await page.waitForSelector('text=Ladataan käyttäjän tietoja...', { timeout: 100000 }).catch(() => null);
  await page.waitForTimeout(5000); 
  await page.reload();
  await page.waitForURL('**/studentdashboard'); 
  //Capture the cookies and local storage into a file
  await context.storageState({ path: authFile });

  await browser.close();
})();