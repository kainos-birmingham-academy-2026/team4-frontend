import express from "express";
import {
	adminUser,
	jobRoleListContent,
	mockJobRoles,
	testUser,
} from "../fixtures/testData.ts";

const PORT = Number(process.env.PORT) || 4001;

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

app.listen(PORT, "127.0.0.1", () => {
	console.log(`Mock job-role API listening on ${PORT}`);
});
