import { expect, test } from "../fixtures/pageObjectsFixture";
import {
	jobRoleDetailContent,
	mockJobRole,
	testUser,
} from "../fixtures/testData";
import { JobRolesPage } from "../pages/jobRolesPage";

test.describe("job role details", () => {
	test("displays the selected role title, description, and relevant information", async ({
		page,
	}) => {
		await page.goto("/login");
		await page.getByLabel("Email Address").fill(testUser.email);
		await page.getByLabel("Password").fill(testUser.password);
		await page.getByRole("button", { name: "Sign In" }).click();

		const jobRolesPage = new JobRolesPage(page);
		await expect(jobRolesPage.heading).toBeVisible();
		await expect(jobRolesPage.firstJobRole).toBeVisible();
		await jobRolesPage.openFirstJobRole();

		await expect(page).toHaveURL(`/job-roles/${mockJobRole.jobRoleId}`);
		await expect(
			page.getByRole("heading", { level: 1, name: mockJobRole.roleName }),
		).toBeVisible();
		await expect(
			page.getByRole("heading", {
				level: 2,
				name: jobRoleDetailContent.aboutHeading,
			}),
		).toBeVisible();
		await expect(page.getByText(mockJobRole.description)).toBeVisible();
		const metadata = page.locator(".job-detail-meta");
		await expect(
			metadata.locator(".meta-label", {
				hasText: jobRoleDetailContent.locationLabel,
			}),
		).toBeVisible();
		await expect(
			metadata.getByText(mockJobRole.location, { exact: true }),
		).toBeVisible();
		await expect(
			metadata.locator(".meta-label", {
				hasText: jobRoleDetailContent.bandLabel,
			}),
		).toBeVisible();
		await expect(
			metadata.getByText(mockJobRole.band, { exact: true }),
		).toBeVisible();
		await expect(
			metadata.locator(".meta-label", {
				hasText: jobRoleDetailContent.capabilityLabel,
			}),
		).toBeVisible();
		await expect(
			metadata.getByText(mockJobRole.capability, { exact: true }),
		).toBeVisible();
		await expect(page.getByText(mockJobRole.responsibilities[0])).toBeVisible();
		await expect(
			page.getByText(jobRoleDetailContent.openPositions),
		).toBeVisible();
	});
});
