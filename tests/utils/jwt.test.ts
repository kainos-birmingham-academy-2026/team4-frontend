import { describe, expect, it } from "vitest";
import { getRoleFromToken, isApplicantRole } from "../../src/utils/jwt";

function encodeToken(payload: object): string {
	const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
	return `header.${encoded}.signature`;
}

describe("jwt utils", () => {
	it("reads the role from a JWT payload", () => {
		expect(getRoleFromToken(encodeToken({ role: "USER" }))).toBe("USER");
		expect(getRoleFromToken(encodeToken({ role: "ADMIN" }))).toBe("ADMIN");
	});

	it("returns undefined for missing or invalid tokens", () => {
		expect(getRoleFromToken(undefined)).toBeUndefined();
		expect(getRoleFromToken("not-a-token")).toBeUndefined();
		expect(getRoleFromToken("a.%%%")).toBeUndefined();
	});

	it("treats non-admin users as applicants", () => {
		expect(isApplicantRole("USER")).toBe(true);
		expect(isApplicantRole(undefined)).toBe(true);
		expect(isApplicantRole("ADMIN")).toBe(false);
	});
});
