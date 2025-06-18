import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3205/login');
  });

  test('Login page displays all elements correctly', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Se connecter à votre compte' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Mot de passe' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continuer' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Mot de passe oublié ?' })).toBeVisible();
  });

  test('Admin can login and logout successfully', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Email' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill('admin@doctoplan.com');

    await page.getByRole('textbox', { name: 'Mot de passe' }).click();
    await page.getByRole('textbox', { name: 'Mot de passe' }).fill('admin123');

    await page.getByRole('button', { name: 'Continuer' }).click();

    await expect(
      page.getByRole('heading', { name: 'Tableau de bord administrateur' }),
    ).toBeVisible();
    expect(page.url()).toContain('/admin/users');

    await expect(page.getByRole('button', { name: 'Se déconnecter' })).toBeVisible();
    await page.getByRole('button', { name: 'Se déconnecter' }).click();
    await expect(page.getByRole('heading', { name: 'Se connecter à votre compte' })).toBeVisible();
  });

  test('Secretary can login successfully', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Email' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill('secretary@doctoplan.com');

    await page.getByRole('textbox', { name: 'Mot de passe' }).click();
    await page.getByRole('textbox', { name: 'Mot de passe' }).fill('secretary123');

    await page.getByRole('button', { name: 'Continuer' }).click();

    await expect(page.getByRole('button', { name: 'Se déconnecter' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Ajouter un document' })).toBeVisible();
    await expect(
      page.getByRole('textbox', { name: 'Rechercher un patient ou un m' }),
    ).toBeVisible();

    expect(page.url()).toContain('/secretary');
  });

  test('Shows error message for invalid credentials', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Email' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill('invalid@doctoplan.com');

    await page.getByRole('textbox', { name: 'Mot de passe' }).click();
    await page.getByRole('textbox', { name: 'Mot de passe' }).fill('wrongpassword');

    await page.getByRole('button', { name: 'Continuer' }).click();

    await expect(page.getByRole('heading', { name: 'Se connecter à votre compte' })).toBeVisible();
    await expect(page.getByText('Invalid email or password')).toBeVisible();
  });

  test('Empty fields show validation errors', async ({ page }) => {
    await page.getByRole('button', { name: 'Continuer' }).click();

    await expect(page.getByRole('textbox', { name: 'Email' })).toHaveAttribute('required');
    await expect(page.getByRole('textbox', { name: 'Mot de passe' })).toHaveAttribute('required');
  });
});
