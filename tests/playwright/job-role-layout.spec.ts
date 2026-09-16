import { expect, test } from "@playwright/test";
import { adminUser, mockJobRole, testUser } from "../fixtures/testData";
import { LoginPage } from "../pages/loginPage";

for (const width of [390, 1440]) {
	for (const account of [testUser, adminUser]) {
		test(`role pages fit ${width}px for ${account.role}`, async ({
			page,
		}, testInfo) => {
			await page.setViewportSize({ width, height: 900 });
			const login = new LoginPage(page);
			await login.open("/login");
			await login.login(account.email, account.password);
			await page.goto("/job-roles");
			await expect(page.locator(".job-card").first()).toBeVisible();
			expect(
				await page.evaluate(() => document.documentElement.scrollWidth),
			).toBeLessThanOrEqual(width);
			await page.screenshot({
				path: testInfo.outputPath("job-roles.png"),
				fullPage: true,
			});
			await page.goto(`/job-roles/${mockJobRole.jobRoleId}`);
			await expect(
				page.locator(".job-detail-grid > .job-detail-sidebar"),
			).toBeVisible();
			const main = await page.locator(".job-detail-main").boundingBox();
			const sidebar = await page.locator(".job-detail-sidebar").boundingBox();
			expect(main).not.toBeNull();
			expect(sidebar).not.toBeNull();
			if (main && sidebar) {
				if (width > 900) {
					expect(sidebar.x).toBeGreaterThanOrEqual(main.x + main.width);
				} else {
					expect(sidebar.y).toBeGreaterThanOrEqual(main.y + main.height);
				}
			}
			if (account.role === "ADMIN") {
				await page.locator(".applications-summary").focus();
				await page.keyboard.press("Enter");
				await expect(page.locator(".applications-section")).toHaveAttribute(
					"open",
				);
			}
			expect(
				await page.evaluate(() => document.documentElement.scrollWidth),
			).toBeLessThanOrEqual(width);
			await page.evaluate(() =>
				window.scrollTo({ top: 0, behavior: "instant" }),
			);
			await page.screenshot({
				path: testInfo.outputPath("job-detail.png"),
				fullPage: true,
			});
		});
	}
}
