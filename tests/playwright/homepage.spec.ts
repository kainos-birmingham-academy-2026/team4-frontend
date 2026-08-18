import { expect, test } from "../fixtures/pageObjectsFixture";
import { homepageContent } from "../fixtures/testData";

test.describe("home page", () => {
	test.beforeEach(async ({ homePage }) => {
		await homePage.open();
	});

	test("renders the page title and primary content", async ({
		page,
		homePage,
	}) => {
		await expect(page).toHaveTitle(homepageContent.title);
		await expect(homePage.heading).toBeVisible();
		await expect(
			page.getByText(homepageContent.eyebrow, { exact: true }),
		).toBeVisible();
	});

	test("exposes the primary navigation links", async ({ page }) => {
		await expect(
			page.getByRole("link", { name: "Browse Roles" }),
		).toHaveAttribute("href", "/job-roles");
		await expect(page.getByRole("link", { name: "Sign Up" })).toHaveAttribute(
			"href",
			"/register",
		);
		await expect(page.getByRole("link", { name: "Log In" })).toHaveAttribute(
			"href",
			"/login",
		);
	});

	test("provides a route to browse open roles", async ({ homePage }) => {
		await expect(homePage.browseRolesLink).toBeVisible();
		await expect(homePage.browseRolesLink).toHaveAttribute(
			"href",
			"/job-roles",
		);
	});

	test("opens and closes the careers assistant", async ({ homePage }) => {
		await expect(homePage.chatDialog).toBeHidden();
		await homePage.openChat();
		await expect(homePage.chatDialog).toBeVisible();
		await expect(homePage.chatLauncher).toHaveAttribute(
			"aria-expanded",
			"true",
		);

		await homePage.closeChat();
		await expect(homePage.chatDialog).toBeHidden();
		await expect(homePage.chatLauncher).toHaveAttribute(
			"aria-expanded",
			"false",
		);
	});

	test("sends a suggested chat prompt and displays the response", async ({
		page,
	}) => {
		await page.route("**/api/chat", async (route) => {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({
					message: homepageContent.chat.response,
					recommendations: [],
				}),
			});
		});

		await page
			.getByRole("button", { name: homepageContent.chat.launcher })
			.click();
		await page
			.getByRole("button", { name: homepageContent.chat.engineeringPrompt })
			.click();

		const messages = page.getByLabel("Chat messages");
		await expect(messages).toContainText(
			homepageContent.chat.engineeringMessage,
		);
		await expect(messages).toContainText(homepageContent.chat.response);
	});

	test("shows a friendly message when chat is unavailable", async ({
		page,
	}) => {
		await page.route("**/api/chat", async (route) => {
			await route.fulfill({ status: 503, body: "Unavailable" });
		});

		await page
			.getByRole("button", { name: homepageContent.chat.launcher })
			.click();
		await page
			.getByRole("textbox", { name: "Ask about job roles" })
			.fill("What role suits me?");
		await page.getByRole("button", { name: "Send" }).click();

		await expect(page.getByLabel("Chat messages")).toContainText(
			homepageContent.chat.unavailableMessage,
		);
	});

	test("renders the footer contact and social links", async ({ page }) => {
		const footer = page.getByRole("contentinfo", { name: "Footer" });

		await expect(footer).toContainText("careers@kainos.com");
		await expect(
			footer.getByRole("link", { name: "LinkedIn" }),
		).toHaveAttribute("href", "https://www.linkedin.com/company/kainos/");
		await expect(
			footer.getByRole("link", { name: "X / Twitter" }),
		).toHaveAttribute("href", "https://twitter.com/KainosSoftware");
		await expect(footer.getByRole("link", { name: "YouTube" })).toHaveAttribute(
			"href",
			"https://www.youtube.com/@kainos",
		);
	});
});
