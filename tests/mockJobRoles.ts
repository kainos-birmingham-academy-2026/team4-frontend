import type { JobRoleDetail } from "../src/types/jobRoleDTO";

export const mockJobRole1: JobRoleDetail = {
	jobRoleId: 1,
	roleName: "Software Engineer",
	location: "London",
	capability: "Engineering",
	band: "Band 2",
	closingDate: new Date("2024-12-31"),
	status: "Open",
	description:
		"We are looking for a skilled Software Engineer to join our team. The ideal candidate will have experience in developing scalable applications and a strong understanding of software development principles.",
	responsibilities: [
		"Develop and maintain software applications",
		"Collaborate with cross-functional teams",
		"Participate in code reviews",
	],
	sharepointUrl: "https://example.com/job-role-1",
	numberOfOpenPositions: 3,
};

export const mockJobRole2: JobRoleDetail = {
	jobRoleId: 2,
	roleName: "Data Analyst",
	location: "Manchester",
	capability: "Data",
	band: "Band 1",
	closingDate: new Date("2024-11-30"),
	status: "Open",
	description:
		"We are seeking a Data Analyst to help us make data-driven decisions. The successful candidate will have experience in data analysis, visualization, and reporting.",
	responsibilities: [
		"Analyze and interpret complex data sets",
		"Create visualizations and reports",
		"Collaborate with stakeholders to identify data needs",
	],
	sharepointUrl: "https://example.com/job-role-2",
	numberOfOpenPositions: 2,
};

export const mockJobRoles = [mockJobRole1, mockJobRole2];
