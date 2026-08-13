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

	it("POST /api/chat returns 400 for empty message", async () => {
		const response = await request(app).post("/api/chat").send({ message: "" });

		expect(response.status).toBe(400);
		expect(Array.isArray(response.body)).toBe(true);
	});
});
