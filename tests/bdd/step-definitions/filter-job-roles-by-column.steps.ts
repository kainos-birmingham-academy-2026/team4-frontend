import { Given, Then, When } from "@cucumber/cucumber";
import { JobRolesPage } from "../../pages/jobRolesPage.ts";
import type { CareersWorld } from "../support/world.ts";

When(
	"I filter job roles by {string} {string}",
	async function (this: CareersWorld, filterType: string, value: string) {
		const jobRolesPage = new JobRolesPage(this.getPage());
		await jobRolesPage.applySingleFilter(filterType, value);
		await jobRolesPage.expectSingleFilterApplied(filterType, value);
	},
);

When(
	"I filter job roles by location {string} and status {string}",
	async function (this: CareersWorld, location: string, status: string) {
		const jobRolesPage = new JobRolesPage(this.getPage());
		await jobRolesPage.applyFilters({ location, status });
		await jobRolesPage.expectFilterApplied("location", location);
		await jobRolesPage.expectCheckboxFilterApplied("status", status);
	},
);

When(
	"I select the band filters {string} and {string}",
	async function (this: CareersWorld, firstBand: string, secondBand: string) {
		const jobRolesPage = new JobRolesPage(this.getPage());
		await jobRolesPage.applyFilters({ band: [firstBand, secondBand] });
		await jobRolesPage.expectCheckboxFilterApplied("band", firstBand);
		await jobRolesPage.expectCheckboxFilterApplied("band", secondBand);
		await jobRolesPage.expectFilterCount("band", "2");
	},
);

Given(
	"I have applied role name, location, closing date and status filters",
	async function (this: CareersWorld) {
		const jobRolesPage = new JobRolesPage(this.getPage());
		await jobRolesPage.applyFilters({
			roleName: "Software",
			location: "London",
			closingDate: "2026-12-31",
			status: "Open",
		});
		await jobRolesPage.expectFilterApplied("roleName", "Software");
		await jobRolesPage.expectFilterApplied("location", "London");
		await jobRolesPage.expectFilterApplied("closingDate", "2026-12-31");
		await jobRolesPage.expectCheckboxFilterApplied("status", "Open");
	},
);

When("I clear the job role filters", async function (this: CareersWorld) {
	const jobRolesPage = new JobRolesPage(this.getPage());
	await jobRolesPage.clearFilters();
	await jobRolesPage.expectFiltersCleared();
});

Then(
	"I should see only the {string} role",
	async function (this: CareersWorld, roleName: string) {
		const jobRolesPage = new JobRolesPage(this.getPage());
		await jobRolesPage.expectVisibleRoleTitles([roleName]);
	},
);

Then(
	"I should see the job roles {string}",
	async function (this: CareersWorld, expectedRoles: string) {
		const jobRolesPage = new JobRolesPage(this.getPage());
		const roleNames = expectedRoles
			.split(",")
			.map((roleName) => roleName.trim());
		await jobRolesPage.expectVisibleRoleTitles(roleNames);
	},
);

Then("I should see no matching job roles", async function (this: CareersWorld) {
	const jobRolesPage = new JobRolesPage(this.getPage());
	await jobRolesPage.expectNoMatchingRoles();
});

Then(
	"I should see the {string} and {string} roles",
	async function (this: CareersWorld, firstRole: string, secondRole: string) {
		const jobRolesPage = new JobRolesPage(this.getPage());
		await jobRolesPage.expectVisibleRoleTitles([firstRole, secondRole]);
	},
);

Then(
	"the band filter count should show {string}",
	async function (this: CareersWorld, count: string) {
		const jobRolesPage = new JobRolesPage(this.getPage());
		await jobRolesPage.expectFilterCount("band", count);
	},
);

Then(
	"all job role filters should be cleared",
	async function (this: CareersWorld) {
		const jobRolesPage = new JobRolesPage(this.getPage());
		await jobRolesPage.expectFiltersCleared();
	},
);
