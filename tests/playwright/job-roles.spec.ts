import { expect, test } from "../fixtures/pageObjectsFixture";
import {
	jobRoleDetailContent,
	mockJobRole,
	testUser,
} from "../fixtures/testData";
import { ErrorPage } from "../pages/errorPage";
import { JobRoleDetailPage } from "../pages/jobRoleDetailPage";
import { JobRolesPage } from "../pages/jobRolesPage";
import { LoginPage } from "../pages/loginPage";

async function signIn(page: import("@playwright/test").Page): Promise<void> {
	const loginPage = new LoginPage(page);
	await loginPage.open("/login");
	await loginPage.login(testUser.email, testUser.password);
}

test.describe("job role details", () => {
	test("displays the selected role title, description, and relevant information", async ({
		page,
	}) => {
		const loginPage = new LoginPage(page);
		await loginPage.open("/login");
		await loginPage.login(testUser.email, testUser.password);

		const jobRolesPage = new JobRolesPage(page);
		await expect(jobRolesPage.heading).toHaveText(
			jobRoleDetailContent.listHeading,
		);
		await expect(jobRolesPage.firstJobRole).toBeVisible();
		await jobRolesPage.openFirstJobRole();

		await expect(page).toHaveURL(`/job-roles/${mockJobRole.jobRoleId}`);
		const jobRoleDetailPage = new JobRoleDetailPage(page);
		await expect(jobRoleDetailPage.heading).toHaveText(mockJobRole.roleName);
		await expect(jobRoleDetailPage.aboutHeading).toHaveText(
			jobRoleDetailContent.aboutHeading,
		);
		await expect(jobRoleDetailPage.description).toHaveText(
			mockJobRole.description,
		);
		await expect(
			jobRoleDetailPage.metadataLabel(jobRoleDetailContent.locationLabel),
		).toBeVisible();
		await expect(
			jobRoleDetailPage.metadataValue(mockJobRole.location),
		).toBeVisible();
		await expect(
			jobRoleDetailPage.metadataLabel(jobRoleDetailContent.bandLabel),
		).toBeVisible();
		await expect(
			jobRoleDetailPage.metadataValue(mockJobRole.band),
		).toBeVisible();
		await expect(
			jobRoleDetailPage.metadataLabel(jobRoleDetailContent.capabilityLabel),
		).toBeVisible();
		await expect(
			jobRoleDetailPage.metadataValue(mockJobRole.capability),
		).toBeVisible();
		await expect(jobRoleDetailPage.responsibilities.first()).toHaveText(
			mockJobRole.responsibilities[0],
		);
		await expect(jobRoleDetailPage.openPositions).toContainText(
			jobRoleDetailContent.openPositions,
		);
	});
});

test.describe("job role listing", () => {
	test.beforeEach(async ({ page }) => {
		await signIn(page);
	});

	test("filters roles by name and clears the active filters", async ({
		page,
	}) => {
		const jobRolesPage = new JobRolesPage(page);
		await jobRolesPage.applyRoleNameFilter("Software");

		await expect(page).toHaveURL(/roleName=Software/);
		await expect(jobRolesPage.firstJobRole).toContainText("View Details");
		await expect(jobRolesPage.roleNameInput).toHaveValue("Software");

		await jobRolesPage.clearFilters();
		await expect(page).toHaveURL("/job-roles");
		await expect(jobRolesPage.roleNameInput).toHaveValue("");
	});

	test("shows an empty state for filters with no matching roles", async ({
		page,
	}) => {
		const jobRolesPage = new JobRolesPage(page);
		await jobRolesPage.applyRoleNameFilter("Astronaut");

		await expect(jobRolesPage.noResultsMessage).toContainText(
			"No job roles match your filters.",
		);
	});

	test("filters roles by location", async ({ page }) => {
		const jobRolesPage = new JobRolesPage(page);
		await jobRolesPage.applyLocationFilter("London");

		await expect(page).toHaveURL(/location=London/);
		await expect(jobRolesPage.locationInput).toHaveValue("London");
		await expect(page.locator(".job-card-title")).toHaveText([
			"Software Engineer",
			"Delivery Manager",
		]);
	});

	test("filters roles by band", async ({ page }) => {
		const jobRolesPage = new JobRolesPage(page);
		await jobRolesPage.applyBandFilter("Band 3");

		await expect(page).toHaveURL(/band=Band\+3/);
		await expect(page.locator(".job-card-title")).toHaveText(["Data Analyst"]);
	});

	test("filters roles by status", async ({ page }) => {
		const jobRolesPage = new JobRolesPage(page);
		await jobRolesPage.applyStatusFilter("Closed");

		await expect(page).toHaveURL(/status=Closed/);
		await expect(page.locator(".job-card-title")).toHaveText([
			"Delivery Manager",
		]);
	});

	test("filters roles by closing date", async ({ page }) => {
		const jobRolesPage = new JobRolesPage(page);
		await jobRolesPage.applyClosingDateFilter("2026-11-30");

		await expect(page).toHaveURL(/closingDate=2026-11-30/);
		await expect(page.locator(".job-card-title")).toHaveText([
			"Data Analyst",
			"Delivery Manager",
		]);
	});

	test("combines multiple filters using AND logic", async ({ page }) => {
		const jobRolesPage = new JobRolesPage(page);
		await jobRolesPage.locationInput.fill("London");
		await jobRolesPage.toggleCheckboxFilter("status", "Closed");
		await jobRolesPage.applyFiltersButton.click();

		await expect(page).toHaveURL(/location=London/);
		await expect(page).toHaveURL(/status=Closed/);
		await expect(page.locator(".job-card-title")).toHaveText([
			"Delivery Manager",
		]);
	});

	test("shows the active filter count on a checkbox dropdown", async ({
		page,
	}) => {
		const jobRolesPage = new JobRolesPage(page);
		await jobRolesPage.toggleCheckboxFilter("band", "Band 2");
		await jobRolesPage.toggleCheckboxFilter("band", "Band 3");
		await jobRolesPage.applyFiltersButton.click();

		await expect(jobRolesPage.filterDropdownCount("band")).toHaveText("2");
	});

	test("clear filters resets text, checkbox, and date filters", async ({
		page,
	}) => {
		const jobRolesPage = new JobRolesPage(page);
		await jobRolesPage.roleNameInput.fill("Software");
		await jobRolesPage.locationInput.fill("London");
		await jobRolesPage.closingDateInput.fill("2026-12-31");
		await jobRolesPage.toggleCheckboxFilter("status", "Open");
		await jobRolesPage.applyFiltersButton.click();

		await jobRolesPage.clearFilters();

		await expect(page).toHaveURL("/job-roles");
		await expect(jobRolesPage.roleNameInput).toHaveValue("");
		await expect(jobRolesPage.locationInput).toHaveValue("");
		await expect(jobRolesPage.closingDateInput).toHaveValue("");
		await expect(jobRolesPage.filterOption("status", "Open")).not.toBeChecked();
	});

	test("preserves filters while moving between result pages", async ({
		page,
	}) => {
		const jobRolesPage = new JobRolesPage(page);
		await jobRolesPage.applyCapabilityFilter("Engineering");
		await expect(jobRolesPage.paginationStatus).toHaveText("Page 1 of 1");

		await jobRolesPage.clearFilters();
		await jobRolesPage.goToNextPage();
		await expect(page).toHaveURL(/page=2/);
		await expect(jobRolesPage.paginationStatus).toHaveText("Page 2 of 2");
		await expect(jobRolesPage.previousPageLink).toBeEnabled();
	});

	test("shows helpful error pages for invalid or missing role IDs", async ({
		page,
	}) => {
		const errorPage = new ErrorPage(page);
		await errorPage.open("/job-roles/not-a-number");
		await expect(errorPage.heading).toHaveText("Error 400");
		await expect(errorPage.message).toHaveText("Invalid job role ID");

		await errorPage.open("/job-roles/999");
		await expect(errorPage.heading).toHaveText("Error 404");
		await expect(errorPage.message).toHaveText("Job role not found");
	});
});
