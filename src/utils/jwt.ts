interface TokenPayload {
	userId?: number;
	email?: string;
	role?: string;
}

export function getRoleFromToken(
	token: string | undefined,
): string | undefined {
	if (!token) {
		return undefined;
	}

	const payload = token.split(".")[1];
	if (!payload) {
		return undefined;
	}

	try {
		const decoded = JSON.parse(
			Buffer.from(payload, "base64url").toString("utf8"),
		) as TokenPayload;
		return typeof decoded.role === "string" ? decoded.role : undefined;
	} catch {
		return undefined;
	}
}

export function isApplicantRole(role: string | undefined): boolean {
	return role !== "ADMIN";
}
