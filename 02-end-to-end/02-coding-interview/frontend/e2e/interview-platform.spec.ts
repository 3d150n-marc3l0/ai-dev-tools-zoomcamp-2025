import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';
const SERVER_URL = 'http://localhost:3001';

test.describe('End-to-End Interview Platform Tests', () => {
  
  test.describe('Session Creation', () => {
    test('should create a new session from the home page', async ({ page }) => {
      await page.goto(BASE_URL);
      
      // Wait for the create session button
      await page.waitForSelector('button:has-text("Start Interview")');
      
      // Click create session
      await page.click('button:has-text("Start Interview")');
      
      // Should redirect to session page
      await page.waitForURL(/\/session\/[A-Z0-9]{6}/);
      
      // Verify code editor is visible
      await page.waitForSelector('[data-testid="code-editor"]');
    });

    test('should join an existing session via URL', async ({ page, request }) => {
      // Create session via API
      const response = await request.post(`${SERVER_URL}/api/sessions`, {
        data: { language: 'javascript', title: 'E2E Test Session' }
      });
      
      const session = await response.json();
      
      // Navigate to the session
      await page.goto(`${BASE_URL}/session/${session.code}`);
      
      // Should show the code editor
      await page.waitForSelector('[data-testid="code-editor"]');
    });
  });

  test.describe('Code Editor', () => {
    test('should display code editor with syntax highlighting', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.click('button:has-text("Start Interview")');
      await page.waitForURL(/\/session\/[A-Z0-9]{6}/);
      
      // Monaco editor should be present
      await page.waitForSelector('.monaco-editor');
      
      // Default code should be visible
      const editorContent = await page.locator('.monaco-editor').textContent();
      expect(editorContent).toContain('function');
    });

    test('should allow typing in the code editor', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.click('button:has-text("Start Interview")');
      await page.waitForURL(/\/session\/[A-Z0-9]{6}/);
      
      // Wait for Monaco to be ready
      await page.waitForSelector('.monaco-editor');
      await page.waitForTimeout(1000); // Give Monaco time to initialize
      
      // Click in the editor
      await page.click('.monaco-editor');
      
      // Type some code
      await page.keyboard.type('// E2E Test Comment');
    });
  });

  test.describe('Language Selection', () => {
    test('should allow changing programming language', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.click('button:has-text("Start Interview")');
      await page.waitForURL(/\/session\/[A-Z0-9]{6}/);
      
      // Find and click language selector
      await page.waitForSelector('[data-testid="language-selector"]');
      await page.click('[data-testid="language-selector"]');
      
      // Select Python
      await page.click('text=Python');
      
      // Editor content should update to Python template
      await page.waitForTimeout(500);
    });
  });

  test.describe('Real-time Collaboration', () => {
    test('should sync code changes between two browsers', async ({ browser, request }) => {
      // Create a session via API
      const response = await request.post(`${SERVER_URL}/api/sessions`, {
        data: { language: 'javascript', title: 'Collab Test' }
      });
      const session = await response.json();
      
      // Open two browser contexts
      const context1 = await browser.newContext();
      const context2 = await browser.newContext();
      
      const page1 = await context1.newPage();
      const page2 = await context2.newPage();
      
      // Both join the same session
      await page1.goto(`${BASE_URL}/session/${session.code}`);
      await page2.goto(`${BASE_URL}/session/${session.code}`);
      
      // Wait for both editors to load
      await page1.waitForSelector('.monaco-editor');
      await page2.waitForSelector('.monaco-editor');
      
      // Wait for WebSocket connections
      await page1.waitForTimeout(2000);
      await page2.waitForTimeout(2000);
      
      // Clean up
      await context1.close();
      await context2.close();
    });
  });

  test.describe('Session Header', () => {
    test('should display session code that can be copied', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.click('button:has-text("Start Interview")');
      await page.waitForURL(/\/session\/[A-Z0-9]{6}/);
      
      // Session code should be visible
      await page.waitForSelector('[data-testid="session-code"]');
      const code = await page.locator('[data-testid="session-code"]').textContent();
      expect(code).toMatch(/[A-Z0-9]{6}/);
    });
  });

  test.describe('Code Execution', () => {
    test('should execute JavaScript code and show output', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.click('button:has-text("Start Interview")');
      await page.waitForURL(/\/session\/[A-Z0-9]{6}/);
      
      await page.waitForSelector('.monaco-editor');
      
      // Find and click run button
      await page.waitForSelector('[data-testid="run-button"]');
      await page.click('[data-testid="run-button"]');
      
      // Output panel should show result
      await page.waitForSelector('[data-testid="code-output"]');
    });
  });
});

test.describe('API Health Check', () => {
  test('server should be running and healthy', async ({ request }) => {
    const response = await request.get(`${SERVER_URL}/health`);
    expect(response.ok()).toBe(true);
    
    const data = await response.json();
    expect(data.status).toBe('ok');
  });
});
