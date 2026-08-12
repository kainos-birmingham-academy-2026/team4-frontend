import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthService, AuthServiceError } from "../../src/services/authService";

describe("AuthService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("returns without error when backend responds with ok", async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			status: 201,
			json: vi.fn(),
		});
		vi.stubGlobal("fetch", fetchMock);

		const service = new AuthService("http://api.example");
		await service.register({
			email: "test@example.com",
			password: "ValidPass!1",
		});

		expect(fetchMock).toHaveBeenCalledWith(
			"http://api.example/auth/register",
			expect.objectContaining({ method: "POST" }),
		);
	});

	it("throws AuthServiceError with backend message when provided", async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: false,
			status: 400,
			json: vi.fn().mockResolvedValue({ message: "Email already in use" }),
		});
		vi.stubGlobal("fetch", fetchMock);

		const service = new AuthService("http://api.example");

		await expect(
			service.register({
				email: "test@example.com",
				password: "ValidPass!1",
			}),
		).rejects.toEqual(new AuthServiceError("Email already in use", 400));
	});

	it("throws AuthServiceError with backend error fallback", async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: false,
			status: 422,
			json: vi.fn().mockResolvedValue({ error: "Validation failed" }),
		});
		vi.stubGlobal("fetch", fetchMock);

		const service = new AuthService("http://api.example");

		await expect(
			service.register({
				email: "test@example.com",
				password: "ValidPass!1",
			}),
		).rejects.toEqual(new AuthServiceError("Validation failed", 422));
	});

	it("throws default message when response JSON parse fails", async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: false,
			status: 500,
			json: vi.fn().mockRejectedValue(new Error("not json")),
		});
		vi.stubGlobal("fetch", fetchMock);

		const service = new AuthService("http://api.example");

		await expect(
			service.register({
				email: "test@example.com",
				password: "ValidPass!1",
			}),
		).rejects.toEqual(
			new AuthServiceError("Registration failed. Please try again.", 500),
		);
	});
});
