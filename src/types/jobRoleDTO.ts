import type { JobRole } from "../models/jobRole";

export interface PaginationMetadata {
	currentPage: number;
	totalPages: number;
	totalCount: number;
	pageSize: number;
	hasNext: boolean;
	hasPrev: boolean;
}

export interface PaginatedResponse {
	jobs: JobRole[];
	pagination: PaginationMetadata;
}

export interface JobRoleFilters {
	roleName: string;
	location: string;
	capability: string[];
	band: string[];
	status: string[];
	closingDate: string;
}

export interface FilterOptions {
	capabilities: string[];
	bands: string[];
	statuses: string[];
}

export type JobRoleSortBy =
	| "jobRoleId"
	| "roleName"
	| "location"
	| "capability"
	| "band"
	| "closingDate"
	| "status";

export type JobRoleSortOrder = "asc" | "desc";

export interface JobRoleOrdering {
	sortBy?: JobRoleSortBy;
	sortOrder?: JobRoleSortOrder;
}

export interface JobRoleOption {
	id: number;
	name: string;
}

export interface CreateJobRoleOptions {
	capabilities: JobRoleOption[];
	bands: JobRoleOption[];
	statuses?: JobRoleOption[];
}

export interface CreateJobRoleInput {
	roleName: string;
	description: string;
	sharepointUrl: string;
	responsibilities: string[];
	numberOfOpenPositions: number;
	location: string;
	closingDate: string;
	capabilityId: number;
	bandId: number;
}

export interface UpdateJobRoleInput extends CreateJobRoleInput {
	statusId: number;
}
