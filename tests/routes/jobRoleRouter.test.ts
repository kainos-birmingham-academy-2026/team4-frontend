import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import app from "../../src/app";
import {
	getMyApplications,
	submitApplication,
} from "../../src/services/applicationApiService";
import {
	compareJobRoles,
	exportJobRoles,
	getCareerMatrix,
	getCreateJobRoleOptions,
	getJobRoleById,
	getPaginatedJobRoles,
} from "../../src/services/jobRoleApiService";
import { mockJobRoles } from "../mockJobRoles";

vi.mock("../../src/services/jobRoleApiService", () => ({
	compareJobRoles: vi.fn(),
	getCareerMatrix: vi.fn(),
	getCreateJobRoleOptions: vi.fn(),
	exportJobRoles: vi.fn(),
	getPaginatedJobRoles: vi.fn(),
	getJobRoleById: vi.fn(),
}));

vi.mock("../../src/services/applicationApiService", () => ({
	submitApplication: vi.fn(),
	getMyApplications: vi.fn().mockResolvedValue([]),
	ApplicationServiceError: class ApplicationServiceError extends Error {},
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
		expect(response.text).toContain("Band 1");
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
describe("GET /job-roles/export", () => {
	it("returns the generated CSV download", async () => {
		vi.mocked(exportJobRoles).mockResolvedValue({
			data: new TextEncoder().encode("jobRoleId,roleName\r\n1,Engineer\r\n")
				.buffer,
			contentType: "text/csv; charset=utf-8",
			contentDisposition: 'attachment; filename="job-roles.csv"',
		});

		const response = await request(app).get("/job-roles/export");

		expect(response.status).toBe(200);
		expect(response.headers["content-type"]).toContain("text/csv");
		expect(response.headers["content-disposition"]).toBe(
			'attachment; filename="job-roles.csv"',
		);
	});
});

describe("career path routes", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders capability-filtered role selectors on both sides", async () => {
		vi.mocked(getCareerMatrix).mockResolvedValue({
			capabilities: [
				{ id: 1, name: "Engineering" },
				{ id: 2, name: "Data" },
			],
			bands: [
				{ id: 1, name: "Band 1" },
				{ id: 2, name: "Band 2" },
			],
			matrix: {
				"1_2": [mockJobRoles[0]],
				"2_1": [mockJobRoles[1]],
			},
		});

		const response = await request(app).get("/career-matrix");

		expect(response.status).toBe(200);
		expect(response.text).toContain("Build your career comparison");
		expect(response.text).toContain("Software Engineer");
		expect(response.text).toContain("Data Analyst");
		expect(response.text).toContain('name="roleA"');
		expect(response.text).toContain('name="roleB"');
		expect(response.text).toContain('data-capability-id="1"');
		expect(response.text).toContain('data-capability-id="2"');
		expect(response.text).toContain("Comparison not ready");
		expect(response.text).toContain('role="status"');
		expect(response.text).toContain('aria-describedby="comparison-status"');
	});

	it("renders shared and target responsibilities for two roles", async () => {
		vi.mocked(compareJobRoles).mockResolvedValue({
			roleA: mockJobRoles[0],
			roleB: mockJobRoles[1],
			sharedResponsibilities: ["Collaborate with teams"],
			roleAResponsibilities: ["Participate in code reviews"],
			roleBResponsibilities: ["Create visualizations and reports"],
		});

		const response = await request(app).get(
			"/job-roles/compare?roleA=1&roleB=2",
		);

		expect(response.status).toBe(200);
		expect(response.text).toContain("Software Engineer to Data Analyst");
		expect(response.text).toContain("Skills that carry forward");
		expect(response.text).toContain("Create visualizations and reports");
	});

	it("rejects a comparison of the same role", async () => {
		const response = await request(app).get(
			"/job-roles/compare?roleA=1&roleB=1",
		);

		expect(response.status).toBe(400);
		expect(compareJobRoles).not.toHaveBeenCalled();
	});
});

describe("GET /applications", () => {
	it("renders the authenticated user's applications", async () => {
		vi.mocked(getMyApplications).mockResolvedValue([
			{
				applicationId: 10,
				jobRoleId: 1,
				roleName: "Software Engineer",
				status: "Hired",
				createdAt: "2026-09-03T00:00:00.000Z",
			},
		]);

		const response = await request(app).get("/applications");

		expect(response.status).toBe(200);
		expect(response.text).toContain(
			"<title>Kainos Careers - My Applications</title>",
		);
		expect(response.text).toContain('href="/job-roles/1"');
		expect(response.text).toContain("Software Engineer");
		expect(response.text).toContain("Hired");
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

describe("GET /job-roles/:id/apply", () => {
	it("should render the apply page when the job role is open with positions", async () => {
		vi.mocked(getJobRoleById).mockResolvedValue(mockJobRoles[0]);

		const response = await request(app).get("/job-roles/1/apply");

		expect(response.status).toBe(200);
		expect(response.text).toContain(
			`<title>Kainos Careers - Apply for ${mockJobRoles[0].roleName}</title>`,
		);
	});

	it("should redirect to the job detail page when the role is not open", async () => {
		vi.mocked(getJobRoleById).mockResolvedValue({
			...mockJobRoles[0],
			status: "Closed",
		});

		const response = await request(app).get("/job-roles/1/apply");

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/job-roles/1");
	});
});

describe("POST /job-roles/:id/apply", () => {
	it("should submit the application and redirect to the job detail page", async () => {
		vi.mocked(getJobRoleById).mockResolvedValue(mockJobRoles[0]);
		vi.mocked(submitApplication).mockResolvedValue({
			applicationId: 1,
			jobRoleId: 1,
			userId: 1,
			roleName: "Software Engineer",
			status: "In Progress",
			createdAt: "2026-01-01T00:00:00.000Z",
		});

		const response = await request(app)
			.post("/job-roles/1/apply")
			.send({ message: "I am interested in this role." });

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/job-roles/1");
	});
});
