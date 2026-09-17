import { expect, test } from "../fixtures/pageObjectsFixture";
import { mockJobRoles, testUser } from "../fixtures/testData";
import { LoginPage } from "../pages/loginPage";

async function signIn(page: import("@playwright/test").Page): Promise<void> {
	const loginPage = new LoginPage(page);
	await loginPage.open("/login");
	await loginPage.login(testUser.email, testUser.password);
}

test.describe("job role application eligibility", () => {
	test.beforeEach(async ({ request }) => {
		await request.post("http://127.0.0.1:4001/__test__/reset");
	});

	test("does not allow applying to a closed role", async ({ page }) => {
		const closedRole = mockJobRoles.find((role) => role.status === "Closed");
		if (!closedRole) {
			throw new Error("Expected a closed fixture role");
		}

		await signIn(page);
		await page.goto(`/job-roles/${closedRole.jobRoleId}`);

		await expect(
			page.getByRole("link", { name: "Apply Now" }),
		).not.toBeVisible();
		await page.goto(`/job-roles/${closedRole.jobRoleId}/apply`);

		await expect(page).toHaveURL(
			`/job-roles/${closedRole.jobRoleId}?applicationUnavailable=true`,
		);
		await expect(page.getByRole("alert")).toContainText(
			"This role is no longer accepting applications.",
		);
	});

	test("allows applying to an open role with available positions", async ({
		page,
	}) => {
		const openRole = mockJobRoles.find(
			(role) =>
				role.status === "Open" &&
				role.numberOfOpenPositions > 0 &&
				role.jobRoleId === 2,
		);
		if (!openRole) {
			throw new Error("Expected an open fixture role with positions");
		}

		await signIn(page);
		await page.goto(`/job-roles/${openRole.jobRoleId}`);
		await page.getByRole("link", { name: "Apply Now" }).click();

		await expect(page).toHaveURL(`/job-roles/${openRole.jobRoleId}/apply`);
		await page.locator("#message").fill("I am very interested in this role.");
		await page.getByRole("button", { name: "Submit Application" }).click();

		await expect(page).toHaveURL(`/job-roles/${openRole.jobRoleId}`);
		await expect(page.locator(".applied-banner")).toContainText(
			"Your application has been submitted and is now in progress.",
		);
	});
});
