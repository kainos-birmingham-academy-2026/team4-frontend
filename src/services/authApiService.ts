import axios from "axios";
import apiClient from "../config/apiClient.js";
import type { RegistrationPayload } from "../types/registrationDTO.js";

type AuthResponse = {
	token?: string;
	jwtToken?: string;
	accessToken?: string;
};

export class AuthServiceError extends Error {
	constructor(
		message: string,
		public readonly statusCode: number,
	) {
		super(message);
		this.name = "AuthServiceError";
	}
}

function extractToken(data: AuthResponse): string | null {
	return data.token ?? data.jwtToken ?? data.accessToken ?? null;
}

export async function login(email: string, password: string): Promise<string> {
	const loginPath = process.env.AUTH_LOGIN_PATH ?? "/api/login";

	try {
		const response = await apiClient.post<AuthResponse>(loginPath, {
			email: email,
			password,
		});

		const token = extractToken(response.data);
		if (!token) {
			throw new Error("Authentication succeeded but no JWT token was returned");
		}

		return token;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			const status = error.response?.status;
			if (status === 400 || status === 401) {
				throw new Error("Invalid email or password");
			}
			if (status === 404) {
				throw new Error("Login endpoint not found");
			}
			if (status === 500) {
				throw new Error("Backend server error during login");
			}
		}

		throw error;
	}
}

export async function register(payload: RegistrationPayload): Promise<string> {
	const registerPath = process.env.AUTH_REGISTER_PATH ?? "/auth/register";

	try {
		const response = await apiClient.post<AuthResponse>(registerPath, payload);

		const token = extractToken(response.data);

		if (!token) {
			throw new AuthServiceError(
				"Registration succeeded but no JWT token was returned",
				response.status,
			);
		}
		return token;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			const status = error.response?.status;
			if (status === 400) {
				throw new AuthServiceError(
					error.response?.data?.error ??
						"Invalid registration data. Please check your input.",
					status,
				);
			}
			if (status === 404) {
				throw new AuthServiceError("Registration endpoint not found", status);
			}
			if (status === 500) {
				throw new AuthServiceError(
					"Backend server error during registration",
					status,
				);
			}
		}

		throw error;
	}
}
