import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createChatRouter } from "../../src/routes/chatRouter";
import {
	type ChatProxyService,
	ChatProxyServiceError,
} from "../../src/services/chatProxyService";

describe("POST /api/chat", () => {
	const mockChatProxyService = {
		ask: vi.fn(),
	} as unknown as ChatProxyService;

	const testApp = express();
	testApp.use(express.json());
	testApp.use(express.urlencoded({ extended: true }));
	testApp.use("/api/chat", createChatRouter(mockChatProxyService));

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns chat response when message is valid", async () => {
		vi.mocked(mockChatProxyService.ask).mockResolvedValue({
			message: "Here are recommended roles.",
			recommendations: [],
			intent: "search",
			confidence: "high",
		});

		const response = await request(testApp)
			.post("/api/chat")
			.send({ message: "engineering roles" });

		expect(response.status).toBe(200);
		expect(response.body.message).toBe("Here are recommended roles.");
		expect(mockChatProxyService.ask).toHaveBeenCalledWith("engineering roles");
	});

	it("returns 400 when message is empty", async () => {
		const response = await request(testApp)
			.post("/api/chat")
			.send({ message: "   " });

		expect(response.status).toBe(400);
		expect(response.body).toEqual([
			{ field: "message", message: "Message is required" },
		]);
		expect(mockChatProxyService.ask).not.toHaveBeenCalled();
	});

	it("returns 400 when message is missing", async () => {
		const response = await request(testApp).post("/api/chat").send({});

		expect(response.status).toBe(400);
		expect(response.body).toEqual([
			{ field: "message", message: "Message is required" },
		]);
	});

	it("returns appropriate status code when ChatProxyServiceError is thrown", async () => {
		vi.mocked(mockChatProxyService.ask).mockRejectedValueOnce(
			new ChatProxyServiceError("Backend error", 502),
		);

		const response = await request(testApp)
			.post("/api/chat")
			.send({ message: "test" });

		expect(response.status).toBe(502);
		expect(response.body.error).toBe("Backend error");
	});

	it("returns 500 when unexpected error is thrown", async () => {
		vi.mocked(mockChatProxyService.ask).mockRejectedValueOnce(
			new Error("Unexpected error"),
		);

		const response = await request(testApp)
			.post("/api/chat")
			.send({ message: "test" });

		expect(response.status).toBe(500);
		expect(response.body.error).toBe("Internal server error");
	});

	it("trims whitespace from message", async () => {
		vi.mocked(mockChatProxyService.ask).mockResolvedValueOnce({
			message: "Response",
			recommendations: [],
		});

		const response = await request(testApp)
			.post("/api/chat")
			.send({ message: "  test message  " });

		expect(response.status).toBe(200);
		expect(mockChatProxyService.ask).toHaveBeenCalledWith("test message");
	});

	it("accepts url-encoded form data", async () => {
		vi.mocked(mockChatProxyService.ask).mockResolvedValueOnce({
			message: "Response",
			recommendations: [],
		});

		const response = await request(testApp)
			.post("/api/chat")
			.type("application/x-www-form-urlencoded")
			.send("message=engineering");

		expect(response.status).toBe(200);
		expect(mockChatProxyService.ask).toHaveBeenCalledWith("engineering");
	});
});
