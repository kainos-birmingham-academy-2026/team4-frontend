import { expect, test } from "../fixtures/pageObjectsFixture";
import {
	adminUser,
	jobRoleDetailContent,
	jobRoleListContent,
	mockJobRole,
	mockJobRoles,
	testUser,
} from "../fixtures/testData";
import { ErrorPage } from "../pages/errorPage";
import { JobRoleCreatePage } from "../pages/jobRoleCreatePage";
import { JobRoleDetailPage } from "../pages/jobRoleDetailPage";
import { JobRoleEditPage } from "../pages/jobRoleEditPage";
import { JobRolesPage } from "../pages/jobRolesPage";
import { LoginPage } from "../pages/loginPage";

const deletableJobRole = mockJobRoles[mockJobRoles.length - 1];

async function signIn(page: import("@playwright/test").Page): Promise<void> {
	const loginPage = new LoginPage(page);
	await loginPage.open("/login");
	await loginPage.login(testUser.email, testUser.password);
}

async function signInAsAdmin(
	page: import("@playwright/test").Page,
): Promise<void> {
	const loginPage = new LoginPage(page);
	await loginPage.open("/login");
	await loginPage.login(adminUser.email, adminUser.password);
}

test.describe("add new job role", () => {
	test("does not show the Add new role action to a User", async ({ page }) => {
		await signIn(page);

		await expect(
			page.getByRole("link", { name: "Add new role" }),
		).not.toBeVisible();
	});

	test("allows an Admin to complete the form and see confirmation", async ({
		page,
	}) => {
		await signInAsAdmin(page);
		const jobRolesPage = new JobRolesPage(page);
		await expect(
			page.getByRole("link", { name: "Add new role" }),
		).toBeVisible();
		await page.getByRole("link", { name: "Add new role" }).click();

		const createPage = new JobRoleCreatePage(page);
		await expect(createPage.heading).toHaveText("Add New Job Role");
		await createPage.roleNameInput.fill("Platform Engineer");
		await createPage.descriptionInput.fill("Build reliable platforms.");
		await createPage.sharepointUrlInput.fill(
			"https://sharepoint.example.com/platform-engineer",
		);
		await createPage.responsibilitiesInput.fill(
			"Build platform services\nReview technical designs",
		);
		await createPage.openPositionsInput.fill("2");
		await createPage.locationInput.fill("Belfast");
		await createPage.closingDateInput.fill("2026-12-31");
		await createPage.capabilitySelect.selectOption("1");
		await createPage.bandSelect.selectOption("1");
		await createPage.submitButton.click();

		await expect(page).toHaveURL(/\/job-roles\?created=1/);
		await expect(page.getByRole("status")).toContainText(
			"Job role successfully created.",
		);
		await expect(jobRolesPage.heading).toHaveText("Explore Job Roles");
	});

	test("prevents submission when required fields are empty", async ({
		page,
	}) => {
		await signInAsAdmin(page);
		await page.getByRole("link", { name: "Add new role" }).click();

		const createPage = new JobRoleCreatePage(page);
		await createPage.submitButton.click();

		await expect(page).toHaveURL(/\/job-roles\/new/);
		await expect(createPage.roleNameInput).toBeFocused();
	});
});

test.describe("job role details", () => {
	test("shows a confirmation before deleting from the specification page", async ({
		page,
		request,
	}) => {
		await request.post("http://127.0.0.1:4001/__test__/reset");
		await signInAsAdmin(page);
		await page.goto(`/job-roles/${deletableJobRole.jobRoleId}`);

		page.once("dialog", async (dialog) => {
			expect(dialog.type()).toBe("confirm");
			expect(dialog.message()).toContain("delete this job role");
			await dialog.dismiss();
		});

		const detailPage = new JobRoleDetailPage(page);
		await detailPage.deleteButton.click();
		await expect(page).toHaveURL(`/job-roles/${deletableJobRole.jobRoleId}`);
		await expect(detailPage.heading).toHaveText(deletableJobRole.roleName);
	});

	test("allows an Admin to delete a role from the specification page", async ({
		page,
		request,
	}) => {
		await request.post("http://127.0.0.1:4001/__test__/reset");
		await signInAsAdmin(page);
		await page.goto(`/job-roles/${deletableJobRole.jobRoleId}`);

		page.once("dialog", (dialog) => dialog.accept());
		await page.getByRole("button", { name: "Delete this role" }).click();

		await expect(page).toHaveURL(/\/job-roles\?deleted=1/);
		await expect(page.getByRole("status")).toContainText(
			"Job role successfully deleted.",
		);
		await expect(page.getByText(deletableJobRole.roleName)).not.toBeVisible();
	});

	test("allows an Admin to open editing from the job role specification", async ({
		page,
	}) => {
		await signInAsAdmin(page);
		await page.goto(`/job-roles/${mockJobRole.jobRoleId}`);

		await page.getByRole("link", { name: "Edit this role" }).click();

		const editPage = new JobRoleEditPage(page);
		await expect(page).toHaveURL(`/job-roles/${mockJobRole.jobRoleId}/edit`);
		await expect(editPage.heading).toHaveText("Edit Job Role");
		await expect(editPage.roleNameInput).toHaveValue(mockJobRole.roleName);
	});

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

test.describe("edit job role", () => {
	test("opens from the job roles list and pre-populates every field", async ({
		page,
	}) => {
		await signInAsAdmin(page);
		const jobRolesPage = new JobRolesPage(page);
		await jobRolesPage.jobCards
			.first()
			.getByRole("link", { name: "Edit" })
			.click();

		const editPage = new JobRoleEditPage(page);
		await expect(page).toHaveURL(`/job-roles/${mockJobRole.jobRoleId}/edit`);
		await expect(editPage.heading).toHaveText("Edit Job Role");
		await expect(editPage.roleNameInput).toHaveValue(mockJobRole.roleName);
		await expect(editPage.descriptionInput).toHaveValue(
			mockJobRole.description,
		);
		await expect(editPage.sharepointUrlInput).toHaveValue(
			mockJobRole.sharepointUrl,
		);
		await expect(editPage.responsibilitiesInput).toHaveValue(
			mockJobRole.responsibilities.join("\n"),
		);
		await expect(editPage.openPositionsInput).toHaveValue(
			String(mockJobRole.numberOfOpenPositions),
		);
		await expect(editPage.locationInput).toHaveValue(mockJobRole.location);
		await expect(editPage.closingDateInput).toHaveValue("2026-12-31");
		await expect(editPage.capabilitySelect).toHaveValue(
			String(mockJobRole.capabilityId),
		);
		await expect(editPage.bandSelect).toHaveValue(String(mockJobRole.bandId));
		await expect(editPage.statusSelect).toHaveValue(
			String(mockJobRole.statusId),
		);
	});

	test("validates the required status before submitting", async ({ page }) => {
		await signInAsAdmin(page);
		const editPage = new JobRoleEditPage(page);
		await editPage.openRole(mockJobRole.jobRoleId);
		await editPage.statusSelect.selectOption("");
		await editPage.submitButton.click();

		await expect(page).toHaveURL(`/job-roles/${mockJobRole.jobRoleId}/edit`);
		await expect(editPage.statusSelect).toBeFocused();
	});

	test("submits the edited role and shows confirmation", async ({
		page,
		request,
	}) => {
		await signInAsAdmin(page);
		const editPage = new JobRoleEditPage(page);
		await editPage.openRole(mockJobRole.jobRoleId);
		await editPage.roleNameInput.fill("Senior Software Engineer");
		await editPage.descriptionInput.fill("Lead reliable software delivery.");
		await editPage.responsibilitiesInput.fill("Lead delivery\nReview designs");
		await editPage.openPositionsInput.fill("4");
		await editPage.locationInput.fill("Belfast");
		await editPage.statusSelect.selectOption("2");

		await editPage.submitButton.click();

		const updateResponse = await request.get(
			"http://127.0.0.1:4001/__test__/last-update",
		);
		const update = await updateResponse.json();
		expect(update).toMatchObject({
			id: mockJobRole.jobRoleId,
			body: {
				roleName: "Senior Software Engineer",
				description: "Lead reliable software delivery.",
				responsibilities: ["Lead delivery", "Review designs"],
				numberOfOpenPositions: 4,
				location: "Belfast",
				statusId: 2,
			},
		});
		await expect(page).toHaveURL(/\/job-roles\?updated=1/);
		await expect(page.getByRole("status")).toContainText(
			"Job role successfully updated.",
		);
	});
});

test.describe("job role listing", () => {
	test.beforeEach(async ({ page, request }) => {
		await request.post("http://127.0.0.1:4001/__test__/reset");
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

	test("allows an Admin to delete a role from the job roles list", async ({
		page,
		request,
	}) => {
		await request.post("http://127.0.0.1:4001/__test__/reset");
		await page.goto("/logout");
		await signInAsAdmin(page);
		const jobRolesPage = new JobRolesPage(page);
		await jobRolesPage.applyRoleNameFilter(deletableJobRole.roleName);

		page.once("dialog", (dialog) => dialog.accept());
		await jobRolesPage.deleteButtons.click();

		await expect(page).toHaveURL(/\/job-roles\?deleted=1/);
		await expect(page.getByRole("status")).toContainText(
			"Job role successfully deleted.",
		);
		await expect(page.getByText(deletableJobRole.roleName)).not.toBeVisible();
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

	test("orders roles ascending, descending, then resets ordering", async ({
		page,
	}) => {
		const jobRolesPage = new JobRolesPage(page);

		await jobRolesPage.sortBy("roleName");
		await expect(page).toHaveURL(/sortBy=roleName&sortOrder=asc/);
		await expect(jobRolesPage.firstJobRoleTitle).toHaveText("Data Analyst");

		await jobRolesPage.sortBy("roleName");
		await expect(page).toHaveURL(/sortBy=roleName&sortOrder=desc/);
		await expect(jobRolesPage.firstJobRoleTitle).toHaveText(
			"Software Engineer",
		);

		await jobRolesPage.sortBy("roleName");
		await expect(page).not.toHaveURL(/sortBy=/);
		await expect(page).not.toHaveURL(/sortOrder=/);
		await expect(jobRolesPage.firstJobRoleTitle).toHaveText(
			"Software Engineer",
		);
	});

	test("shows a clickable ordering link for every displayed role field", async ({
		page,
	}) => {
		const jobRolesPage = new JobRolesPage(page);
		const sortableColumns = [
			"roleName",
			"location",
			"capability",
			"band",
			"closingDate",
			"status",
		] as const;

		for (const column of sortableColumns) {
			await expect(jobRolesPage.sortLink(column)).toBeVisible();
		}
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
