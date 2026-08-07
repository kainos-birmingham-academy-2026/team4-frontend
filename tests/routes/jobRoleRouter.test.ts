import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import app from "../../src/app";

describe("JobRoleRouter", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("GET /job-roles should return the job roles page with the correct title", async () => {
		const response = await request(app).get("/job-roles");

		expect(response.status).toBe(200);
		expect(response.text).toContain(
			"<title>Kainos Careers - Job Roles</title>",
		);
	});
});

describe("GET /", () => {
	it("should return the home page with the correct title", async () => {
		const response = await request(app).get("/");

		expect(response.status).toBe(200);
		expect(response.text).toContain("<title>Kainos Careers - Home</title>");
	});
});

describe("GET /register", () => {
	it("should return the register page with the correct title", async () => {
		const response = await request(app).get("/register");

		expect(response.status).toBe(200);
		expect(response.text).toContain("<title>Kainos Careers - Register</title>");
	});
});

describe("GET /login", () => {
	it("should return the login page with the correct title", async () => {
		const response = await request(app).get("/login");

		expect(response.status).toBe(200);
		expect(response.text).toContain("<title>Kainos Careers - Sign In</title>");
	});
});

describe("GET /job-roles", () => {
	it("GET /job-roles should return the job roles page with the correct title", async () => {
		const response = await request(app).get("/job-roles");

		expect(response.status).toBe(200);
		expect(response.text).toContain(
			"<title>Kainos Careers - Job Roles</title>",
		);
	});
});
