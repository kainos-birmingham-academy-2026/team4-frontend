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
	const submitButton = form?.querySelector<HTMLButtonElement>(
		"button[type=submit]",
	);

	if (
		!panel ||
		!toggleButton ||
		!closeButton ||
		!form ||
		!input ||
		!messages ||
		!submitButton
	) {
		return;
	}

	let isOpen = false;

	const escapeText = (text: string): string =>
		text
			.replaceAll("&", "&amp;")
			.replaceAll("<", "&lt;")
			.replaceAll(">", "&gt;")
			.replaceAll('"', "&quot;")
			.replaceAll("'", "&#39;");

	const setOpenState = (open: boolean): void => {
		isOpen = open;
		panel.hidden = !open;
		toggleButton.hidden = open;
		toggleButton.setAttribute("aria-expanded", String(open));

		if (open) {
			input.focus();
		} else {
			toggleButton.focus();
		}
	};

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

	const callChatApi = async (message: string): Promise<ChatResponse> => {
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
					url:
						typeof role.url === "string" && role.url.length > 0
							? role.url
							: typeof role.jobRoleId === "number"
								? `/job-roles/${role.jobRoleId}`
								: "",
					why: String(role.why || role.whyRecommended || ""),
				}))
			: [];

		return {
			message: String(payload.message || "No response"),
			recommendations,
		};
	};

	const submitMessage = async (): Promise<void> => {
		const message = input.value.trim();
		if (!message) {
			return;
		}

		appendBubble(message, "user");
		input.value = "";
		input.disabled = true;
		submitButton.disabled = true;

		try {
			const response = await callChatApi(message);
			appendBubble(response.message, "bot");
			appendRoleRecommendations(response.recommendations);
		} catch {
			appendBubble(
				"Sorry, I'm having trouble connecting. Please try again.",
				"bot",
			);
		} finally {
			input.disabled = false;
			submitButton.disabled = false;
			input.focus();
		}
	};

	// Event listeners
	toggleButton.addEventListener("click", () => {
		setOpenState(!isOpen);
	});

	closeButton.addEventListener("click", () => {
		setOpenState(false);
	});

	form.addEventListener("submit", (e) => {
		e.preventDefault();
		submitMessage();
	});

	promptButtons.forEach((button) => {
		button.addEventListener("click", () => {
			input.value = button.getAttribute("data-chat-prompt") || "";
			submitMessage();
		});
	});

	document.addEventListener("keydown", (e) => {
		if (!isOpen) {
			return;
		}

		if (e.key === "Escape") {
			setOpenState(false);
			return;
		}

		if (e.key !== "Tab") {
			return;
		}

		// Keep keyboard focus inside the open dialog.
		const focusable = Array.from(
			panel.querySelectorAll<HTMLElement>(
				"a[href], button:not([disabled]), input:not([disabled])",
			),
		).filter((element) => !element.hidden);

		if (!focusable.length) {
			return;
		}

		const first = focusable[0];
		const last = focusable[focusable.length - 1];
		const active = document.activeElement;

		if (e.shiftKey && (active === first || !panel.contains(active))) {
			e.preventDefault();
			last.focus();
		} else if (!e.shiftKey && active === last) {
			e.preventDefault();
			first.focus();
		}
	});

	isOpen = false;
	panel.hidden = true;
	toggleButton.hidden = false;
	toggleButton.setAttribute("aria-expanded", "false");
})();
