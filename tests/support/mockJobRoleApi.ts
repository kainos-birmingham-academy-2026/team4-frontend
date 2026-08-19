import express from "express";
import { mockJobRoles, testUser } from "../fixtures/testData";

const PORT = 4001;

const app = express();
app.use(express.json());

app.post("/auth/login", (req, res) => {
	if (
		req.body.email !== testUser.email ||
		req.body.password !== testUser.password
	) {
		res.status(401).json({ error: "Invalid email or password" });
		return;
	}

	res.json({ token: testUser.token });
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

app.get("/api/job-roles/filter-options", (_req, res) => {
	res.json({
		capabilities: [...new Set(mockJobRoles.map((role) => role.capability))],
		bands: [...new Set(mockJobRoles.map((role) => role.band))],
		statuses: [...new Set(mockJobRoles.map((role) => role.status))],
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
	const pageSize = 2;
	const requestedPage = Number(req.query.page) || 1;
	const totalPages = Math.ceil(filteredRoles.length / pageSize);
	const page = Math.min(Math.max(requestedPage, 1), Math.max(totalPages, 1));
	const jobs = filteredRoles.slice((page - 1) * pageSize, page * pageSize);

	res.json({
		jobs,
		pagination: {
			currentPage: page,
			totalPages,
			totalCount: filteredRoles.length,
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

app.listen(PORT, "127.0.0.1", () => {
	console.log(`Mock job-role API listening on ${PORT}`);
});
