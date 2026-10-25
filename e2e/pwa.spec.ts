import { expect, test } from '@playwright/test';

interface ManifestIcon {
  src: string;
  sizes: string;
  purpose?: string;
}

interface Manifest {
  name: string;
  short_name: string;
  display: string;
  start_url: string;
  icons: ManifestIcon[];
}

test('loads the app with no console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));

  await page.goto('./');
  await expect(page).toHaveTitle('K8S learn');
  await expect(page.getByRole('heading', { name: 'Today’s plan' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('has an installable web app manifest with working icons', async ({ page, request }) => {
  await page.goto('./');
  const href = await page.locator('link[rel="manifest"]').getAttribute('href');
  expect(href).toBeTruthy();
  const manifestUrl = new URL(href ?? '', page.url()).toString();
  const res = await request.get(manifestUrl);
  expect(res.ok()).toBe(true);
  const manifest = (await res.json()) as Manifest;

  expect(manifest.name).toBe('K8S learn');
  expect(manifest.display).toBe('standalone');
  expect(manifest.icons.some((i) => i.sizes === '192x192')).toBe(true);
  expect(manifest.icons.some((i) => i.sizes === '512x512')).toBe(true);
  expect(manifest.icons.some((i) => i.purpose === 'maskable')).toBe(true);

  for (const icon of manifest.icons) {
    const iconRes = await request.get(new URL(icon.src, manifestUrl).toString());
    expect(iconRes.ok(), icon.src).toBe(true);
    expect(iconRes.headers()['content-type']).toContain('image/png');
  }

  const apple = await page.locator('link[rel="apple-touch-icon"]').getAttribute('href');
  expect((await request.get(new URL(apple ?? '', page.url()).toString())).ok()).toBe(true);
});

test('works offline after the first visit', async ({ page, context }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { name: 'Today’s plan' })).toBeVisible();

  // Wait until the service worker is active and controls the page.
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect.poll(() => page.evaluate(() => navigator.serviceWorker.controller !== null)).toBe(true);

  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Today’s plan' })).toBeVisible();
  await expect(page.getByText('Offline', { exact: true })).toBeVisible();

  // Everything is usable without network.
  const nav = page.getByRole('navigation', { name: 'Main' });
  await nav.getByRole('button', { name: /Quiz/ }).click();
  await page.getByRole('button', { name: /Mixed – all topics/ }).click();
  await expect(page.getByTestId('quiz')).toBeVisible();

  await nav.getByRole('button', { name: /Learn/ }).click();
  await page.getByRole('tab', { name: /History/ }).click();
  await page.getByText('Borg and Omega').click();
  await expect(page.getByText('TL;DR')).toBeVisible();

  // Deep links work offline too (navigation fallback).
  await page.goto('./#/progress');
  await expect(page.getByRole('heading', { name: 'Progress' })).toBeVisible();
  await context.setOffline(false);
});

test('keeps progress after reload', async ({ page }) => {
  await page.goto('./#/lesson/wl-pods');
  await page.getByRole('button', { name: 'Mark as learned' }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: '✓ Learned' })).toBeVisible();
  await page.goto('./#/progress');
  await expect(page.getByText('1/', { exact: false }).first()).toBeVisible();
});

test('fits a phone screen without horizontal scrolling', async ({ page }) => {
  for (const hash of ['#/today', '#/learn', '#/quiz', '#/cards', '#/progress', '#/lesson/dd-k8s']) {
    await page.goto(`./${hash}`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, hash).toBeLessThanOrEqual(0);
  }
});
