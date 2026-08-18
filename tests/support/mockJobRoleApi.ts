import express from "express";
import { mockJobRole, testUser } from "../fixtures/testData";

const PORT = 4001;

const app = express();
app.use(express.json());

app.post("/auth/login", (_req, res) => {
	res.json({ token: testUser.token });
});

app.get("/api/job-roles/filter-options", (_req, res) => {
	res.json({
		capabilities: [mockJobRole.capability],
		bands: [mockJobRole.band],
		statuses: [mockJobRole.status],
	});
});

app.get("/api/job-roles", (_req, res) => {
	res.json({
		jobs: [mockJobRole],
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
	if (req.params.id !== String(mockJobRole.jobRoleId)) {
		res.status(404).json({ error: "Job role not found" });
		return;
	}

	res.json(mockJobRole);
});

app.listen(PORT, "127.0.0.1", () => {
	console.log(`Mock job-role API listening on ${PORT}`);
});
