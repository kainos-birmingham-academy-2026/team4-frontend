import { test as base } from "@playwright/test";
import { PlaywrightHomePage } from "../pages/playwrightHomePage";

export const test = base.extend<{ homePage: PlaywrightHomePage }>({
	homePage: async ({ page }, use) => {
		await use(new PlaywrightHomePage(page));
	},
});

export { expect } from "@playwright/test";
