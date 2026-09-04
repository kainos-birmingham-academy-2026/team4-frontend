export class JobRole {
	private _jobRoleId: number;
	private _roleName: string;
	private _location: string;
	private _capability: string;
	private _band: string;
	private _closingDate: Date | null;
	private _status: string;
	public readonly capabilityId?: number;
	public readonly bandId?: number;
	public readonly statusId?: number;

	constructor(
		jobRoleId: number,
		roleName: string,
		location: string,
		capability: string,
		band: string,
		closingDate: Date | null,
		status: string,
		capabilityId?: number,
		bandId?: number,
		statusId?: number,
	) {
		this._jobRoleId = jobRoleId;
		this._roleName = roleName;
		this._location = location;
		this._capability = capability;
		this._band = band;
		this._closingDate = closingDate;
		this._status = status;
		this.capabilityId = capabilityId;
		this.bandId = bandId;
		this.statusId = statusId;
	}

	public get id(): number {
		return this._jobRoleId;
	}

	public get roleName(): string {
		return this._roleName;
	}

	public get location(): string {
		return this._location;
	}

	public get capability(): string {
		return this._capability;
	}

	public get band(): string {
		return this._band;
	}

	public get closingDate(): Date | null {
		return this._closingDate;
	}

	public get status(): string {
		return this._status;
	}
}

export class JobRoleDetail extends JobRole {
	private _description: string;
	private _responsibilities: string[];
	private _sharepointUrl: string;
	private _numberOfOpenPositions: number;

	constructor(
		jobRoleId: number,
		roleName: string,
		location: string,
		capability: string,
		band: string,
		closingDate: Date,
		status: string,
		description: string,
		responsibilities: string[],
		sharepointUrl: string,
		numberOfOpenPositions: number,
		capabilityId?: number,
		bandId?: number,
		statusId?: number,
	) {
		super(
			jobRoleId,
			roleName,
			location,
			capability,
			band,
			closingDate,
			status,
			capabilityId,
			bandId,
			statusId,
		);
		this._description = description;
		this._responsibilities = responsibilities;
		this._sharepointUrl = sharepointUrl;
		this._numberOfOpenPositions = numberOfOpenPositions;
	}

	public get description(): string {
		return this._description;
	}

	public get responsibilities(): string[] {
		return this._responsibilities;
	}

	public get sharepointUrl(): string {
		return this._sharepointUrl;
	}

	public get numberOfOpenPositions(): number {
		return this._numberOfOpenPositions;
	}
}
