import express from "express";
import {
	adminUser,
	mockJobRoles as fixtureJobRoles,
	jobRoleListContent,
	testUser,
} from "../fixtures/testData.ts";

const PORT = Number(process.env.PORT) || 4001;
let lastUpdate: { id: number; body: Record<string, unknown> } | null = null;
type MockJobRole = (typeof fixtureJobRoles)[number] & {
	numberOfOpenPositions: number;
	responsibilities: string[];
};

const cloneJobRole = (role: (typeof fixtureJobRoles)[number]): MockJobRole => ({
	...role,
	responsibilities: [...role.responsibilities],
});

const initialMockJobRoles: MockJobRole[] = fixtureJobRoles.map(cloneJobRole);
const mockJobRoles: MockJobRole[] = fixtureJobRoles.map(cloneJobRole);
type MockApplication = {
	applicationId: number;
	userId: number;
	applicantEmail: string;
	jobRoleId: number;
	roleName: string;
	message: string;
	status: "In Progress" | "Hired" | "Rejected";
	createdAt: string;
};

const initialMockApplications: MockApplication[] = [
	{
		applicationId: 101,
		userId: 10,
		applicantEmail: "applicant@example.com",
		jobRoleId: 1,
		roleName: "Software Engineer",
		message: "I am excited to contribute to the engineering team.",
		status: "In Progress",
		createdAt: "2026-09-03T12:00:00.000Z",
	},
	{
		applicationId: 102,
		userId: 11,
		applicantEmail: "another-applicant@example.com",
		jobRoleId: 2,
		roleName: "Data Analyst",
		message: "I enjoy turning data into useful insight.",
		status: "In Progress",
		createdAt: "2026-09-04T12:00:00.000Z",
	},
];
const mockApplications = [...initialMockApplications];

const app = express();
app.use(express.json());

app.post("/auth/login", (req, res) => {
	const user = [testUser, adminUser].find(
		(candidate) =>
			candidate.email === req.body.email &&
			candidate.password === req.body.password,
	);

	if (!user) {
		res.status(401).json({ error: "Invalid email or password" });
		return;
	}

	res.json({ token: user.token });
});

app.post("/auth/register", (req, res) => {
	if (req.body.email === "existing@example.com") {
		res
			.status(400)
			.json({ error: "An account already exists for this email." });
		return;
	}

	res.json({ token: testUser.token });
});

app.get("/api/applications", (_req, res) => {
	res.json({
		applications: mockApplications
			.filter((application) => application.userId === 10)
			.map(
				({
					applicationId,
					userId,
					jobRoleId,
					roleName,
					status,
					createdAt,
				}) => ({
					applicationId,
					userId,
					jobRoleId,
					roleName,
					status,
					createdAt,
				}),
			),
	});
});

app.get("/api/applications/job-role/:jobRoleId", (req, res) => {
	res.json({
		applications: mockApplications.filter(
			(application) => application.jobRoleId === Number(req.params.jobRoleId),
		),
	});
});

app.post("/api/applications/:applicationId/:action", (req, res) => {
	const application = mockApplications.find(
		(candidate) => candidate.applicationId === Number(req.params.applicationId),
	);
	if (!application) {
		res.status(404).json({ error: "Application not found" });
		return;
	}
	if (application.status !== "In Progress") {
		res
			.status(409)
			.json({ error: "Only applications in progress can be assessed" });
		return;
	}

	if (req.params.action === "hire") {
		const role = mockJobRoles.find(
			(candidate) => candidate.jobRoleId === application.jobRoleId,
		);
		if (!role || role.numberOfOpenPositions <= 0) {
			res
				.status(409)
				.json({ error: "There are no open positions remaining for this role" });
			return;
		}
		role.numberOfOpenPositions -= 1;
		application.status = "Hired";
	} else if (req.params.action === "reject") {
		application.status = "Rejected";
	} else {
		res.status(400).json({ error: "Invalid assessment action" });
		return;
	}

	res.json(application);
});

app.get("/api/job-roles/filter-options", (_req, res) => {
	res.json({
		capabilities: [...new Set(mockJobRoles.map((role) => role.capability))],
		bands: [...new Set(mockJobRoles.map((role) => role.band))],
		statuses: [...new Set(mockJobRoles.map((role) => role.status))],
	});
});

app.get("/api/job-roles/create-options", (_req, res) => {
	res.json({
		capabilities: [
			{ id: 1, name: "Engineering" },
			{ id: 2, name: "Data" },
		],
		bands: [
			{ id: 1, name: "Band 2" },
			{ id: 2, name: "Band 3" },
		],
		statuses: [
			{ id: 1, name: "Open" },
			{ id: 2, name: "Closed" },
		],
	});
});

app.post("/api/job-roles", (req, res) => {
	res.status(201).json({
		jobRoleId: mockJobRoles.length + 1,
		...req.body,
		capability: "Engineering",
		band: "Band 2",
		status: "Open",
	});
});

app.get("/api/job-roles", (req, res) => {
	const selected = (name: string): string[] => {
		const value = req.query[name];
		return Array.isArray(value)
			? value.filter((item): item is string => typeof item === "string")
			: typeof value === "string"
				? [value]
				: [];
	};
	const roleName = String(req.query.roleName ?? "").toLowerCase();
	const location = String(req.query.location ?? "").toLowerCase();
	const capability = selected("capability");
	const band = selected("band");
	const status = selected("status");
	const closingDate = String(req.query.closingDate ?? "");
	const filteredRoles = mockJobRoles.filter(
		(role) =>
			role.roleName.toLowerCase().includes(roleName) &&
			role.location.toLowerCase().includes(location) &&
			(!capability.length || capability.includes(role.capability)) &&
			(!band.length || band.includes(role.band)) &&
			(!status.length || status.includes(role.status)) &&
			(!closingDate || role.closingDate.slice(0, 10) <= closingDate),
	);
	const sortBy = String(req.query.sortBy ?? "");
	const sortOrder = String(req.query.sortOrder ?? "");
	const sortableColumns = [
		"roleName",
		"location",
		"capability",
		"band",
		"closingDate",
		"status",
	] as const;
	const orderedRoles = [...filteredRoles];
	if (
		sortableColumns.includes(sortBy as (typeof sortableColumns)[number]) &&
		(sortOrder === "asc" || sortOrder === "desc")
	) {
		orderedRoles.sort((left, right) => {
			const column = sortBy as (typeof sortableColumns)[number];
			const comparison = String(left[column]).localeCompare(
				String(right[column]),
			);
			return sortOrder === "asc" ? comparison : -comparison;
		});
	}
	const pageSize = jobRoleListContent.pageSize;
	const requestedPage = Number(req.query.page) || 1;
	const totalPages = Math.ceil(orderedRoles.length / pageSize);
	const page = Math.min(Math.max(requestedPage, 1), Math.max(totalPages, 1));
	const jobs = orderedRoles.slice((page - 1) * pageSize, page * pageSize);

	res.json({
		jobs,
		pagination: {
			currentPage: page,
			totalPages,
			totalCount: orderedRoles.length,
			pageSize,
			hasNext: page < totalPages,
			hasPrev: page > 1,
		},
	});
});

app.get("/api/job-roles/:id", (req, res) => {
	const role = mockJobRoles.find(
		(candidate) => candidate.jobRoleId === Number(req.params.id),
	);
	if (!role) {
		res.status(404).json({ error: "Job role not found" });
		return;
	}

	res.json(role);
});

app.put("/api/job-roles/:id", (req, res) => {
	const role = mockJobRoles.find(
		(candidate) => candidate.jobRoleId === Number(req.params.id),
	);
	if (!role) {
		res.status(404).json({ error: "Job role not found" });
		return;
	}
	lastUpdate = { id: Number(req.params.id), body: req.body };

	res.json({
		...role,
		...req.body,
		capability: req.body.capabilityId === 2 ? "Data" : role.capability,
		band: req.body.bandId === 2 ? "Band 3" : role.band,
		status: req.body.statusId === 2 ? "Closed" : role.status,
	});
});
app.delete("/api/job-roles/:id", (req, res) => {
	const roleIndex = mockJobRoles.findIndex(
		(candidate) => candidate.jobRoleId === Number(req.params.id),
	);
	if (roleIndex === -1) {
		res.status(404).json({ error: "Job role not found" });
		return;
	}

	mockJobRoles.splice(roleIndex, 1);
	res.status(204).send();
});

app.post("/__test__/reset", (_req, res) => {
	mockJobRoles.splice(
		0,
		mockJobRoles.length,
		...initialMockJobRoles.map((role) => ({
			...role,
			responsibilities: [...role.responsibilities],
		})),
	);
	mockApplications.splice(
		0,
		mockApplications.length,
		...initialMockApplications.map((application) => ({ ...application })),
	);
	res.sendStatus(204);
});

app.get("/__test__/last-update", (_req, res) => {
	res.json(lastUpdate);
});

app.listen(PORT, "127.0.0.1", () => {
	console.log(`Mock job-role API listening on ${PORT}`);
});
