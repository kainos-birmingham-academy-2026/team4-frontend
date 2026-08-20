import { Given, Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { testUser } from "../../fixtures/testData.ts";
import type { CareersWorld } from "../support/world.ts";

Given(
	"the authentication API is available",
	async function (this: CareersWorld) {
		const response = await this.getApiRequest().get("/auth/login");

		expect(response.status()).toBe(404);
	},
);

When("I submit valid login credentials", async function (this: CareersWorld) {
	this.apiResponse = await this.getApiRequest().post("/auth/login", {
		data: {
			email: testUser.email,
			password: testUser.password,
		},
	});
});

When("I submit invalid login credentials", async function (this: CareersWorld) {
	this.apiResponse = await this.getApiRequest().post("/auth/login", {
		data: {
			email: "invalid@example.com",
			password: "wrong-password",
		},
	});
});

When(
	"I submit valid registration details",
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
	"I submit registration details for an existing user",
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

Then("the login response should be successful", function (this: CareersWorld) {
	expect(this.apiResponse?.status()).toBe(200);
});

Then(
	"the login response should be unauthorized",
	function (this: CareersWorld) {
		expect(this.apiResponse?.status()).toBe(401);
	},
);

Then(
	"the registration response should be successful",
	function (this: CareersWorld) {
		expect(this.apiResponse?.status()).toBe(200);
	},
);

Then(
	"the registration response should be rejected",
	function (this: CareersWorld) {
		expect(this.apiResponse?.status()).toBe(400);
	},
);

Then(
	"the response should contain an authentication token",
	async function (this: CareersWorld) {
		const body = await this.apiResponse?.json();

		expect(body).toMatchObject({ token: testUser.token });
	},
);

Then(
	"the response should contain the error {string}",
	async function (this: CareersWorld, expectedError: string) {
		const body = await this.apiResponse?.json();

		expect(body).toEqual({ error: expectedError });
	},
);
