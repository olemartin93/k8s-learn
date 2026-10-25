import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env['CI']),
  retries: process.env['CI'] ? 1 : 0,
  reporter: process.env['CI'] ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}/k8s-learn/`,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'mobile-chromium', use: { ...devices['Pixel 7'] } }],
  webServer: {
    command: `npm run preview -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/k8s-learn/`,
    reuseExistingServer: !process.env['CI'],
  },
});
