import { Given, Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { JobRolesPage } from "../../pages/jobRolesPage.ts";
import type { CareersWorld } from "../support/world.ts";

When(
	"I filter job roles by location {string}",
	async function (this: CareersWorld, location: string) {
		const jobRolesPage = new JobRolesPage(this.getPage());
		await jobRolesPage.applyLocationFilter(location);
	},
);

When(
	"I filter job roles by band {string}",
	async function (this: CareersWorld, band: string) {
		const jobRolesPage = new JobRolesPage(this.getPage());
		await jobRolesPage.applyBandFilter(band);
	},
);

When(
	"I filter job roles by status {string}",
	async function (this: CareersWorld, status: string) {
		const jobRolesPage = new JobRolesPage(this.getPage());
		await jobRolesPage.applyStatusFilter(status);
	},
);

When(
	"I filter job roles by closing date {string}",
	async function (this: CareersWorld, closingDate: string) {
		const jobRolesPage = new JobRolesPage(this.getPage());
		await jobRolesPage.applyClosingDateFilter(closingDate);
	},
);

When(
	"I filter job roles by location {string} and status {string}",
	async function (this: CareersWorld, location: string, status: string) {
		const jobRolesPage = new JobRolesPage(this.getPage());
		await jobRolesPage.locationInput.fill(location);
		await jobRolesPage.toggleCheckboxFilter("status", status);
		await jobRolesPage.applyFiltersButton.click();
	},
);

When(
	"I select the band filters {string} and {string}",
	async function (this: CareersWorld, firstBand: string, secondBand: string) {
		const jobRolesPage = new JobRolesPage(this.getPage());
		await jobRolesPage.toggleCheckboxFilter("band", firstBand);
		await jobRolesPage.toggleCheckboxFilter("band", secondBand);
		await jobRolesPage.applyFiltersButton.click();
	},
);

Given(
	"I have applied role name, location, closing date and status filters",
	async function (this: CareersWorld) {
		const jobRolesPage = new JobRolesPage(this.getPage());
		await jobRolesPage.roleNameInput.fill("Software");
		await jobRolesPage.locationInput.fill("London");
		await jobRolesPage.closingDateInput.fill("2026-12-31");
		await jobRolesPage.toggleCheckboxFilter("status", "Open");
		await jobRolesPage.applyFiltersButton.click();
	},
);

When("I clear the job role filters", async function (this: CareersWorld) {
	const jobRolesPage = new JobRolesPage(this.getPage());
	await jobRolesPage.clearFilters();
});

Then(
	"I should see only the {string} role",
	async function (this: CareersWorld, roleName: string) {
		const jobRolesPage = new JobRolesPage(this.getPage());
		await expect(jobRolesPage.jobRoleTitles).toHaveText([roleName]);
	},
);

Then(
	"I should see the {string} and {string} roles",
	async function (this: CareersWorld, firstRole: string, secondRole: string) {
		const jobRolesPage = new JobRolesPage(this.getPage());
		await expect(jobRolesPage.jobRoleTitles).toHaveText([
			firstRole,
			secondRole,
		]);
	},
);

Then(
	"the band filter count should show {string}",
	async function (this: CareersWorld, count: string) {
		const jobRolesPage = new JobRolesPage(this.getPage());
		await expect(jobRolesPage.filterDropdownCount("band")).toHaveText(count);
	},
);

Then(
	"all job role filters should be cleared",
	async function (this: CareersWorld) {
		const page = this.getPage();
		const jobRolesPage = new JobRolesPage(page);
		await expect(page).toHaveURL("/job-roles");
		await expect(jobRolesPage.roleNameInput).toHaveValue("");
		await expect(jobRolesPage.locationInput).toHaveValue("");
		await expect(jobRolesPage.closingDateInput).toHaveValue("");
		await expect(jobRolesPage.filterOption("status", "Open")).not.toBeChecked();
	},
);
