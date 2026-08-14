import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import apiClient from "../../src/config/apiClient";
import {
	AuthServiceError,
	login,
	register,
} from "../../src/services/authApiService";

vi.mock("../../src/config/apiClient", () => ({
	default: {
		post: vi.fn(),
	},
}));

const mockLoginPayload = {
	email: "test@example.com",
	password: "Password123!",
};
const mockRegisterPayload = {
	email: "test@example.com",
	password: "Password123!",
	confirmPassword: "Password123!",
};
const mockToken = "mocked-jwt-token";

beforeEach(() => {
	vi.clearAllMocks();
});

describe("authApiService - login", () => {
	it("should return a token when the API call is successful", async () => {
		vi.mocked(apiClient).post = vi
			.fn()
			.mockResolvedValue({ data: { token: mockToken } });

		const result = await login(
			mockLoginPayload.email,
			mockLoginPayload.password,
		);

		expect(result).toEqual(mockToken);
		expect(apiClient.post).toHaveBeenCalledWith(
			"/auth/login",
			mockLoginPayload,
		);
	});

	it("should throw an error when the API returns a 400 status", async () => {
		vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
		vi.mocked(apiClient).post = vi.fn().mockRejectedValue({
			message: "Bad request",
			response: { status: 400 },
		});

		await expect(
			login(mockLoginPayload.email, mockLoginPayload.password),
		).rejects.toThrow("Invalid email or password");
	});

	it("should throw an error when the API returns a 404 status", async () => {
		vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
		vi.mocked(apiClient).post = vi.fn().mockRejectedValue({
			message: "Not found",
			response: { status: 404 },
		});

		await expect(
			login(mockLoginPayload.email, mockLoginPayload.password),
		).rejects.toThrow("Login endpoint not found");
	});

	it("should throw an error when the API returns a 500 status", async () => {
		vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
		vi.mocked(apiClient).post = vi.fn().mockRejectedValue({
			message: "Internal Server Error",
			response: { status: 500 },
		});

		await expect(
			login(mockLoginPayload.email, mockLoginPayload.password),
		).rejects.toThrow("Backend server error during login");
	});

	it("should throw unexpected error for non-400/404/500 axios statuses", async () => {
		vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
		vi.mocked(apiClient).post = vi.fn().mockRejectedValue({
			message: "Unauthorized",
			response: { status: 401 },
		});

		await expect(
			login(mockLoginPayload.email, mockLoginPayload.password),
		).rejects.toThrow("Invalid email or password");
	});

	it("should throw the original error if it's not an axios error", async () => {
		const originalError = new Error("Network error");
		vi.mocked(apiClient).post = vi.fn().mockRejectedValue(originalError);

		await expect(
			login(mockLoginPayload.email, mockLoginPayload.password),
		).rejects.toThrow("Network error");
	});

	it("should reject when login succeeds without returning a token", async () => {
		vi.mocked(apiClient).post = vi.fn().mockResolvedValue({ data: {} });

		await expect(
			login(mockLoginPayload.email, mockLoginPayload.password),
		).rejects.toThrow("Authentication succeeded but no JWT token was returned");
	});
});

describe("authApiService - register", () => {
	it("should return a token when the API call is successful", async () => {
		vi.mocked(apiClient).post = vi
			.fn()
			.mockResolvedValue({ data: { token: mockToken } });

		const result = await register(mockRegisterPayload);

		expect(result).toEqual(mockToken);
		expect(apiClient.post).toHaveBeenCalledWith(
			"/auth/register",
			mockRegisterPayload,
		);
	});

	it("should throw an AuthServiceError when the API returns a 400 status", async () => {
		vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
		vi.mocked(apiClient).post = vi.fn().mockRejectedValue({
			message: "Bad request",
			response: { status: 400 },
		});

		await expect(register(mockRegisterPayload)).rejects.toThrow(
			AuthServiceError,
		);
	});

	it("should throw an AuthServiceError when the API returns a 404 status", async () => {
		vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
		vi.mocked(apiClient).post = vi.fn().mockRejectedValue({
			message: "Not found",
			response: { status: 404 },
		});

		await expect(register(mockRegisterPayload)).rejects.toThrow(
			AuthServiceError,
		);
	});

	it("should throw an AuthServiceError when the API returns a 500 status", async () => {
		vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
		vi.mocked(apiClient).post = vi.fn().mockRejectedValue({
			message: "Internal Server Error",
			response: { status: 500 },
		});

		await expect(register(mockRegisterPayload)).rejects.toThrow(
			AuthServiceError,
		);
	});

	it("should throw unexpected error for non-400/404/500 axios statuses", async () => {
		const mockError = {
			message: "Unauthorized",
			response: { status: 401 },
		};

		vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
		vi.mocked(apiClient).post = vi.fn().mockRejectedValue(mockError);

		await expect(register(mockRegisterPayload)).rejects.toThrow(mockError);
	});
	it("should throw the original error if it's not an axios error", async () => {
		const originalError = new Error("Network error");
		vi.mocked(apiClient).post = vi.fn().mockRejectedValue(originalError);

		await expect(register(mockRegisterPayload)).rejects.toThrow(
			"Network error",
		);
	});

	it("should return an AuthServiceError when registration returns no token", async () => {
		vi.mocked(apiClient).post = vi
			.fn()
			.mockResolvedValue({ data: {}, status: 201 });

		await expect(register(mockRegisterPayload)).rejects.toMatchObject({
			name: "AuthServiceError",
			statusCode: 201,
		});
	});
});
