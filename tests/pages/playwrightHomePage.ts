import type { Locator } from "@playwright/test";
import { BasePage } from "./basePage";

export class PlaywrightHomePage extends BasePage {
	readonly heading: Locator = this.page.getByRole("heading", {
		name: "Build your career on work that matters",
	});
	readonly browseRolesLink: Locator = this.page.getByRole("link", {
		name: "Browse open roles",
	});
	readonly chatLauncher: Locator = this.page.locator("[data-chat-toggle]");
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
