import { test, expect } from '@playwright/test';

test.describe('Vignesh Kumar E - Portfolio & Cloud Resume', () => {

  test('should render hero title, professional summary, and contact information', async ({ page }) => {
    await page.goto('/');

    // Validate main title & roles
    await expect(page.locator('.hero-title')).toContainText('Vignesh Kumar E');
    await expect(page.locator('.hero-subtitle')).toContainText('Tech Lead');
    await expect(page.locator('.hero-subtitle')).toContainText('Solution Architect');

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
    await expect(skillsSection).toContainText('AI & Automation');

    // Specific tech highlights
    await expect(skillsSection).toContainText('YARP API Gateway');
    await expect(skillsSection).toContainText('Query Store');
    await expect(skillsSection).toContainText('Qdrant / Vector Databases');
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

  test('should open AI recruiter chat drawer and respond to queries', async ({ page }) => {
    await page.goto('/');

    // Click to open AI chat
    const chatBtn = page.locator('#ai-chat-btn');
    await chatBtn.click();

    const drawer = page.locator('#chat-drawer');
    await expect(drawer).toHaveClass(/open/);

    // Check suggestion chips
    const firstChip = page.locator('.suggestion-chip').first();
    await expect(firstChip).toBeVisible();

    // Click suggestion chip to test automated interaction
    await firstChip.click();

    // Ensure user bubble and bot response bubble appear
    await expect(page.locator('.chat-bubble.user')).toBeVisible();
    await expect(page.locator('.chat-bubble.bot').nth(1)).toBeVisible({ timeout: 6000 });
  });

});
