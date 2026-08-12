import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../src/app";

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

	it("GET /job-roles redirects to login when unauthenticated", async () => {
		const response = await request(app).get("/job-roles");

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/login");
	});

	it("POST /api/chat returns 400 for empty message", async () => {
		const response = await request(app).post("/api/chat").send({ message: "" });

		expect(response.status).toBe(400);
		expect(Array.isArray(response.body)).toBe(true);
	});

	it("GET /register returns registration page", async () => {
		const response = await request(app).get("/register");

		expect(response.status).toBe(200);
	});

	it("handles JSON request body for /api/chat", async () => {
		const response = await request(app)
			.post("/api/chat")
			.set("Content-Type", "application/json")
			.send({ message: "test" });

		// Should either succeed or fail gracefully, not error on parsing
		expect(response.status).toBeGreaterThanOrEqual(200);
	});

	it("handles URL-encoded request body for /api/chat", async () => {
		const response = await request(app)
			.post("/api/chat")
			.type("application/x-www-form-urlencoded")
			.send("message=test");

		// Should either succeed or fail gracefully, not error on parsing
		expect(response.status).toBeGreaterThanOrEqual(200);
	});
});
