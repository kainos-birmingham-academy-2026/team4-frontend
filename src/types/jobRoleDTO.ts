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
