import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import app from "../../src/app";
import {
	getCreateJobRoleOptions,
	getJobRoleById,
	getPaginatedJobRoles,
} from "../../src/services/jobRoleApiService";
import { mockJobRoles } from "../mockJobRoles";

vi.mock("../../src/services/jobRoleApiService", () => ({
	getCreateJobRoleOptions: vi.fn(),
	getPaginatedJobRoles: vi.fn(),
	getJobRoleById: vi.fn(),
}));

vi.mock("../../src/middlewares/authMiddleware", () => ({
	requireAuth: vi.fn((_req, _res, next) => next()),
}));
describe("GET /", () => {
	it("should return the home page with the correct title", async () => {
		const response = await request(app).get("/");

		expect(response.status).toBe(200);
		expect(response.text).toContain("<title>Kainos Careers - Home</title>");
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

	it("should forward the filter query params to the API and render the result", async () => {
		vi.mocked(getPaginatedJobRoles).mockResolvedValue({
			jobs: [mockJobRoles[1]],
			pagination: {
				currentPage: 1,
				totalPages: 1,
				totalCount: 1,
				pageSize: 10,
				hasNext: false,
				hasPrev: false,
			},
		});

		const response = await request(app).get(
			"/job-roles?capability=Data&roleName=Analyst",
		);

		expect(response.status).toBe(200);
		expect(getPaginatedJobRoles).toHaveBeenCalledWith(
			1,
			expect.any(String),
			expect.objectContaining({
				roleName: "Analyst",
				capability: ["Data"],
			}),
			{ sortBy: undefined, sortOrder: undefined },
		);
		expect(response.text).toContain(
			'<h3 class="job-card-title">Data Analyst</h3>',
		);
		expect(response.text).not.toContain(
			'<h3 class="job-card-title">Software Engineer</h3>',
		);
		expect(response.text).toContain("📊 Band 1");
	});

	it("should forward ordering query params to the API", async () => {
		vi.mocked(getPaginatedJobRoles).mockResolvedValue({
			jobs: mockJobRoles,
			pagination: {
				currentPage: 1,
				totalPages: 1,
				totalCount: mockJobRoles.length,
				pageSize: 10,
				hasNext: false,
				hasPrev: false,
			},
		});

		const response = await request(app).get(
			"/job-roles?sortBy=roleName&sortOrder=desc",
		);

		expect(response.status).toBe(200);
		expect(getPaginatedJobRoles).toHaveBeenCalledWith(
			1,
			expect.any(String),
			expect.any(Object),
			{ sortBy: "roleName", sortOrder: "desc" },
		);
	});

	it("should show a success message after creating a job role", async () => {
		vi.mocked(getPaginatedJobRoles).mockResolvedValue({
			jobs: mockJobRoles,
			pagination: {
				currentPage: 1,
				totalPages: 1,
				totalCount: mockJobRoles.length,
				pageSize: 10,
				hasNext: false,
				hasPrev: false,
			},
		});

		const response = await request(app).get("/job-roles?created=1");

		expect(response.status).toBe(200);
		expect(response.text).toContain("Job role successfully created.");
		expect(response.text).toContain('role="status"');
	});
});

describe("GET /job-roles/new", () => {
	it("renders the add-role form instead of treating new as an ID", async () => {
		vi.mocked(getCreateJobRoleOptions).mockResolvedValue({
			capabilities: [{ id: 1, name: "Engineering" }],
			bands: [{ id: 2, name: "Trainee" }],
		});

		const response = await request(app).get("/job-roles/new");

		expect(response.status).toBe(200);
		expect(response.text).toContain(
			"<title>Kainos Careers - Add Job Role</title>",
		);
		expect(response.text).toContain('name="capabilityId"');
		expect(response.text).toContain('name="bandId"');
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
