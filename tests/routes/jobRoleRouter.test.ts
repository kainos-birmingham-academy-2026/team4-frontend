import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import app from "../../src/app";
import {
	getPaginatedJobRoles,
	getJobRoleById,
} from "../../src/services/jobRoleApiService";
import { mockJobRoles } from "../mockJobRoles";

vi.mock("../../src/services/jobRoleApiService", () => ({
	getPaginatedJobRoles: vi.fn(),
	getJobRoleById: vi.fn(),
}));

vi.mock("../../src/middlewares/authMiddleware", () => ({
	requireAuth: vi.fn((req, res, next) => next()),
}));
describe("GET /", () => {
	it("should return the home page with the correct title", async () => {
		const response = await request(app).get("/");

		expect(response.status).toBe(200);
		expect(response.text).toContain("<title>Kainos Careers</title>");
		expect(response.text).toContain("career-chat-launcher");
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
		expect(response.text).toContain("<title>Kainos Careers - Login</title>");
	});
});

describe("GET /job-roles", () => {
	it("should return the job roles page with the correct title", async () => {
		vi.mocked(getPaginatedJobRoles).mockResolvedValue({
			jobs: mockJobRoles,
			pagination: {
				currentPage: 1,
				totalPages: 1,
				totalCount: 2,
				pageSize: 10,
				hasNext: false,
				hasPrev: false,
			},
		});

		const response = await request(app).get("/job-roles");

		expect(response.status).toBe(200);
		expect(response.text).toContain(
			"<title>Kainos Careers - Job Roles</title>",
		);
	});

	it("should filter roles by capability query", async () => {
		vi.mocked(getPaginatedJobRoles).mockResolvedValue({
			jobs: mockJobRoles,
			pagination: {
				currentPage: 1,
				totalPages: 1,
				totalCount: 2,
				pageSize: 10,
				hasNext: false,
				hasPrev: false,
			},
		});

		const response = await request(app).get("/job-roles?capability=Data");

		expect(response.status).toBe(200);
		expect(response.text).toContain(
			'<h3 class="job-card-title">Data Analyst</h3>',
		);
		expect(response.text).not.toContain(
			'<h3 class="job-card-title">Software Engineer</h3>',
		);
	});

	it("should filter roles by search query", async () => {
		vi.mocked(getPaginatedJobRoles).mockResolvedValue({
			jobs: mockJobRoles,
			pagination: {
				currentPage: 1,
				totalPages: 1,
				totalCount: 2,
				pageSize: 10,
				hasNext: false,
				hasPrev: false,
			},
		});

		const response = await request(app).get("/job-roles?q=Software");

		expect(response.status).toBe(200);
		expect(response.text).toContain(
			'<h3 class="job-card-title">Software Engineer</h3>',
		);
		expect(response.text).not.toContain(
			'<h3 class="job-card-title">Data Analyst</h3>',
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
