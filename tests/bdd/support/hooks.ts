import { type ChildProcess, spawn } from "node:child_process";
import path from "node:path";
import {
	After,
	AfterAll,
	Before,
	BeforeAll,
	setDefaultTimeout,
} from "@cucumber/cucumber";
import { chromium } from "@playwright/test";
import type { CareersWorld } from "./world.ts";

const frontendPort = 3002;
const apiPort = 4002;
const frontendUrl = `http://127.0.0.1:${frontendPort}`;
const workspaceRoot = path.resolve(import.meta.dirname, "../../..");
let mockApi: ChildProcess | undefined;
let frontend: ChildProcess | undefined;

setDefaultTimeout(30_000);

function startServer(
	file: string,
	environment: NodeJS.ProcessEnv,
): ChildProcess {
	return spawn(process.execPath, ["--import", "tsx", file], {
		cwd: workspaceRoot,
		env: { ...process.env, ...environment },
		stdio: "inherit",
	});
}

async function waitFor(url: string): Promise<void> {
	const deadline = Date.now() + 20_000;

	while (Date.now() < deadline) {
		try {
			const response = await fetch(url);
			if (response.ok) return;
		} catch {
			// The server has not bound its port yet.
		}
		await new Promise((resolve) => setTimeout(resolve, 100));
	}

	throw new Error(`Timed out waiting for ${url}`);
}

BeforeAll(async () => {
	mockApi = startServer("tests/support/mockJobRoleApi.ts", {
		PORT: String(apiPort),
	});
	frontend = startServer("src/server.ts", {
		PORT: String(frontendPort),
		NODE_ENV: "test",
		API_BASE_URL: `http://127.0.0.1:${apiPort}`,
	});
	await waitFor(`${frontendUrl}/health`);
});

Before(async function (this: CareersWorld) {
	this.browser = await chromium.launch();
	this.context = await this.browser.newContext({ baseURL: frontendUrl });
	this.page = await this.context.newPage();
});

After(async function (this: CareersWorld) {
	await this.context?.close();
	await this.browser?.close();
});

AfterAll(() => {
	frontend?.kill();
	mockApi?.kill();
});
