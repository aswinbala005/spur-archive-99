import { expect, test } from "@playwright/test";

test.describe("Archive 99 Homepage", () => {
  test("should load the landing page", async ({ page }) => {
    await page.goto("/");

    // Check that the page title is present
    await expect(page).toHaveTitle(/Archive 99/i);
  });

  test("should display the chat widget button", async ({ page }) => {
    await page.goto("/");

    // The floating chat button should be visible
    const chatButton = page.getByRole("button", { name: /open chat/i });
    await expect(chatButton).toBeVisible();
  });
});

test.describe("Chat Widget Interaction", () => {
  test("should open chat widget when clicking the button", async ({ page }) => {
    await page.goto("/");

    // Click the floating chat button
    const chatButton = page.getByRole("button", { name: /open chat/i });
    await chatButton.click();

    // Chat window should now be visible
    const chatHeader = page.getByText("Aria");
    await expect(chatHeader).toBeVisible();

    // Empty state message should be shown
    const welcomeText = page.getByText(/Welcome to Archive 99/i);
    await expect(welcomeText).toBeVisible();
  });

  test("should close chat widget when clicking X button", async ({ page }) => {
    await page.goto("/");

    // Open the chat
    const chatButton = page.getByRole("button", { name: /open chat/i });
    await chatButton.click();

    // Verify it's open
    const chatHeader = page.getByText("Aria");
    await expect(chatHeader).toBeVisible();

    // Close the chat
    const closeButton = page
      .getByRole("button")
      .filter({ has: page.locator("svg.lucide-x") });
    await closeButton.click();

    // Chat header should no longer be visible
    await expect(chatHeader).not.toBeVisible();

    // The floating button should be back
    await expect(chatButton).toBeVisible();
  });

  test("should allow typing in the input field", async ({ page }) => {
    await page.goto("/");

    // Open chat
    await page.getByRole("button", { name: /open chat/i }).click();

    // Find and type in the input
    const input = page.getByPlaceholder("Type your question...");
    await expect(input).toBeVisible();
    await input.fill("What is your return policy?");

    // Verify the value
    await expect(input).toHaveValue("What is your return policy?");
  });

  test("should disable send button when input is empty", async ({ page }) => {
    await page.goto("/");

    // Open chat
    await page.getByRole("button", { name: /open chat/i }).click();

    // The send button should be disabled when input is empty
    const sendButton = page.getByRole("button", { name: "" }).last();
    await expect(sendButton).toBeDisabled();
  });
});
