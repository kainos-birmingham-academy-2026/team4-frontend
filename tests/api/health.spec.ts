import { expect, test } from "@playwright/test";
import { BaseApiClient } from "./baseApiClient";

test("health endpoint reports the frontend is up", async ({ request }) => {
	const response = await new BaseApiClient(request).getHealth();

	expect(response.ok()).toBe(true);
	expect(await response.json()).toMatchObject({ status: "UP" });
});
