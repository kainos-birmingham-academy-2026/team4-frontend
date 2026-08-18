import type { Locator } from "@playwright/test";
import { BasePage } from "./basePage";

export class JobRolesPage extends BasePage {
	readonly heading: Locator = this.page.getByRole("heading", {
		name: "Explore Job Roles",
	});
	readonly firstJobRole: Locator = this.page
		.locator(".job-card")
		.first()
		.getByRole("link", { name: "View Details" });

	async openFirstJobRole(): Promise<void> {
		await this.firstJobRole.click();
	}
}
