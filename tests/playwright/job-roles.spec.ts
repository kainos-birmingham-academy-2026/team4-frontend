import { expect, test } from "../fixtures/pageObjectsFixture";
import {
	jobRoleDetailContent,
	jobRoleListContent,
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

	test("preserves filters while moving between result pages", async ({
		page,
	}) => {
		const jobRolesPage = new JobRolesPage(page);
		await jobRolesPage.applyCapabilityFilter("Engineering");
		await expect(jobRolesPage.paginationStatus).toHaveText("Page 1 of 1");

		await jobRolesPage.clearFilters();
		await jobRolesPage.goToNextPage();
		await expect(page).toHaveURL(/page=2/);
		await expect(jobRolesPage.paginationStatus).toHaveText(
			`Page 2 of ${jobRoleListContent.totalPages}`,
		);
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

test.describe("job role pagination", () => {
	const { pageSize, totalPages } = jobRoleListContent;
	const maxNextClicks = 5;

	test.beforeEach(async ({ page }) => {
		await signIn(page);
	});

	test("shows first, previous, next, and last links below the results", async ({
		page,
	}) => {
		const jobRolesPage = new JobRolesPage(page);

		await expect(jobRolesPage.jobCards).toHaveCount(pageSize);
		await expect(jobRolesPage.firstPageLink).toBeVisible();
		await expect(jobRolesPage.previousPageLink).toBeVisible();
		await expect(jobRolesPage.nextPageLink).toBeVisible();
		await expect(jobRolesPage.lastPageLink).toBeVisible();
	});

	test("shows ten job roles on each page while paging forward", async ({
		page,
	}) => {
		const jobRolesPage = new JobRolesPage(page);

		await expect(jobRolesPage.paginationStatus).toHaveText(
			`Page 1 of ${totalPages}`,
		);
		await expect(jobRolesPage.jobCards).toHaveCount(pageSize);
		await expect(jobRolesPage.jobCardTitles).toHaveCount(pageSize);

		const lastPageToVisit = Math.min(1 + maxNextClicks, totalPages);
		for (let pageNumber = 2; pageNumber <= lastPageToVisit; pageNumber += 1) {
			await jobRolesPage.goToNextPage();

			await expect(page).toHaveURL(new RegExp(`page=${pageNumber}`));
			await expect(jobRolesPage.paginationStatus).toHaveText(
				`Page ${pageNumber} of ${totalPages}`,
			);
			await expect(jobRolesPage.jobCards).toHaveCount(pageSize);
			await expect(jobRolesPage.jobCardTitles).toHaveCount(pageSize);
			await expect(jobRolesPage.firstJobRoleTitle).not.toBeEmpty();
		}
	});

	test("returns to the first page of job roles with the First button", async ({
		page,
	}) => {
		const jobRolesPage = new JobRolesPage(page);
		const firstRoleOnPageOne = await jobRolesPage.firstJobRoleTitle.innerText();

		await jobRolesPage.goToNextPage();
		await expect(jobRolesPage.paginationStatus).toHaveText(
			`Page 2 of ${totalPages}`,
		);

		await jobRolesPage.goToFirstPage();

		await expect(page).toHaveURL(/page=1/);
		await expect(jobRolesPage.paginationStatus).toHaveText(
			`Page 1 of ${totalPages}`,
		);
		await expect(jobRolesPage.jobCards).toHaveCount(pageSize);
		await expect(jobRolesPage.firstJobRoleTitle).toHaveText(firstRoleOnPageOne);
		await expect(jobRolesPage.firstPageLink).toBeDisabled();
		await expect(jobRolesPage.previousPageLink).toBeDisabled();
	});

	test("moves to the final page of job roles with the Last button", async ({
		page,
	}) => {
		const jobRolesPage = new JobRolesPage(page);

		await jobRolesPage.goToLastPage();

		await expect(page).toHaveURL(new RegExp(`page=${totalPages}`));
		await expect(jobRolesPage.paginationStatus).toHaveText(
			`Page ${totalPages} of ${totalPages}`,
		);
		await expect(jobRolesPage.jobCards).toHaveCount(pageSize);
		await expect(jobRolesPage.nextPageLink).toBeDisabled();
		await expect(jobRolesPage.lastPageLink).toBeDisabled();
	});

	test("moves one page forward with the Next button", async ({ page }) => {
		const jobRolesPage = new JobRolesPage(page);
		const firstRoleOnPageOne = await jobRolesPage.firstJobRoleTitle.innerText();

		await jobRolesPage.goToNextPage();

		await expect(page).toHaveURL(/page=2/);
		await expect(jobRolesPage.paginationStatus).toHaveText(
			`Page 2 of ${totalPages}`,
		);
		await expect(jobRolesPage.jobCards).toHaveCount(pageSize);
		await expect(jobRolesPage.firstJobRoleTitle).not.toHaveText(
			firstRoleOnPageOne,
		);
	});

	test("moves one page back with the Previous button", async ({ page }) => {
		const jobRolesPage = new JobRolesPage(page);

		await jobRolesPage.goToNextPage();
		await jobRolesPage.goToNextPage();
		await expect(jobRolesPage.paginationStatus).toHaveText(
			`Page 3 of ${totalPages}`,
		);
		const firstRoleOnPageThree =
			await jobRolesPage.firstJobRoleTitle.innerText();

		await jobRolesPage.goToPreviousPage();

		await expect(page).toHaveURL(/page=2/);
		await expect(jobRolesPage.paginationStatus).toHaveText(
			`Page 2 of ${totalPages}`,
		);
		await expect(jobRolesPage.jobCards).toHaveCount(pageSize);
		await expect(jobRolesPage.firstJobRoleTitle).not.toHaveText(
			firstRoleOnPageThree,
		);
	});
});
