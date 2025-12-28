import { expect, test } from "@playwright/test";

test("Final Walkthrough: About, Products, Chat", async ({ page }) => {
  // 1. Landing Page & About
  console.log("Step 1: Checking Landing & About...");
  await page.goto("http://localhost:5173");
  await expect(page.getByText("ARCHIVE 99")).toBeVisible();

  await page.click("text=About");
  await expect(page).toHaveURL(/.*about/);
  await expect(page.getByText("PRESERVING THE CULTURE")).toBeVisible();
  await expect(page.getByText("Online Only")).toBeVisible();
  await page.click("text=Back Home");

  // 2. Products Page & Inventory
  console.log("Step 2: Checking Products...");
  await page.click("text=Products");
  await expect(page).toHaveURL(/.*products/);

  // Check for Stussy variants
  await expect(page.getByText("Vintage Stussy Hoodie (Black)")).toBeVisible();
  await expect(page.getByText("Vintage Stussy Hoodie (Grey)")).toBeVisible();

  // Check for Sold Out item
  const soldOutBadge = page.locator("text=Sold Out").first();
  await expect(soldOutBadge).toBeVisible();

  // 3. Chat Experience (Aria)
  console.log("Step 3: Checking Aria Chat...");
  // Open Chat
  const chatButton = page.locator('button[aria-label="Open Chat"]');
  await chatButton.click();

  // Check Branding
  await expect(page.getByText("Aria")).toBeVisible();
  await expect(page.getByText("Archive 99 Support")).toBeVisible();
  await expect(page.getByText("Welcome to Archive 99")).toBeVisible();

  // Interaction
  const input = page.locator('input[placeholder="Type your question..."]');
  await input.fill("Do you have the Grey Stussy Hoodie?");
  await page.keyboard.press("Enter");

  // Verify Welcome disappears and response appears
  await expect(page.getByText("Welcome to Archive 99")).not.toBeVisible();

  // Wait for response (look for stock count "2" or "Grey")
  await expect(
    page.locator(".message-bubble").filter({ hasText: "Grey" }),
  ).toBeVisible({ timeout: 10000 });

  console.log("✅ Final Walkthrough Complete");
});
