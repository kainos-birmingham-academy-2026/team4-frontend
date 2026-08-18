import type { Locator } from "@playwright/test";
import { BasePage } from "./basePage";

export class PlaywrightHomePage extends BasePage {
	readonly heading: Locator = this.page.getByRole("heading", {
		name: "Find your next role at Kainos",
	});
	readonly searchInput: Locator = this.page.getByRole("textbox", {
		name: "Search by title, keyword, or skill",
	});
	readonly searchButton: Locator = this.page.getByRole("button", {
		name: "Search",
	});
	readonly chatLauncher: Locator = this.page.getByRole("button", {
		name: "Ask about roles",
	});
	readonly chatDialog: Locator = this.page.getByRole("dialog", {
		name: "Role discovery assistant",
	});

	async openChat(): Promise<void> {
		await this.chatLauncher.click();
	}

	async closeChat(): Promise<void> {
		await this.page.getByRole("button", { name: "Close chat" }).click();
	}
}
