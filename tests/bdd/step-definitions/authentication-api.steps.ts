import { Given, Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { testUser } from "../../fixtures/testData.ts";
import { JobRolesPage } from "../../pages/jobRolesPage.ts";
import { LoginPage } from "../../pages/loginPage.ts";
import type { CareersWorld } from "../support/world.ts";

Given("I have a registered account", async function (this: CareersWorld) {
	const response = await this.getApiRequest().get("/auth/login");

	expect(response.status()).toBe(404);
	await new LoginPage(this.getPage()).open("/login");
});

Given("I am ready to create an account", async function (this: CareersWorld) {
	const response = await this.getApiRequest().get("/auth/register");

	expect(response.status()).toBe(404);
	await this.getPage().goto("/register");
});

When("I sign in with valid credentials", async function (this: CareersWorld) {
	this.apiResponse = await this.getApiRequest().post("/auth/login", {
		data: {
			email: testUser.email,
			password: testUser.password,
		},
	});
	await new LoginPage(this.getPage()).login(testUser.email, testUser.password);
});

When("I sign in with invalid credentials", async function (this: CareersWorld) {
	this.apiResponse = await this.getApiRequest().post("/auth/login", {
		data: {
			email: "invalid@example.com",
			password: "wrong-password",
		},
	});
	await new LoginPage(this.getPage()).login(testUser.email, "wrong-password");
});

When(
	"I provide valid registration details",
	async function (this: CareersWorld) {
		this.apiResponse = await this.getApiRequest().post("/auth/register", {
			data: {
				...testUser,
				name: "Test User",
			},
		});
	},
);

When(
	"I use an email address that is already registered",
	async function (this: CareersWorld) {
		this.apiResponse = await this.getApiRequest().post("/auth/register", {
			data: {
				email: "existing@example.com",
				password: testUser.password,
				name: "Existing User",
			},
		});
	},
);

Then("I am authenticated successfully", async function (this: CareersWorld) {
	expect(this.apiResponse?.status()).toBe(200);
	expect(await this.apiResponse?.json()).toMatchObject({
		token: testUser.token,
	});
	await expect(this.getPage()).toHaveURL(/\/job-roles$/);
	await expect(new JobRolesPage(this.getPage()).heading).toHaveText(
		"Explore Job Roles",
	);
});

Then("I am not authenticated", async function (this: CareersWorld) {
	expect(this.apiResponse?.status()).toBe(401);
	await expect(this.getPage()).toHaveURL(/\/login$/);
});

Then(
	"I am informed that my credentials are invalid",
	async function (this: CareersWorld) {
		expect(await this.apiResponse?.json()).toEqual({
			error: "Invalid email or password",
		});
		await expect(new LoginPage(this.getPage()).errorSummary).toContainText(
			"Invalid email or password",
		);
	},
);

Then("my account is created successfully", async function (this: CareersWorld) {
	expect(this.apiResponse?.status()).toBe(200);
	expect(await this.apiResponse?.json()).toMatchObject({
		token: testUser.token,
	});
});

Then("my account is not created", function (this: CareersWorld) {
	expect(this.apiResponse?.status()).toBe(400);
});

Then(
	"I am informed that the email address is already in use",
	async function (this: CareersWorld) {
		expect(this.apiResponse?.status()).toBe(400);
		expect(await this.apiResponse?.json()).toEqual({
			error: "An account already exists for this email.",
		});
	},
);
