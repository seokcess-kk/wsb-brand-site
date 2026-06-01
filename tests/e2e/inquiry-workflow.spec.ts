import { test, expect } from "@playwright/test";
import { seedInquiry, deleteInquiry } from "../helpers/seed";

const EMAIL = process.env.ADMIN_EMAIL;
const PASSWORD = process.env.ADMIN_PASSWORD;
const ready = Boolean(process.env.DATABASE_URL && EMAIL && PASSWORD);

test.describe("inquiry workflow", () => {
  test.skip(!ready, "requires DATABASE_URL + ADMIN_EMAIL + ADMIN_PASSWORD");

  let id: number;
  test.beforeAll(async () => {
    id = await seedInquiry();
  });
  test.afterAll(async () => {
    await deleteInquiry(id);
  });

  test("new -> read -> replied -> archived", async ({ page }) => {
    await page.goto("/admin/sign-in");
    await page.fill('input[name="email"]', EMAIL!);
    await page.fill('input[name="password"]', PASSWORD!);
    await page.click('button:has-text("Sign in")');
    await page.waitForURL("**/admin");

    // Opening the detail auto-marks a "new" inquiry as read; the badge
    // refreshes via the server action's revalidatePath (no manual reload).
    await page.goto(`/admin/inquiries/${id}`);
    await expect(page.getByText("Read", { exact: true })).toBeVisible();

    // Reply link opens the mail client and optimistically marks replied.
    await page.getByRole("link", { name: "답장" }).click();
    await expect(page.getByText("Replied", { exact: true })).toBeVisible();

    // Archive (exact name so it does not match "보관 해제").
    await page.getByRole("button", { name: "보관", exact: true }).click();
    await expect(page.getByText("Archived", { exact: true })).toBeVisible();

    // Archived filter lists the seeded company.
    await page.goto("/admin/inquiries?status=archived");
    await expect(page.getByText("E2E Test Co")).toBeVisible();
  });
});
