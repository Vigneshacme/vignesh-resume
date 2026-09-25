import { test, expect } from '@playwright/test';

test.describe('Vignesh Kumar E - Portfolio & Cloud Resume', () => {

  test('should render hero title, professional summary, and contact information', async ({ page }) => {
    await page.goto('/');

    // Validate main title & roles
    await expect(page.locator('.hero-title')).toContainText('Vignesh Kumar E');
    await expect(page.locator('.hero-subtitle')).toContainText('Tech Lead');
    await expect(page.locator('.hero-subtitle')).toContainText('Senior Full-Stack Engineer');

    // Validate location & cloud host badge
    await expect(page.locator('.hero-location')).toContainText('Chennai, Tamil Nadu, India');
  });

  test('should display skills matrix with all 7 key domains', async ({ page }) => {
    await page.goto('/');

    const skillsSection = page.locator('#skills');
    await expect(skillsSection).toBeVisible();

    await expect(skillsSection).toContainText('Languages & Web');
    await expect(skillsSection).toContainText('Backend Frameworks');
    await expect(skillsSection).toContainText('Frontend Frameworks');
    await expect(skillsSection).toContainText('Cloud & DevOps');
    await expect(skillsSection).toContainText('Databases & Query Tuning');
    await expect(skillsSection).toContainText('Messaging & Distributed Systems');
    await expect(skillsSection).toContainText('AI & Machine Learning');

    // Specific tech highlights
    await expect(skillsSection).toContainText('YARP API Gateway');
    await expect(skillsSection).toContainText('Query Store');
    await expect(skillsSection).toContainText('Qdrant Vector DB');
  });

  test('should display professional experience at alfaTKG and Sirpi', async ({ page }) => {
    await page.goto('/');

    const experienceSection = page.locator('#experience');
    await expect(experienceSection).toBeVisible();

    await expect(experienceSection).toContainText('alfaTKG');
    await expect(experienceSection).toContainText('Tech Lead');
    await expect(experienceSection).toContainText('Sirpi');
  });

  test('should render visitor counter badge and display count', async ({ page }) => {
    await page.goto('/');

    const counterBadge = page.locator('#visitor-counter');
    await expect(counterBadge).toBeVisible();

    const hitCount = page.locator('#hit-count');
    // Wait for the counter animation/fetch to update from '...'
    await expect(hitCount).not.toHaveText('...', { timeout: 5000 });
  });

  test('should retain short-term chat context and allow a new conversation', async ({ page }) => {
    const requests: Array<{ question?: string; history?: Array<{ role: string; content: string }> }> = [];
    await page.route('**/api/chat', async (route) => {
      const request = route.request();
      requests.push(JSON.parse(request.postData() || '{}'));
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ answer: 'Direct, grounded response.', sources: ['Technical Skills'] }),
      });
    });
    await page.goto('/');

    // Click to open AI chat
    const chatBtn = page.locator('#ai-chat-btn');
    await chatBtn.click();

    const drawer = page.locator('#chat-drawer');
    await expect(drawer).toHaveClass(/open/);

    await page.locator('#chat-input').fill('Does he know Java?');
    await page.locator('#chat-input').press('Enter');
    await expect(page.locator('.chat-bubble.user')).toBeVisible();
    await expect(page.locator('.chat-bubble.bot').nth(1)).toBeVisible({ timeout: 6000 });

    await page.locator('#chat-input').fill('What about JavaScript?');
    await page.locator('#chat-input').press('Enter');
    await expect.poll(() => requests.length).toBe(2);
    expect(requests[1].history).toEqual([
      { role: 'user', content: 'Does he know Java?' },
      { role: 'assistant', content: 'Direct, grounded response.' },
    ]);

    await page.locator('#chat-reset-btn').click();
    await expect(page.locator('.chat-bubble.user')).toHaveCount(0);
    await expect(page.locator('.suggestion-chip').first()).toBeVisible();
  });

});
