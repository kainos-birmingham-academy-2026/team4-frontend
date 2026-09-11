import { expect, test } from "@playwright/test";
import { testUser } from "../fixtures/testData";
import { JobRolesPage } from "../pages/jobRolesPage";
import { LoginPage } from "../pages/loginPage";
import { RegisterPage } from "../pages/registerPage";

test.describe("authentication", () => {
	test("shows public navigation and redirects browse roles to sign in", async ({
		page,
	}) => {
		await page.goto("/");

		await expect(page.locator("header #primary-nav")).toContainText(
			"Browse Roles",
		);
		await expect(page.locator('header a[href="/register"]')).toHaveText(
			"Sign Up",
		);
		await expect(page.locator('header a[href="/login"]')).toHaveText("Log In");

		await page.locator('header a[href="/job-roles"]').click();
		await expect(page).toHaveURL("/login");
	});

	test("shows the logged-in user's applications and authenticated navigation", async ({
		page,
	}) => {
		const loginPage = new LoginPage(page);
		await loginPage.open("/login");
		await loginPage.login(testUser.email, testUser.password);

		await expect(page.locator("header #primary-nav")).toContainText(
			"Browse Roles",
		);
		await expect(page.locator('header a[href="/applications"]')).toHaveText(
			"My Applications",
		);
		await expect(page.locator('header a[href="/logout"]')).toHaveText(
			"Log Out",
		);

		await page.locator('header a[href="/applications"]').click();
		await expect(page).toHaveURL("/applications");
		await expect(page.locator("main h1")).toHaveText("My Applications");
		await expect(page.locator('main a[href="/job-roles/1"]')).toHaveText(
			"Software Engineer",
		);
		await expect(page.locator(".application-status")).toHaveText("In Progress");
	});

	test("redirects an unauthenticated visitor from job roles to sign in", async ({
		page,
	}) => {
		const loginPage = new LoginPage(page);
		await loginPage.open("/job-roles");

		await expect(page).toHaveURL("/login");
		await expect(loginPage.heading).toHaveText("Sign In");
	});

	test("signs in with valid credentials and exposes sign out", async ({
		page,
	}) => {
		const loginPage = new LoginPage(page);
		await loginPage.open("/login");
		await loginPage.login(testUser.email, testUser.password);

		const jobRolesPage = new JobRolesPage(page);
		await expect(page).toHaveURL("/job-roles");
		await expect(jobRolesPage.heading).toHaveText("Explore Job Roles");
		await expect(jobRolesPage.logoutLink).toBeVisible();
	});

	test("shows an error for invalid sign-in credentials", async ({ page }) => {
		const loginPage = new LoginPage(page);
		await loginPage.open("/login");
		await loginPage.login(testUser.email, "NotTheRightPassword1!");

		await expect(page).toHaveURL("/login");
		await expect(loginPage.errorSummary).toContainText(
			"Invalid email or password",
		);
	});

	test("registers a valid account and signs the user in", async ({ page }) => {
		const registerPage = new RegisterPage(page);
		await registerPage.open("/register");
		await registerPage.register("new.user@example.com", testUser.password);

		const jobRolesPage = new JobRolesPage(page);
		await expect(page).toHaveURL("/job-roles");
		await expect(jobRolesPage.logoutLink).toBeVisible();
	});

	test("shows field errors for invalid registration data", async ({ page }) => {
		const registerPage = new RegisterPage(page);
		await registerPage.open("/register");
		await registerPage.register("not-an-email", "weak", "different");

		await expect(registerPage.fieldError("email")).toHaveText(
			"Enter a valid email address.",
		);
		await expect(registerPage.fieldError("password")).toContainText(
			"Password must be more than 8 characters",
		);
		await expect(registerPage.fieldError("confirmPassword")).toHaveText(
			"Passwords do not match.",
		);
		await expect(registerPage.emailInput).toHaveAttribute(
			"aria-invalid",
			"true",
		);
	});

	test("signs out and prevents further access to job roles", async ({
		page,
	}) => {
		const loginPage = new LoginPage(page);
		await loginPage.open("/login");
		await loginPage.login(testUser.email, testUser.password);

		const jobRolesPage = new JobRolesPage(page);
		await jobRolesPage.logout();
		await expect(page).toHaveURL("/login");

		await jobRolesPage.open("/job-roles");
		await expect(page).toHaveURL("/login");
	});
});
