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
});
