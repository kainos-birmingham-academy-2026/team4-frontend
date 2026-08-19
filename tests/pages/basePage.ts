import type { Page } from "@playwright/test";

export class BasePage {
	protected readonly page: Page;

	constructor(page: Page) {
		this.page = page;
	}

	async open(path = "/"): Promise<void> {
		await this.page.goto(path);
	}
}
