import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import app from "../../src/app";
import {
	getAllJobRoles,
	getJobRoleById,
} from "../../src/services/jobRoleApiService";
import { mockJobRoles } from "../mockJobRoles";

vi.mock("../../src/services/jobRoleApiService", () => ({
	getAllJobRoles: vi.fn(),
	getJobRoleById: vi.fn(),
}));

vi.mock("../../src/middlewares/authMiddleware", () => ({
	requireAuth: vi.fn((req, res, next) => next()),
}));

describe("GET /job-roles", () => {
	it("should return the job roles page with the correct title", async () => {
		vi.mocked(getAllJobRoles).mockResolvedValue(mockJobRoles);

		const response = await request(app).get("/job-roles");

		expect(response.status).toBe(200);
		expect(response.text).toContain(
			"<title>Kainos Careers - Job Roles</title>",
		);
	});
});

describe("GET /job-roles/:id", () => {
	it("should return the job role detail page with the correct title", async () => {
		vi.mocked(getJobRoleById).mockResolvedValue(mockJobRoles[0]);

		const response = await request(app).get("/job-roles/1");

		expect(response.status).toBe(200);
		expect(response.text).toContain(
			"<title>Kainos Careers - Software Engineer</title>",
		);
	});

	it("should return 400 and render error page for an invalid job role ID", async () => {
		vi.mocked(getJobRoleById).mockResolvedValue(undefined);

		const response = await request(app).get("/job-roles/invalid-id");

		expect(response.status).toBe(400);
		expect(response.text).toContain("<title>Kainos Careers - Error</title>");
		expect(response.text).toContain("Invalid job role ID");
	});
});
