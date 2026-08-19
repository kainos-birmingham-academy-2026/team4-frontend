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
		await expect(homePage.heading).toHaveText(homepageContent.heading);
		await expect(homePage.eyebrow).toHaveText(homepageContent.eyebrow);
	});

	test("exposes the primary navigation links", async ({ homePage }) => {
		await expect(homePage.primaryBrowseRolesLink).toHaveAttribute(
			"href",
			"/job-roles",
		);
		await expect(homePage.signUpLink).toHaveAttribute("href", "/register");
		await expect(homePage.loginLink).toHaveAttribute("href", "/login");
	});

	test("provides a route to browse open roles", async ({ homePage }) => {
		await expect(homePage.browseRolesLink).toHaveText(
			homepageContent.browseRolesLink,
		);
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
		homePage,
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

		await homePage.openChat();
		await homePage.selectChatPrompt(homepageContent.chat.engineeringPrompt);

		await expect(homePage.chatMessages).toContainText(
			homepageContent.chat.engineeringMessage,
		);
		await expect(homePage.chatMessages).toContainText(
			homepageContent.chat.response,
		);
	});

	test("shows a friendly message when chat is unavailable", async ({
		page,
		homePage,
	}) => {
		await page.route("**/api/chat", async (route) => {
			await route.fulfill({ status: 503, body: "Unavailable" });
		});

		await homePage.openChat();
		await homePage.sendChatMessage("What role suits me?");

		await expect(homePage.chatMessages).toContainText(
			homepageContent.chat.unavailableMessage,
		);
	});

	test("sends a typed chat message and displays the response", async ({
		page,
		homePage,
	}) => {
		await page.route("**/api/chat", async (route) => {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({
					message: "You might enjoy a Software Engineer role.",
					recommendations: [],
				}),
			});
		});

		await homePage.openChat();
		await homePage.sendChatMessage("I enjoy building web applications.");

		await expect(homePage.chatMessages).toContainText(
			"I enjoy building web applications.",
		);
		await expect(homePage.chatMessages).toContainText(
			"You might enjoy a Software Engineer role.",
		);
	});

	test("renders the footer contact and social links", async ({ homePage }) => {
		await expect(homePage.footer).toContainText("careers@kainos.com");
		await expect(homePage.linkedInLink).toHaveAttribute(
			"href",
			"https://www.linkedin.com/company/kainos/",
		);
		await expect(homePage.twitterLink).toHaveAttribute(
			"href",
			"https://twitter.com/KainosSoftware",
		);
		await expect(homePage.youtubeLink).toHaveAttribute(
			"href",
			"https://www.youtube.com/@kainos",
		);
	});
});

test.describe("home page on mobile", () => {
	test.use({ viewport: { width: 375, height: 667 } });

	test("opens and closes the primary navigation", async ({ homePage }) => {
		await homePage.open();
		await homePage.toggleNavigation();

		await expect(homePage.navToggle).toHaveAttribute("aria-expanded", "true");
		await expect(homePage.primaryNav).toHaveClass(/is-open/);

		await homePage.toggleNavigation();
		await expect(homePage.navToggle).toHaveAttribute("aria-expanded", "false");
	});
});
