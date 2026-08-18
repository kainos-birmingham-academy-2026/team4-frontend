import express from "express";

const PORT = 4001;
const token = "e2e-test-token";

const jobRole = {
	jobRoleId: 1,
	roleName: "Software Engineer",
	location: "London",
	capability: "Engineering",
	band: "Band 2",
	closingDate: "2026-12-31T00:00:00.000Z",
	status: "Open",
	description:
		"Build reliable software that helps Kainos customers solve meaningful problems.",
	responsibilities: [
		"Develop and maintain software applications",
		"Collaborate with cross-functional teams",
	],
	sharepointUrl: "https://example.com/software-engineer",
	numberOfOpenPositions: 3,
};

const app = express();
app.use(express.json());

app.post("/auth/login", (_req, res) => {
	res.json({ token });
});

app.get("/api/job-roles/filter-options", (_req, res) => {
	res.json({
		capabilities: [jobRole.capability],
		bands: [jobRole.band],
		statuses: [jobRole.status],
	});
});

app.get("/api/job-roles", (_req, res) => {
	res.json({
		jobs: [jobRole],
		pagination: {
			currentPage: 1,
			totalPages: 1,
			totalCount: 1,
			pageSize: 10,
			hasNext: false,
			hasPrev: false,
		},
	});
});

app.get("/api/job-roles/:id", (req, res) => {
	if (req.params.id !== String(jobRole.jobRoleId)) {
		res.status(404).json({ error: "Job role not found" });
		return;
	}

	res.json(jobRole);
});

app.listen(PORT, "127.0.0.1", () => {
	console.log(`Mock job-role API listening on ${PORT}`);
});
