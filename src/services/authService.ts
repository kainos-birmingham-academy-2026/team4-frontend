import type { RegistrationPayload } from "../types/registration";

interface BackendErrorResponse {
	error?: string;
	message?: string;
}

export class AuthServiceError extends Error {
	constructor(
		message: string,
		public readonly statusCode: number,
	) {
		super(message);
		this.name = "AuthServiceError";
	}
}

export class AuthService {
	constructor(
		private readonly baseUrl: string = process.env.BACKEND_API_BASE_URL ||
			"http://localhost:4000",
	) {}

	async register(payload: RegistrationPayload): Promise<void> {
		const response = await fetch(`${this.baseUrl}/auth/register`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		});

		if (response.ok) {
			return;
		}

		let message = "Registration failed. Please try again.";

		try {
			const body = (await response.json()) as BackendErrorResponse;
			message = body.message || body.error || message;
		} catch {
			// Leave default message when backend response is not JSON.
		}

		throw new AuthServiceError(message, response.status);
	}
}
