(() => {
	const inputs = document.querySelectorAll<HTMLInputElement>(
		'input[type="password"], input[type="email"]',
	);

	inputs.forEach((input) => {
		const warning = document.createElement("p");
		warning.className = "caps-lock-warning";
		warning.id = `${input.id || input.name}-caps-lock`;
		warning.setAttribute("role", "status");
		warning.setAttribute("aria-live", "polite");
		warning.hidden = true;
		warning.innerHTML =
			'<span class="caps-lock-icon" aria-hidden="true">⇪</span> Caps Lock is on';
		input.insertAdjacentElement("afterend", warning);

		const update = (event: KeyboardEvent): void => {
			warning.hidden = !event.getModifierState("CapsLock");
		};

		input.addEventListener("keydown", update);
		input.addEventListener("keyup", update);
		input.addEventListener("blur", () => {
			warning.hidden = true;
		});
	});
})();
