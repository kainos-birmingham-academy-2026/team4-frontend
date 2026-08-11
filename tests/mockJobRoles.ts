import { JobRoleDetail } from "../src/models/jobRole";

export const mockJobRole1 = new JobRoleDetail(
	1,
	"Software Engineer",
	"London",
	"Engineering",
	"Band 2",
	new Date("2024-12-31"),
	"Open",
	"We are looking for a skilled Software Engineer to join our team. The ideal candidate will have experience in developing scalable applications and a strong understanding of software development principles.",
	[
		"Develop and maintain software applications",
		"Collaborate with cross-functional teams",
		"Participate in code reviews",
	],
	"https://example.com/job-role-1",
	3,
);

export const mockJobRole2 = new JobRoleDetail(
	2,
	"Data Analyst",
	"Manchester",
	"Data",
	"Band 1",
	new Date("2024-11-30"),
	"Open",
	"We are seeking a Data Analyst to help us make data-driven decisions. The successful candidate will have experience in data analysis, visualization, and reporting.",
	[
		"Analyze and interpret complex data sets",
		"Create visualizations and reports",
		"Collaborate with stakeholders to identify data needs",
	],
	"https://example.com/job-role-2",
	2,
);

export const mockJobRoles = [mockJobRole1, mockJobRole2];
