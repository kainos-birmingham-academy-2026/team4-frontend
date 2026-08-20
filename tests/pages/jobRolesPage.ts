import { expect, type Locator, type Page } from "@playwright/test";
import { BasePage } from "./basePage.ts";

type JobRoleFilterCriteria = {
	roleName?: string;
	location?: string;
	closingDate?: string;
	capability?: string | string[];
	band?: string | string[];
	status?: string | string[];
};

type JobRoleSingleFilter =
	| "role name"
	| "location"
	| "closing date"
	| "band"
	| "status";

const filterLabels = {
	roleName: "role name",
	location: "location",
	closingDate: "closing date",
	capability: "capability",
	band: "band",
	status: "status",
} as const;

function toSingleFilter(filterType: string): JobRoleSingleFilter {
	switch (filterType.toLowerCase()) {
		case "role name":
		case "location":
		case "closing date":
		case "band":
		case "status":
			return filterType.toLowerCase() as JobRoleSingleFilter;
		default:
			throw new Error(`Unsupported job role filter type: ${filterType}`);
	}
}

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

	async expectFilterApplied(
		name: "roleName" | "location" | "closingDate",
		value: string,
	): Promise<void> {
		const input = {
			roleName: this.roleNameInput,
			location: this.locationInput,
			closingDate: this.closingDateInput,
		}[name];
		const label = filterLabels[name];

		await expect(
			this.page,
			`Expected ${label} filter to be present in the URL after applying filters`,
		).toHaveURL(new RegExp(`${name}=${value}`));
		await expect(
			input,
			`Expected ${label} filter input to show "${value}" after applying filters`,
		).toHaveValue(value);
	}

	async expectCheckboxFilterApplied(
		name: "capability" | "band" | "status",
		value: string,
	): Promise<void> {
		const label = filterLabels[name];

		await expect(
			this.page,
			`Expected ${label} filter to be present in the URL after applying filters`,
		).toHaveURL(
			new RegExp(`${name}=${encodeURIComponent(value).replace("%20", "\\+")}`),
		);
		await expect(
			this.filterOption(name, value),
			`Expected ${label} filter option "${value}" to be checked after applying filters`,
		).toBeChecked();
	}

	async expectSingleFilterApplied(
		filterType: string,
		value: string,
	): Promise<void> {
		switch (toSingleFilter(filterType)) {
			case "role name":
				await this.expectFilterApplied("roleName", value);
				break;
			case "location":
				await this.expectFilterApplied("location", value);
				break;
			case "closing date":
				await this.expectFilterApplied("closingDate", value);
				break;
			case "band":
				await this.expectCheckboxFilterApplied("band", value);
				break;
			case "status":
				await this.expectCheckboxFilterApplied("status", value);
				break;
		}
	}

	async expectFilterCount(
		name: "capability" | "band" | "status",
		count: string,
	): Promise<void> {
		await expect(
			this.filterDropdownCount(name),
			`Expected ${filterLabels[name]} filter count to show "${count}" after selecting filters`,
		).toHaveText(count);
	}

	async expectVisibleRoleTitles(roleNames: string[]): Promise<void> {
		await expect(
			this.jobRoleTitles,
			`Expected visible job roles to be ${roleNames.join(", ")}`,
		).toHaveText(roleNames);
	}

	async expectNoMatchingRoles(): Promise<void> {
		await expect(
			this.noResultsMessage,
			"Expected an empty state message when no job roles match the applied filters",
		).toContainText("No job roles match your filters.");
	}

	async expectFiltersCleared(): Promise<void> {
		await expect(
			this.page,
			"Expected URL to return to the job roles page after clicking Clear Filters",
		).toHaveURL("/job-roles");
		await expect(
			this.roleNameInput,
			"Expected role name filter to be cleared after clicking Clear Filters",
		).toHaveValue("");
		await expect(
			this.locationInput,
			"Expected location filter to be cleared after clicking Clear Filters",
		).toHaveValue("");
		await expect(
			this.closingDateInput,
			"Expected closing date filter to be cleared after clicking Clear Filters",
		).toHaveValue("");
		await expect(
			this.filterOption("status", "Open"),
			"Expected status filter option to be unchecked after clicking Clear Filters",
		).not.toBeChecked();
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

	async applySingleFilter(filterType: string, value: string): Promise<void> {
		switch (toSingleFilter(filterType)) {
			case "role name":
				await this.applyRoleNameFilter(value);
				break;
			case "location":
				await this.applyLocationFilter(value);
				break;
			case "closing date":
				await this.applyClosingDateFilter(value);
				break;
			case "band":
				await this.applyBandFilter(value);
				break;
			case "status":
				await this.applyStatusFilter(value);
				break;
		}
	}

	async applyFilters(filters: JobRoleFilterCriteria): Promise<void> {
		if (filters.roleName) {
			await this.roleNameInput.fill(filters.roleName);
		}
		if (filters.location) {
			await this.locationInput.fill(filters.location);
		}
		if (filters.closingDate) {
			await this.closingDateInput.fill(filters.closingDate);
		}

		await this.toggleCheckboxFilters("capability", filters.capability);
		await this.toggleCheckboxFilters("band", filters.band);
		await this.toggleCheckboxFilters("status", filters.status);

		await this.applyFiltersButton.click();
	}

	async toggleCheckboxFilters(
		name: string,
		values?: string | string[],
	): Promise<void> {
		for (const value of Array.isArray(values)
			? values
			: values
				? [values]
				: []) {
			await this.toggleCheckboxFilter(name, value);
		}
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
