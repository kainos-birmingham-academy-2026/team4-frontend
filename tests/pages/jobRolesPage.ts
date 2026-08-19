import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./basePage.ts";

export class JobRolesPage extends BasePage {
	readonly heading: Locator;
	readonly firstJobRole: Locator;
	readonly firstJobRoleTitle: Locator;
	readonly jobRoleTitles: Locator;
	readonly roleNameInput: Locator;
	readonly locationInput: Locator;
	readonly closingDateInput: Locator;
	readonly applyFiltersButton: Locator;
	readonly clearFiltersLink: Locator;
	readonly noResultsMessage: Locator;
	readonly paginationStatus: Locator;
	readonly nextPageLink: Locator;
	readonly previousPageLink: Locator;
	readonly logoutLink: Locator;

	constructor(page: Page) {
		super(page);
		this.heading = page.locator("main h1");
		this.firstJobRole = page.locator(".job-card").first().locator(".btn");
		this.firstJobRoleTitle = page
			.locator(".job-card")
			.first()
			.locator(".job-card-title");
		this.jobRoleTitles = page.locator(".job-card-title");
		this.roleNameInput = page.locator("#filter-role-name");
		this.locationInput = page.locator("#filter-location");
		this.closingDateInput = page.locator("#filter-closing-date");
		this.applyFiltersButton = page.getByRole("button", {
			name: "Apply filters",
		});
		this.clearFiltersLink = page.getByRole("link", { name: "Clear filters" });
		this.noResultsMessage = page.locator(".jobs-listing");
		this.paginationStatus = page.locator(".pagination-status");
		this.nextPageLink = page.getByRole("link", { name: "Next" });
		this.previousPageLink = page.getByRole("link", { name: "Previous" });
		this.logoutLink = page.locator('header a[href="/logout"]');
	}

	async openFirstJobRole(): Promise<void> {
		await this.firstJobRole.click();
	}

	filterOption(name: string, value: string): Locator {
		return this.page.locator(`input[name="${name}"][value="${value}"]`);
	}

	filterDropdown(name: string, value: string): Locator {
		return this.filterOption(name, value).locator("xpath=ancestor::details");
	}

	filterDropdownCount(name: string): Locator {
		return this.page
			.locator(`details:has(input[name="${name}"])`)
			.locator(".filter-dropdown-count");
	}

	async applyRoleNameFilter(roleName: string): Promise<void> {
		await this.roleNameInput.fill(roleName);
		await this.applyFiltersButton.click();
	}

	async applyLocationFilter(location: string): Promise<void> {
		await this.locationInput.fill(location);
		await this.applyFiltersButton.click();
	}

	async applyClosingDateFilter(date: string): Promise<void> {
		await this.closingDateInput.fill(date);
		await this.applyFiltersButton.click();
	}

	async toggleCheckboxFilter(name: string, value: string): Promise<void> {
		const option = this.filterOption(name, value);
		const dropdown = this.filterDropdown(name, value);
		const summary = dropdown.locator("summary");
		await summary.click();
		await option.check();
		await summary.click();
	}

	async applyCheckboxFilter(name: string, value: string): Promise<void> {
		await this.toggleCheckboxFilter(name, value);
		await this.applyFiltersButton.click();
	}

	async applyCapabilityFilter(capability: string): Promise<void> {
		await this.applyCheckboxFilter("capability", capability);
	}

	async applyBandFilter(band: string): Promise<void> {
		await this.applyCheckboxFilter("band", band);
	}

	async applyStatusFilter(status: string): Promise<void> {
		await this.applyCheckboxFilter("status", status);
	}

	async clearFilters(): Promise<void> {
		await this.clearFiltersLink.first().click();
	}

	async goToNextPage(): Promise<void> {
		await this.nextPageLink.click();
	}

	async logout(): Promise<void> {
		await this.logoutLink.click();
	}
}
