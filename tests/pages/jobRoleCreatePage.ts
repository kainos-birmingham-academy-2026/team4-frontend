import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./basePage.ts";

export class JobRoleCreatePage extends BasePage {
	readonly heading: Locator;
	readonly roleNameInput: Locator;
	readonly descriptionInput: Locator;
	readonly sharepointUrlInput: Locator;
	readonly responsibilitiesInput: Locator;
	readonly openPositionsInput: Locator;
	readonly locationInput: Locator;
	readonly closingDateInput: Locator;
	readonly capabilitySelect: Locator;
	readonly bandSelect: Locator;
	readonly submitButton: Locator;
	readonly cancelLink: Locator;

	constructor(page: Page) {
		super(page);
		this.heading = page.locator("main h1");
		this.roleNameInput = page.locator("#roleName");
		this.descriptionInput = page.locator("#description");
		this.sharepointUrlInput = page.locator("#sharepointUrl");
		this.responsibilitiesInput = page.locator("#responsibilities");
		this.openPositionsInput = page.locator("#numberOfOpenPositions");
		this.locationInput = page.locator("#location");
		this.closingDateInput = page.locator("#closingDate");
		this.capabilitySelect = page.locator("#capabilityId");
		this.bandSelect = page.locator("#bandId");
		this.submitButton = page.getByRole("button", { name: "Create job role" });
		this.cancelLink = page.getByRole("link", { name: "Cancel" });
	}

	async open(): Promise<void> {
		await super.open("/job-roles/new");
	}
}
