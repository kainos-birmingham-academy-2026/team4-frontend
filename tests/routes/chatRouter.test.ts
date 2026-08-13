import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createChatRouter } from "../../src/routes/chatRouter";
import type { ChatProxyService } from "../../src/services/chatProxyService";

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
});
