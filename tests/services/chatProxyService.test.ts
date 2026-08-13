import { afterEach, describe, expect, it, vi } from "vitest";
import {
	ChatProxyService,
	ChatProxyServiceError,
} from "../../src/services/chatProxyService";

describe("ChatProxyService", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("returns parsed JSON when backend responds successfully", async () => {
		const payload = {
			message: "ok",
			recommendations: [],
		};
		const json = vi.fn().mockResolvedValue(payload);
		const fetchMock = vi.fn().mockResolvedValue({ ok: true, json });
		vi.stubGlobal("fetch", fetchMock);

		const service = new ChatProxyService("http://localhost:4000");
		const response = await service.ask("engineering");

		expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/api/chat", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ message: "engineering" }),
		});
		expect(response).toEqual(payload);
	});

	it("throws ChatProxyServiceError with backend message field", async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: false,
			status: 502,
			json: vi.fn().mockResolvedValue({ message: "backend down" }),
		});
		vi.stubGlobal("fetch", fetchMock);

		const service = new ChatProxyService("http://localhost:4000");
		await expect(service.ask("hello")).rejects.toEqual(
			expect.objectContaining({
				name: "ChatProxyServiceError",
				message: "backend down",
				statusCode: 502,
			}),
		);
	});

	it("throws ChatProxyServiceError with backend error field", async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: false,
			status: 500,
			json: vi.fn().mockResolvedValue({ error: "service unavailable" }),
		});
		vi.stubGlobal("fetch", fetchMock);

		const service = new ChatProxyService("http://localhost:4000");
		await expect(service.ask("hello")).rejects.toEqual(
			expect.objectContaining({
				name: "ChatProxyServiceError",
				message: "service unavailable",
				statusCode: 500,
			}),
		);
	});

	it("falls back to default message when backend error response is not JSON", async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: false,
			status: 503,
			json: vi.fn().mockRejectedValue(new Error("invalid json")),
		});
		vi.stubGlobal("fetch", fetchMock);

		const service = new ChatProxyService("http://localhost:4000");
		await expect(service.ask("hello")).rejects.toEqual(
			expect.objectContaining({
				name: "ChatProxyServiceError",
				message: "Chat service is unavailable.",
				statusCode: 503,
			}),
		);
	});

	it("creates a typed error instance", () => {
		const error = new ChatProxyServiceError("failed", 400);

		expect(error).toBeInstanceOf(Error);
		expect(error.name).toBe("ChatProxyServiceError");
		expect(error.message).toBe("failed");
		expect(error.statusCode).toBe(400);
	});
});
