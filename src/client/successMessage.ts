(() => {
	const successMessages = document.querySelectorAll<HTMLElement>(
		".form-success-summary",
	);

	successMessages.forEach((successMessage) => {
		successMessage.addEventListener("animationend", (event) => {
			if (event.animationName === "collapse-success") {
				successMessage.remove();
			}
		});
	});
})();
