import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./basePage";

export class PlaywrightHomePage extends BasePage {
	readonly heading: Locator;
	readonly eyebrow: Locator;
	readonly browseRolesLink: Locator;
	readonly primaryBrowseRolesLink: Locator;
	readonly signUpLink: Locator;
	readonly loginLink: Locator;
	readonly chatLauncher: Locator;
	readonly chatDialog: Locator;
	readonly closeChatButton: Locator;
	readonly chatPromptButtons: Locator;
	readonly chatMessages: Locator;
	readonly chatInput: Locator;
	readonly sendChatButton: Locator;
	readonly footer: Locator;
	readonly linkedInLink: Locator;
	readonly twitterLink: Locator;
	readonly youtubeLink: Locator;

	constructor(page: Page) {
		super(page);
		this.heading = page.locator("main h1");
		this.eyebrow = page.locator("main .eyebrow");
		this.browseRolesLink = page.locator('main a[href="/job-roles"]');
		this.primaryBrowseRolesLink = page.locator('header a[href="/job-roles"]');
		this.signUpLink = page.locator('header a[href="/register"]');
		this.loginLink = page.locator('header a[href="/login"]');
		this.chatLauncher = page.locator("[data-chat-toggle]");
		this.chatDialog = page.locator("[data-chat-widget] [role=dialog]");
		this.closeChatButton = page.locator("[data-chat-close]");
		this.chatPromptButtons = page.locator("[data-chat-prompt]");
		this.chatMessages = page.locator("[data-chat-messages]");
		this.chatInput = page.locator("#career-chat-input");
		this.sendChatButton = page.locator("[data-chat-form] button[type=submit]");
		this.footer = page.locator("footer");
		this.linkedInLink = this.footer.locator('a[href*="linkedin.com"]');
		this.twitterLink = this.footer.locator('a[href*="twitter.com"]');
		this.youtubeLink = this.footer.locator('a[href*="youtube.com"]');
	}

	async openChat(): Promise<void> {
		await this.chatLauncher.click();
	}

	async closeChat(): Promise<void> {
		await this.closeChatButton.click();
	}

	async selectChatPrompt(prompt: string): Promise<void> {
		await this.chatPromptButtons.filter({ hasText: prompt }).click();
	}

	async sendChatMessage(message: string): Promise<void> {
		await this.chatInput.fill(message);
		await this.sendChatButton.click();
	}
}
