import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./basePage";

export class JobRoleDetailPage extends BasePage {
	readonly heading: Locator;
	readonly aboutHeading: Locator;
	readonly description: Locator;
	readonly metadata: Locator;
	readonly metadataLabels: Locator;
	readonly metadataValues: Locator;
	readonly responsibilities: Locator;
	readonly openPositions: Locator;

	constructor(page: Page) {
		super(page);
		this.heading = page.locator("main h1");
		this.aboutHeading = page
			.locator(".job-detail-main .detail-section")
			.first()
			.locator("h2");
		this.description = page
			.locator(".job-detail-main .detail-section p")
			.first();
		this.metadata = page.locator(".job-detail-meta");
		this.metadataLabels = this.metadata.locator(".meta-label");
		this.metadataValues = this.metadata.locator(".meta-value");
		this.responsibilities = page.locator(".responsibilities-list li");
		this.openPositions = page
			.locator(".job-detail-sidebar .sidebar-card")
			.first();
	}

	metadataLabel(label: string): Locator {
		return this.metadataLabels.filter({ hasText: label });
	}

	metadataValue(value: string): Locator {
		return this.metadataValues.filter({ hasText: value });
	}
}
