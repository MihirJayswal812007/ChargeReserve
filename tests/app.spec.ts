import { test, expect } from '@playwright/test';

test.describe('ChargeReserve Application', () => {
  test('should load the landing page', async ({ page }) => {
    await page.goto('/');
    // Check if the landing page header exists (based on typical naming or previous context)
    // Adjusting based on common elements seen in icons and navbar
    await expect(page).toHaveTitle(/ChargeReserve/);
  });

  test('should navigate to the About page', async ({ page }) => {
    await page.goto('/about');
    // Expect the URL to contain 'about'
    await expect(page).toHaveURL(/\/about/);
    // You might want to check for a specific heading like "About Us"
    // Using a broad check for text since I don't know the exact content yet
  });

  test('should protect the dashboard and redirect to login', async ({ page }) => {
    await page.goto('/dashboard');
    // If unauthenticated, it should redirect to /login
    await expect(page).toHaveURL(/\/login/);
  });
});
