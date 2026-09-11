(() => {
	const dialog = document.querySelector<HTMLDialogElement>(
		"#confirmation-dialog",
	);
	const message = dialog?.querySelector<HTMLElement>(
		"[data-confirmation-message]",
	);
	const confirmButton = dialog?.querySelector<HTMLButtonElement>(
		"[data-confirmation-confirm]",
	);
	const cancelButton = dialog?.querySelector<HTMLButtonElement>(
		"[data-confirmation-cancel]",
	);

	if (!dialog || !message || !confirmButton || !cancelButton) return;

	let pendingForm: HTMLFormElement | null = null;

	const closeDialog = (confirmed: boolean) => {
		dialog.close(confirmed ? "confirm" : "cancel");
	};

	document.addEventListener("submit", (event) => {
		const form = event.target;
		if (!(form instanceof HTMLFormElement)) return;

		const confirmationMessage = form.dataset.confirmationMessage;
		if (!confirmationMessage) return;

		event.preventDefault();
		pendingForm = form;
		message.textContent = confirmationMessage;
		dialog.showModal();
		confirmButton.focus();
	});

	confirmButton.addEventListener("click", () => closeDialog(true));
	cancelButton.addEventListener("click", () => closeDialog(false));

	dialog.addEventListener("close", () => {
		const form = pendingForm;
		pendingForm = null;

		if (dialog.returnValue === "confirm") {
			form?.submit();
		}
	});
})();
