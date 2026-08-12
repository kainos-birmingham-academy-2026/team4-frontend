import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";
import app from "../../src/app";

describe("registration routes", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("GET /register renders registration page", async () => {
		const response = await request(app).get("/register");

		expect(response.status).toBe(200);
		expect(response.text).toContain("<title>Kainos Careers - Register</title>");
	});

	it("POST /register returns 400 for invalid payload", async () => {
		const response = await request(app).post("/register").type("form").send({
			email: "bad",
			password: "weak",
			confirmPassword: "different",
		});

		expect(response.status).toBe(400);
		expect(response.text).toContain("Kainos Careers - Register");
	});
});
