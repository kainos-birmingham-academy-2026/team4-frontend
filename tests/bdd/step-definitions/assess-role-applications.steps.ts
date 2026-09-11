import { Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { JobRolesPage } from "../../pages/jobRolesPage.ts";
import type { CareersWorld } from "../support/world.ts";

async function openRoleByIndex(
	world: CareersWorld,
	index: number,
): Promise<void> {
	const page = world.getPage();
	await page.goto("/job-roles");
	const roleLink = new JobRolesPage(page).jobCards
		.nth(index)
		.getByRole("link", { name: "View Details" });
	await roleLink.click();
}

When(
	"I open the job specification for the second available job role",
	async function (this: CareersWorld) {
		await openRoleByIndex(this, 1);
	},
);

Then(
	"I should see the applications for the role",
	async function (this: CareersWorld) {
		await expect(
			this.getPage().getByRole("heading", { name: "Applications" }),
		).toBeVisible();
		await expect(
			this.getPage().getByText("applicant@example.com"),
		).toBeVisible();
	},
);

Then(
	"I should be able to view the applicant's message",
	async function (this: CareersWorld) {
		await this.getPage().getByText("applicant@example.com").click();
		await expect(
			this.getPage().getByText(
				"I am excited to contribute to the engineering team.",
			),
		).toBeVisible();
	},
);

When("I choose to hire the applicant", async function (this: CareersWorld) {
	await this.getPage().getByRole("button", { name: "Hire" }).click();
});

When("I choose to reject the applicant", async function (this: CareersWorld) {
	await this.getPage().getByRole("button", { name: "Reject" }).click();
});

When(
	"I cancel the assessment confirmation",
	async function (this: CareersWorld) {
		await this.getPage()
			.getByRole("dialog")
			.getByRole("button", { name: "Cancel" })
			.click();
	},
);

When("I confirm the assessment", async function (this: CareersWorld) {
	await this.getPage()
		.getByRole("dialog")
		.getByRole("button", { name: "Confirm" })
		.click();
});

Then(
	"the applicant should still have an In Progress status",
	async function (this: CareersWorld) {
		await expect(this.getPage().getByText("In Progress").last()).toBeVisible();
	},
);

Then(
	"the applicant should have a Hired status",
	async function (this: CareersWorld) {
		await expect(this.getPage()).toHaveURL(/assessed=hire/);
		await expect(this.getPage().getByText("Hired").last()).toBeVisible();
	},
);

Then(
	"the role should have one fewer open position",
	async function (this: CareersWorld) {
		await expect(
			this.getPage().getByText("We have 2 open positions for this role."),
		).toBeVisible();
	},
);

Then(
	"the applicant should have a Rejected status",
	async function (this: CareersWorld) {
		await expect(this.getPage()).toHaveURL(/assessed=reject/);
		await expect(this.getPage().getByText("Rejected").last()).toBeVisible();
	},
);
