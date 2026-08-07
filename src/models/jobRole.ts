export class JobRole {
	constructor(
		public readonly roleName: string,
		public readonly location: string,
		public readonly capability: string,
		public readonly band: string,
		public readonly closingDate: Date,
	) {}
}
