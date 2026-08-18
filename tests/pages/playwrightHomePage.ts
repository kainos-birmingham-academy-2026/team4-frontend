import type { Locator } from "@playwright/test";
import { homepageContent } from "../fixtures/testData";
import { BasePage } from "./basePage";

export class PlaywrightHomePage extends BasePage {
	readonly heading: Locator = this.page.getByRole("heading", {
		name: homepageContent.heading,
	});
	readonly browseRolesLink: Locator = this.page.getByRole("link", {
		name: homepageContent.browseRolesLink,
	});
	readonly chatLauncher: Locator = this.page.locator("[data-chat-toggle]");
	readonly chatDialog: Locator = this.page.getByRole("dialog", {
		name: homepageContent.chat.dialog,
	});

	async openChat(): Promise<void> {
		await this.chatLauncher.click();
	}

	async closeChat(): Promise<void> {
		await this.page
			.getByRole("button", { name: homepageContent.chat.close })
			.click();
	}
}
