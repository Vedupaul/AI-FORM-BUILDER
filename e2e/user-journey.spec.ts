import { test, expect } from "@playwright/test";

test.describe("E2E User Journey: Register -> Create Form -> Build -> Publish -> Submit", () => {
  test("Complete end-to-end journey", async ({ page }) => {
    // 1. Visit registration page
    await page.goto("/register");
    await expect(page.locator("h2")).toContainText("Create your account");

    // 2. Fill registration form
    await page.fill('input[placeholder="Jane Cooper"]', "Jane Tester");
    await page.fill('input[placeholder="you@company.com"]', "jane.tester@example.com");
    await page.fill('input[type="password"]', "SecurePass123");
    await page.click('button:has-text("Create account")');

    // 3. Lands on Dashboard with empty state starting from scratch
    await page.waitForURL("**/dashboard");
    await expect(page.locator("h1")).toContainText("Jane");
    await expect(page.locator("text=No forms here yet")).toBeVisible();

    // 4. Create new blank form
    await page.click('button:has-text("New form")');
    await page.waitForURL("**/builder/**");

    // 5. Change form title in the builder
    const titleInput = page.locator('input[placeholder="Form title"]');
    await expect(titleInput).toBeVisible();
    await titleInput.fill("E2E Test Evaluation Form");

    // 6. Add a field from the palette
    const shortTextFieldBtn = page.locator('button:has-text("Short text")').first();
    await shortTextFieldBtn.click();
    await expect(page.locator("text=Untitled question").or(page.locator("text=Short text"))).toBeVisible();

    // 7. Publish the form
    const publishBtn = page.locator('button:has-text("Publish")');
    await publishBtn.click();
    await expect(page.locator('button:has-text("Unpublish")')).toBeVisible();

    // 8. Open the Share modal to grab public link
    const shareBtn = page.locator('button:has-text("Share")');
    await shareBtn.click();

    const publicLinkInput = page.locator('input[readonly]').first();
    const publicUrl = await publicLinkInput.inputValue();
    expect(publicUrl).toContain("/f/");

    // 9. Navigate to the public form
    await page.goto(publicUrl);
    await expect(page.locator("h1")).toContainText("E2E Test Evaluation Form");

    // 10. Fill the question and submit
    const answerInput = page.locator('input[type="text"]').first();
    await answerInput.fill("Antigravity E2E Automated Submission");

    const submitBtn = page.locator('button:has-text("Submit")');
    await submitBtn.click();

    // 11. Verify submission completion screen
    await expect(page.locator("text=Thanks for your submission")).toBeVisible();

    // 12. Return to Dashboard and verify form is present
    await page.goto("/dashboard");
    await expect(page.locator("text=E2E Test Evaluation Form")).toBeVisible();
    await expect(page.locator("text=1 total")).toBeVisible();
  });
});
