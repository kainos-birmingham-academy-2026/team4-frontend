interface BackendErrorResponse {
	error?: string;
	message?: string;
}

export class ChatProxyServiceError extends Error {
	constructor(
		message: string,
		public readonly statusCode: number,
	) {
		super(message);
		this.name = "ChatProxyServiceError";
	}
}

export class ChatProxyService {
	constructor(
		private readonly baseUrl: string = process.env.API_BASE_URL ||
			"http://localhost:4000",
	) {}

	async ask(message: string): Promise<unknown> {
		const response = await fetch(`${this.baseUrl}/api/chat`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ message }),
		});

		if (response.ok) {
			return response.json();
		}

		let errorMessage = "Chat service is unavailable.";
		try {
			const body = (await response.json()) as BackendErrorResponse;
			errorMessage = body.message || body.error || errorMessage;
		} catch {
			// Preserve default error message if response is not JSON.
		}

		throw new ChatProxyServiceError(errorMessage, response.status);
	}
}
