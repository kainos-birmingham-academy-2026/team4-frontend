export class JobRole {
	private _roleName: string;
	private _location: string;
	private _capability: string;
	private _band: string;
	private _closingDate: Date;

	constructor(
		roleName: string,
		location: string,
		capability: string,
		band: string,
		closingDate: Date,
	) {
		this._roleName = roleName;
		this._location = location;
		this._capability = capability;
		this._band = band;
		this._closingDate = closingDate;
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

	public get closingDate(): Date {
		return this._closingDate;
	}
}
