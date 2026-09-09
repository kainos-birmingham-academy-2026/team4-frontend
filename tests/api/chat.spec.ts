import { expect, test } from "@playwright/test";

const frontendBaseUrl = "http://127.0.0.1:3001";

test.describe("Chat API", () => {
	test("rejects an empty message with 400 at the frontend API boundary", async ({
		request,
	}) => {
		const response = await request.post(`${frontendBaseUrl}/api/chat`, {
			data: { message: "" },
		});

		expect(response.status()).toBe(400);
		expect(await response.json()).toEqual([
			{ field: "message", message: "Message is required" },
		]);
	});
});
