import { setWorldConstructor, World } from "@cucumber/cucumber";
import type {
	APIRequestContext,
	APIResponse,
	Browser,
	BrowserContext,
	Page,
} from "@playwright/test";

export class CareersWorld extends World {
	browser?: Browser;
	context?: BrowserContext;
	page?: Page;
	apiRequest?: APIRequestContext;
	apiResponse?: APIResponse;

	getPage(): Page {
		if (!this.page) {
			throw new Error("Browser page has not been created");
		}
		return this.page;
	}

	getApiRequest(): APIRequestContext {
		if (!this.apiRequest) {
			throw new Error("API request context has not been created");
		}
		return this.apiRequest;
	}
}

setWorldConstructor(CareersWorld);
