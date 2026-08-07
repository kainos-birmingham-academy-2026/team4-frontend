export class JobRole {
	constructor(
		public readonly jobRoleId: number,
		public readonly roleName: string,
		public readonly location: string,
		public readonly capabilityId: number,
		public readonly bandId: number,
		public readonly closingDate: Date,
		public readonly status: string,
	) {}
}
