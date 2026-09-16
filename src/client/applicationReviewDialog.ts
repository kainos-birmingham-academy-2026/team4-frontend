(() => {
	const dialog = document.querySelector<HTMLDialogElement>(
		"#application-review-dialog",
	);
	const content = dialog?.querySelector<HTMLElement>(
		"[data-review-dialog-content]",
	);

	if (!dialog || !content) {
		return;
	}

	let trigger: HTMLButtonElement | null = null;

	document.addEventListener("click", (event) => {
		const target = event.target;
		if (!(target instanceof Element)) {
			return;
		}

		const button = target.closest<HTMLButtonElement>(
			"[data-review-dialog-open]",
		);
		const templateId = button?.dataset.reviewDialogOpen;
		const template = templateId
			? document.getElementById(templateId)
			: undefined;

		if (!(template instanceof HTMLTemplateElement) || !button) {
			return;
		}

		trigger = button;
		content.replaceChildren(template.content.cloneNode(true));
		const title = content.querySelector<HTMLElement>("h2");
		title?.setAttribute("id", "application-review-dialog-title");
		dialog.showModal();
	});

	dialog.addEventListener("close", () => {
		content.replaceChildren();
		trigger?.focus();
		trigger = null;
	});
})();
