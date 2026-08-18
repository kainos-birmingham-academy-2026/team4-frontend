import { expect, test } from "../fixtures/pageObjectsFixture";
import { JobRolesPage } from "../pages/jobRolesPage";

const selectedRole = {
	title: "Software Engineer",
	description:
		"Build reliable software that helps Kainos customers solve meaningful problems.",
	location: "London",
	band: "Band 2",
	capability: "Engineering",
	responsibility: "Develop and maintain software applications",
	openPositions: "We have 3 open positions for this role.",
};

test.describe("job role details", () => {
	test("displays the selected role title, description, and relevant information", async ({
		page,
	}) => {
		await page.goto("/login");
		await page.getByLabel("Email Address").fill("tester@example.com");
		await page.getByLabel("Password").fill("Password123!");
		await page.getByRole("button", { name: "Sign In" }).click();

		const jobRolesPage = new JobRolesPage(page);
		await expect(jobRolesPage.heading).toBeVisible();
		await expect(jobRolesPage.firstJobRole).toBeVisible();
		await jobRolesPage.openFirstJobRole();

		await expect(page).toHaveURL("/job-roles/1");
		await expect(
			page.getByRole("heading", { level: 1, name: selectedRole.title }),
		).toBeVisible();
		await expect(
			page.getByRole("heading", { level: 2, name: "About This Role" }),
		).toBeVisible();
		await expect(page.getByText(selectedRole.description)).toBeVisible();
		const metadata = page.locator(".job-detail-meta");
		await expect(
			metadata.locator(".meta-label", { hasText: "Location" }),
		).toBeVisible();
		await expect(
			metadata.getByText(selectedRole.location, { exact: true }),
		).toBeVisible();
		await expect(
			metadata.locator(".meta-label", { hasText: "Band" }),
		).toBeVisible();
		await expect(
			metadata.getByText(selectedRole.band, { exact: true }),
		).toBeVisible();
		await expect(
			metadata.locator(".meta-label", { hasText: "Capability" }),
		).toBeVisible();
		await expect(
			metadata.getByText(selectedRole.capability, { exact: true }),
		).toBeVisible();
		await expect(page.getByText(selectedRole.responsibility)).toBeVisible();
		await expect(page.getByText(selectedRole.openPositions)).toBeVisible();
	});
});
