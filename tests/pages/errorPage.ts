import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./basePage";

export class ErrorPage extends BasePage {
	readonly heading: Locator;
	readonly message: Locator;

	constructor(page: Page) {
		super(page);
		this.heading = page.locator("main h1");
		this.message = page.locator("main .hero-copy").first();
	}
}
