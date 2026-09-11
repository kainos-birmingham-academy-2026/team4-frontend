import { Given, Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { testUser } from "../../fixtures/testData.ts";
import { LoginPage } from "../../pages/loginPage.ts";
import type { CareersWorld } from "../support/world.ts";

Given("I am signed in as an applicant", async function (this: CareersWorld) {
	const loginPage = new LoginPage(this.getPage());
	await loginPage.open("/login");
	await loginPage.login(testUser.email, testUser.password);
});

Given("I am on the home page", async function (this: CareersWorld) {
	await this.getPage().goto("/");
});

When("I open my applications", async function (this: CareersWorld) {
	await this.getPage().getByRole("link", { name: "My Applications" }).click();
});

When(
	"I choose Browse Roles from the navigation",
	async function (this: CareersWorld) {
		await this.getPage()
			.locator("header #primary-nav")
			.getByRole("link", { name: "Browse Roles" })
			.click();
	},
);

Then(
	"I should see the role name linked to its job details",
	async function (this: CareersWorld) {
		const roleLink = this.getPage().getByRole("link", {
			name: "Software Engineer",
		});
		await expect(roleLink).toHaveAttribute("href", "/job-roles/1");
	},
);

Then(
	"I should see the application status",
	async function (this: CareersWorld) {
		await expect(this.getPage().locator(".application-status")).toHaveText(
			"In Progress",
		);
	},
);

Then(
	"I should see the public navigation links",
	async function (this: CareersWorld) {
		const navigation = this.getPage().locator("header #primary-nav");
		await expect(navigation).toContainText("Browse Roles");
		await expect(navigation).toContainText("Sign Up");
		await expect(navigation).toContainText("Log In");
	},
);

Then("I should be redirected to sign in", async function (this: CareersWorld) {
	await expect(this.getPage()).toHaveURL(/\/login$/);
});
