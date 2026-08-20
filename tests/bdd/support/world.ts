import { setWorldConstructor, World } from "@cucumber/cucumber";
import type { Browser, BrowserContext, Page } from "@playwright/test";

export class CareersWorld extends World {
	browser?: Browser;
	context?: BrowserContext;
	page?: Page;

	getPage(): Page {
		if (!this.page) {
			throw new Error("Browser page has not been created");
		}
		return this.page;
	}
}

setWorldConstructor(CareersWorld);
