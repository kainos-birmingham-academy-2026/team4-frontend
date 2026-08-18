import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./basePage";

export class JobRolesPage extends BasePage {
	readonly heading: Locator;
	readonly firstJobRole: Locator;

	constructor(page: Page) {
		super(page);
		this.heading = page.locator("main h1");
		this.firstJobRole = page.locator(".job-card").first().locator(".btn");
	}

	async openFirstJobRole(): Promise<void> {
		await this.firstJobRole.click();
	}
}
