(() => {
	type Sender = "user" | "bot";

	interface RoleRecommendation {
		title: string;
		location: string;
		capability: string;
		url: string;
		why: string;
	}

	interface ChatResponse {
		message: string;
		recommendations: RoleRecommendation[];
	}

	interface DiscoveredRole {
		title: string;
		url: string;
		location: string;
		capability: string;
	}

	const widget = document.querySelector<HTMLElement>("[data-chat-widget]");
	if (!widget) {
		return;
	}

	const panel = widget.querySelector<HTMLElement>(".career-chat-panel");
	const toggleButton =
		widget.querySelector<HTMLButtonElement>("[data-chat-toggle]");
	const closeButton =
		widget.querySelector<HTMLButtonElement>("[data-chat-close]");
	const form = widget.querySelector<HTMLFormElement>("[data-chat-form]");
	const input = widget.querySelector<HTMLInputElement>("#career-chat-input");
	const messages = widget.querySelector<HTMLElement>("[data-chat-messages]");
	const promptButtons =
		widget.querySelectorAll<HTMLButtonElement>("[data-chat-prompt]");
	const chatApi = widget.getAttribute("data-chat-api") || "/api/chat";

	if (!panel || !toggleButton || !closeButton || !form || !input || !messages) {
		return;
	}

	const synonymGroups: Record<string, string[]> = {
		Engineering: [
			"engineering",
			"engineer",
			"developer",
			"coding",
			"code",
			"software",
			"technical",
			"app",
			"apps",
			"website",
			"websites",
			"web",
			"frontend",
			"backend",
			"fullstack",
			"full-stack",
		],
		Platform: [
			"platform",
			"platforms",
			"cloud",
			"aws",
			"azure",
			"infrastructure",
		],
		"People Operations": ["people", "hr", "talent", "culture", "recruitment"],
		"Data & AI": [
			"data",
			"analysis",
			"analyst",
			"insight",
			"reporting",
			"numbers",
			"ai",
			"machine learning",
		],
		"Product Consultant": [
			"product",
			"product manager",
			"product owner",
			"roadmap",
			"consultant",
			"consulting",
		],
		Quality: ["quality", "qa", "test", "testing", "tester", "automation"],
		Cybersecurity: [
			"cyber",
			"security",
			"cybersecurity",
			"infosec",
			"secure",
			"risk",
		],
	};

	const normalizeRoleFamilyForFilter = (roleFamily: string): string => {
		switch (roleFamily) {
			case "Platform":
				return "Platforms";
			case "People Operations":
				return "People";
			case "Cybersecurity":
				return "Cyber Security";
			case "Product Consultant":
				return "Product";
			case "Quality":
				return "Engineering";
			default:
				return roleFamily;
		}
	};

	const matchesRoleFamily = (
		role: DiscoveredRole,
		roleFamily: string,
	): boolean => {
		const capabilityLower = role.capability.toLowerCase();
		const titleLower = role.title.toLowerCase();

		switch (roleFamily) {
			case "Engineering":
				return capabilityLower.includes("engineering");
			case "Platform":
				return capabilityLower.includes("platform");
			case "People Operations":
				return capabilityLower.includes("people");
			case "Data & AI":
				return capabilityLower.includes("data");
			case "Product Consultant":
				return (
					capabilityLower.includes("product") || titleLower.includes("consult")
				);
			case "Quality":
				return (
					titleLower.includes("qa") ||
					titleLower.includes("test") ||
					titleLower.includes("quality")
				);
			case "Cybersecurity":
				return capabilityLower.includes("cyber");
			default:
				return capabilityLower.includes(roleFamily.toLowerCase());
		}
	};

	const extractRoles = (scope: ParentNode): DiscoveredRole[] => {
		const roleElements = Array.from(
			scope.querySelectorAll<HTMLElement>(".job-card"),
		);
		return roleElements
			.map((card) => {
				const titleLink = card.querySelector<HTMLAnchorElement>(
					".job-card-title-link",
				);
				const title =
					card
						.querySelector<HTMLElement>(".job-card-title")
						?.textContent?.trim() || "";
				const badges = Array.from(
					card.querySelectorAll<HTMLElement>(".job-badge"),
				)
					.map((badge) => badge.textContent?.trim() || "")
					.filter(Boolean);

				const locationBadge =
					badges.find((badge) => badge.includes("📍")) || "";
				const capabilityBadge =
					badges.find((badge) => badge.includes("💪")) || "";

				return {
					title,
					url: titleLink?.getAttribute("href") || "",
					location: locationBadge.replace("📍", "").trim(),
					capability: capabilityBadge.replace("💪", "").trim(),
				};
			})
			.filter((role) => role.title.length > 0);
	};

	let roles: DiscoveredRole[] = extractRoles(document);
	let roleCatalogPromise: Promise<DiscoveredRole[]> | null = null;

	const loadRoleCatalog = async (): Promise<DiscoveredRole[]> => {
		if (roles.length > 0) {
			return roles;
		}

		if (roleCatalogPromise) {
			return roleCatalogPromise;
		}

		roleCatalogPromise = fetch("/job-roles")
			.then(async (response) => {
				if (!response.ok) {
					throw new Error("Unable to load job roles page");
				}
				const html = await response.text();
				const parser = new DOMParser();
				const parsedDocument = parser.parseFromString(html, "text/html");
				return extractRoles(parsedDocument);
			})
			.then((catalog) => {
				if (catalog.length > 0) {
					roles = catalog;
				}
				return roles;
			})
			.catch(() => roles);

		return roleCatalogPromise;
	};

	let isOpen = false;

	const setOpenState = (open: boolean): void => {
		isOpen = open;
		panel.hidden = !open;
		toggleButton.setAttribute("aria-expanded", String(open));

		if (open) {
			input.focus();
		}
	};

	const escapeText = (value: string): string =>
		value
			.replaceAll("&", "&amp;")
			.replaceAll("<", "&lt;")
			.replaceAll(">", "&gt;")
			.replaceAll('"', "&quot;")
			.replaceAll("'", "&#39;");

	const appendBubble = (text: string, sender: Sender = "bot"): void => {
		const bubble = document.createElement("article");
		bubble.className = `chat-bubble ${sender === "user" ? "chat-bubble-user" : "chat-bubble-bot"}`;
		bubble.innerHTML = escapeText(text);
		messages.appendChild(bubble);
		messages.scrollTop = messages.scrollHeight;
	};

	const appendRoleRecommendations = (
		recommendations: RoleRecommendation[],
	): void => {
		if (!recommendations.length) {
			return;
		}

		const list = document.createElement("ul");
		list.className = "chat-recommendations";

		recommendations.forEach((role) => {
			const item = document.createElement("li");
			const isExploreAllAction =
				role.url === "/job-roles" ||
				role.title.trim().toLowerCase() === "browse all open roles";
			if (isExploreAllAction) {
				item.classList.add("chat-recommendation-action");
			}
			const safeTitle = escapeText(role.title);
			const safeWhy = escapeText(
				role.why || "Recommended based on your interests.",
			);
			const safeMeta = escapeText(
				[role.capability, role.location].filter(Boolean).join(" | "),
			);
			if (role.url) {
				item.innerHTML = `<a href="${role.url}">${safeTitle}</a><p>${safeMeta}</p><small>${safeWhy}</small>`;
			} else {
				item.innerHTML = `<strong>${safeTitle}</strong><p>${safeMeta}</p><small>${safeWhy}</small>`;
			}
			list.appendChild(item);
		});

		messages.appendChild(list);
		messages.scrollTop = messages.scrollHeight;
	};

	const withExploreAllRecommendation = (
		recommendations: RoleRecommendation[],
	): RoleRecommendation[] => {
		const hasExploreAll = recommendations.some((recommendation) => {
			const normalizedTitle = recommendation.title.toLowerCase();
			return (
				recommendation.url === "/job-roles" ||
				normalizedTitle.includes("browse all open roles")
			);
		});

		if (hasExploreAll) {
			return recommendations;
		}

		return [
			...recommendations,
			{
				title: "Browse all open roles",
				location: "All locations",
				capability: "Multiple capabilities",
				url: "/job-roles",
				why: "Explore all available roles and refine with filters.",
			},
		];
	};

	const detectCapability = (message: string): string => {
		const normalized = message.toLowerCase();
		for (const [capability, synonyms] of Object.entries(synonymGroups)) {
			if (synonyms.some((term) => normalized.includes(term))) {
				return capability;
			}
		}
		return "";
	};

	const detectLocation = (
		message: string,
		roleList: DiscoveredRole[],
	): string => {
		const normalized = message.toLowerCase();
		const locations = Array.from(
			new Set(roleList.map((role) => role.location).filter(Boolean)),
		);
		return (
			locations.find((location) =>
				normalized.includes(location.toLowerCase()),
			) || ""
		);
	};

	const tokenizeMessage = (message: string): string[] => {
		const stopWords = new Set([
			"i",
			"me",
			"my",
			"the",
			"a",
			"an",
			"to",
			"and",
			"or",
			"for",
			"with",
			"about",
			"in",
			"on",
			"at",
			"of",
			"like",
			"want",
			"looking",
			"role",
			"roles",
			"job",
			"jobs",
		]);

		return message
			.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, " ")
			.split(/\s+/)
			.map((token) => token.trim())
			.filter((token) => token.length >= 3 && !stopWords.has(token));
	};

	const rankRolesByMessage = (
		tokens: string[],
		capabilityHint: string,
		locationHint: string,
		roleList: DiscoveredRole[],
	): Array<{ role: DiscoveredRole; score: number; reasons: string[] }> => {
		return roleList
			.map((role) => {
				let score = 0;
				const reasons: string[] = [];
				const titleLower = role.title.toLowerCase();
				const capabilityLower = role.capability.toLowerCase();
				const locationLower = role.location.toLowerCase();

				if (capabilityHint && matchesRoleFamily(role, capabilityHint)) {
					score += 8;
					reasons.push(`matches the ${capabilityHint} role family`);
				}

				if (
					locationHint &&
					locationLower.includes(locationHint.toLowerCase())
				) {
					score += 5;
					reasons.push(`available in ${role.location}`);
				}

				for (const token of tokens) {
					if (titleLower.includes(token)) {
						score += 3;
					}
					if (capabilityLower.includes(token)) {
						score += 2;
					}
				}

				return { role, score, reasons };
			})
			.filter((rankedRole) => rankedRole.score > 0)
			.sort((left, right) => right.score - left.score);
	};

	const isCapabilityExplanationQuestion = (message: string): boolean => {
		const normalized = message.toLowerCase();
		return (
			normalized.includes("what does role family mean") ||
			normalized.includes("what is role family") ||
			normalized.includes("define role family") ||
			normalized.includes("explain role family") ||
			normalized.includes("what does capability mean") ||
			normalized.includes("what is capability") ||
			normalized.includes("define capability") ||
			normalized.includes("explain capability")
		);
	};

	const capabilityExampleRecommendations = (
		roleList: DiscoveredRole[],
	): RoleRecommendation[] => {
		const byCapability = new Map<string, DiscoveredRole>();
		for (const role of roleList) {
			if (!byCapability.has(role.capability) && role.capability) {
				byCapability.set(role.capability, role);
			}
		}

		return Array.from(byCapability.values())
			.slice(0, 3)
			.map((role) => ({
				title: role.title,
				location: role.location,
				capability: role.capability,
				url: role.url,
				why: `This is an example role in ${role.capability}.`,
			}));
	};

	const genericCapabilityRecommendations = (
		capability: string,
	): RoleRecommendation[] => {
		if (capability) {
			const capabilityParam = encodeURIComponent(
				normalizeRoleFamilyForFilter(capability),
			);
			return [
				{
					title: `Explore ${capability} roles`,
					location: "All locations",
					capability,
					url: `/job-roles?capability=${capabilityParam}`,
					why: `Browse open roles and filter by ${capability} interests.`,
				},
			];
		}

		return [
			{
				title: "Browse all open roles",
				location: "All locations",
				capability: "Multiple capabilities",
				url: "/job-roles",
				why: "Start broad, then narrow down by capability and location.",
			},
		];
	};

	const fallbackResponse = async (message: string): Promise<ChatResponse> => {
		const normalized = message.toLowerCase();
		const tokens = tokenizeMessage(normalized);
		const roleList = await loadRoleCatalog();
		const isUncertain =
			normalized.includes("not sure") ||
			normalized.includes("dont know") ||
			normalized.includes("don't know") ||
			normalized.includes("help me");
		const isCapabilityQuestion = isCapabilityExplanationQuestion(normalized);
		const capability = detectCapability(normalized);
		const location = detectLocation(normalized, roleList);
		const hasRoleContext = roleList.length > 0;

		if (isCapabilityQuestion) {
			return {
				message:
					"A role family is the main discipline or team a role belongs to, such as Engineering, Platform, People Operations, Data & AI, Product Consultant, Quality, or Cybersecurity. It helps group similar jobs so you can find roles that match your strengths.",
				recommendations: withExploreAllRecommendation(
					hasRoleContext
						? capabilityExampleRecommendations(roleList)
						: genericCapabilityRecommendations(""),
				),
			};
		}

		if (!hasRoleContext) {
			if (capability) {
				return {
					message: `Great choice. ${capability} is a strong role family to explore. I can point you to open roles right now.`,
					recommendations: withExploreAllRecommendation(
						genericCapabilityRecommendations(capability),
					),
				};
			}

			if (isUncertain) {
				return {
					message:
						"No problem. A simple way to start is by role family: Engineering, Platform, People Operations, Data & AI, Product Consultant, Quality, or Cybersecurity.",
					recommendations: withExploreAllRecommendation(
						genericCapabilityRecommendations(""),
					),
				};
			}

			return {
				message:
					"Tell me your interests and I can recommend a role family. For example: 'I like building apps', 'I enjoy data analysis', or 'I prefer people-focused work'.",
				recommendations: withExploreAllRecommendation(
					genericCapabilityRecommendations(""),
				),
			};
		}

		const rankedRoles = rankRolesByMessage(
			tokens,
			capability,
			location,
			roleList,
		);
		if (!isUncertain && rankedRoles.length > 0) {
			const recommendations: RoleRecommendation[] =
				withExploreAllRecommendation(
					rankedRoles.slice(0, 3).map((rankedRole) => ({
						title: rankedRole.role.title,
						location: rankedRole.role.location,
						capability: rankedRole.role.capability,
						url: rankedRole.role.url,
						why:
							rankedRole.reasons[0] ||
							"This role seems relevant to the interests you described.",
					})),
				);

			return {
				message:
					"Great, based on what you described, these roles could be a strong fit. If you want, I can narrow this by location or level.",
				recommendations,
			};
		}

		const capabilityFiltered = capability
			? roleList.filter((role) => matchesRoleFamily(role, capability))
			: roleList;

		if (capability && capabilityFiltered.length === 0) {
			return {
				message: `I could not find open roles in the ${capability} role family right now. You can still explore all roles, or try another role family like Engineering, Platform, People Operations, Data & AI, Product Consultant, Quality, or Cybersecurity.`,
				recommendations: withExploreAllRecommendation(
					genericCapabilityRecommendations(capability),
				),
			};
		}

		let filtered = capabilityFiltered;
		if (location) {
			filtered = filtered.filter((role) =>
				role.location.toLowerCase().includes(location.toLowerCase()),
			);
		}

		if (location && filtered.length === 0 && capabilityFiltered.length > 0) {
			filtered = capabilityFiltered;
		}

		const recommendations: RoleRecommendation[] = withExploreAllRecommendation(
			filtered.slice(0, 3).map((role) => ({
				title: role.title,
				location: role.location,
				capability: role.capability,
				url: role.url,
				why:
					capability && matchesRoleFamily(role, capability)
						? `This role aligns with your interest in the ${capability} role family.`
						: "This is currently an open role you can explore.",
			})),
		);

		if (isUncertain) {
			return {
				message:
					"No worries. Here are some open roles to get started. Tell me what sounds interesting: engineering, platform, people operations, data & AI, product consulting, QA/testing, or cybersecurity.",
				recommendations,
			};
		}

		if (capability || location) {
			const filters = [
				capability ? `${capability} role family` : "",
				location || "",
			]
				.filter(Boolean)
				.join(" in ");
			return {
				message: `Here are roles I found for ${filters}.`,
				recommendations,
			};
		}

		return {
			message:
				"I did not fully understand that yet. Try asking about capabilities, locations, or interests, or browse all open roles.",
			recommendations: withExploreAllRecommendation([]),
		};
	};

	const callChatApi = async (message: string): Promise<ChatResponse> => {
		try {
			const response = await fetch(chatApi, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ message }),
			});

			if (!response.ok) {
				throw new Error("Chat API unavailable");
			}

			const payload = (await response.json()) as {
				message?: unknown;
				recommendations?: Array<Record<string, unknown>>;
			};
			const recommendations: RoleRecommendation[] = Array.isArray(
				payload.recommendations,
			)
				? payload.recommendations.map((role) => ({
						title: String(role.roleName || role.title || "Role"),
						location: String(role.location || ""),
						capability: String(role.capability || ""),
						url: String(
							role.url ||
								(role.jobRoleId ? `/job-roles/${String(role.jobRoleId)}` : ""),
						),
						why: String(role.whyRecommended || role.why || ""),
					}))
				: [];

			return {
				message:
					typeof payload.message === "string" && payload.message.length > 0
						? payload.message
						: "I found some roles that may suit you.",
				recommendations: withExploreAllRecommendation(recommendations),
			};
		} catch {
			return fallbackResponse(message);
		}
	};

	const submitMessage = async (message: string): Promise<void> => {
		appendBubble(message, "user");
		input.value = "";
		input.disabled = true;

		const sendButton = form.querySelector<HTMLButtonElement>(
			"button[type='submit']",
		);
		if (sendButton) {
			sendButton.disabled = true;
		}

		const response = await callChatApi(message);
		appendBubble(response.message, "bot");
		appendRoleRecommendations(response.recommendations || []);

		input.disabled = false;
		if (sendButton) {
			sendButton.disabled = false;
		}
		input.focus();
	};

	toggleButton.addEventListener("click", () => {
		setOpenState(!isOpen);
	});
	closeButton.addEventListener("click", () => {
		setOpenState(false);
	});

	form.addEventListener("submit", async (event: SubmitEvent) => {
		event.preventDefault();
		const message = input.value.trim();
		if (!message) {
			return;
		}
		await submitMessage(message);
	});

	promptButtons.forEach((button) => {
		button.addEventListener("click", async () => {
			const promptText = button.getAttribute("data-chat-prompt")?.trim();
			if (!promptText) {
				return;
			}
			if (!isOpen) {
				setOpenState(true);
			}
			await submitMessage(promptText);
		});
	});

	document.addEventListener("keydown", (event: KeyboardEvent) => {
		if (event.key === "Escape" && isOpen) {
			setOpenState(false);
			toggleButton.focus();
		}
	});
})();
