import request from "supertest";
import { describe, expect, it } from "vitest";
import app, { hasAdminRole } from "../src/app";

function tokenWithPayload(payload: string): string {
	return `header.${Buffer.from(payload).toString("base64url")}.signature`;
}

describe("app routes", () => {
	it("GET / returns the index page", async () => {
		const response = await request(app).get("/");

		expect(response.status).toBe(200);
		expect(response.text).toContain("<title>Kainos Careers - Home</title>");
	});

	it("GET /health returns service status", async () => {
		const response = await request(app).get("/health");

		expect(response.status).toBe(200);
		expect(response.body.status).toBe("UP");
		expect(typeof response.body.time).toBe("string");
		expect(Number.isNaN(Date.parse(response.body.time))).toBe(false);
	});

	it("POST /api/chat returns 400 for empty message", async () => {
		const response = await request(app).post("/api/chat").send({ message: "" });

		expect(response.status).toBe(400);
		expect(Array.isArray(response.body)).toBe(true);
	});
});

describe("hasAdminRole", () => {
	it("recognizes admin tokens", () => {
		expect(hasAdminRole(tokenWithPayload('{"role":"ADMIN"}'))).toBe(true);
	});

	it("rejects missing, incomplete, non-admin, and malformed tokens", () => {
		expect(hasAdminRole(undefined)).toBe(false);
		expect(hasAdminRole("token-without-payload")).toBe(false);
		expect(hasAdminRole(tokenWithPayload('{"role":"USER"}'))).toBe(false);
		expect(hasAdminRole(tokenWithPayload("not-json"))).toBe(false);
	});
});
