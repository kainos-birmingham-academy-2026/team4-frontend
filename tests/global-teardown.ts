import type { FullConfig } from "@playwright/test";

export default async function globalTeardown(
	_config: FullConfig,
): Promise<void> {
	// Reserved for cleanup of shared test data when API-backed tests are added.
}
