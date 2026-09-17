const comparisonForm = document.querySelector<HTMLFormElement>(
	"[data-comparison-form]",
);

if (comparisonForm) {
	const sides = Array.from(
		comparisonForm.querySelectorAll<HTMLElement>("[data-comparison-side]"),
	);
	const submitButton = comparisonForm.querySelector<HTMLButtonElement>(
		"[data-compare-submit]",
	);
	const message = comparisonForm.querySelector<HTMLElement>(
		"[data-comparison-message]",
	);
	const heading = comparisonForm.querySelector<HTMLElement>(
		"[data-comparison-heading]",
	);
	const status = comparisonForm.querySelector<HTMLElement>(
		"[data-comparison-status]",
	);
	const roleSelects = sides
		.map((side) => side.querySelector<HTMLSelectElement>("[data-role-select]"))
		.filter((select): select is HTMLSelectElement => Boolean(select));

	const updateFormState = () => {
		const selectedRoles = roleSelects.map((select) => select.value);
		const complete = selectedRoles.every(Boolean);
		const duplicate = complete && selectedRoles[0] === selectedRoles[1];
		const missingStartingRole = !selectedRoles[0];
		const missingTargetRole = !selectedRoles[1];

		if (submitButton) submitButton.disabled = !complete || duplicate;
		if (heading) {
			heading.textContent =
				complete && !duplicate ? "Comparison ready" : "Comparison not ready";
		}
		if (status) {
			status.dataset.comparisonStatus =
				complete && !duplicate ? "ready" : "incomplete";
		}
		if (message) {
			if (duplicate) {
				message.textContent = "Choose two different roles to compare.";
			} else if (complete) {
				message.textContent = "You can now compare these roles.";
			} else if (missingStartingRole && missingTargetRole) {
				message.textContent = "Select a starting role and a target role.";
			} else if (missingStartingRole) {
				message.textContent = "Select a starting role to continue.";
			} else {
				message.textContent = "Select a target role to continue.";
			}
		}
	};

	sides.forEach((side) => {
		const capabilitySelect = side.querySelector<HTMLSelectElement>(
			"[data-capability-select]",
		);
		const roleSelect =
			side.querySelector<HTMLSelectElement>("[data-role-select]");
		if (!capabilitySelect || !roleSelect) return;

		capabilitySelect.addEventListener("change", () => {
			const capabilityId = capabilitySelect.value;
			roleSelect.value = "";
			roleSelect.disabled = !capabilityId;
			roleSelect.options[0].textContent = capabilityId
				? "Select a role"
				: "Select a capability first";

			Array.from(roleSelect.options)
				.slice(1)
				.forEach((option) => {
					const matches = option.dataset.capabilityId === capabilityId;
					option.hidden = !matches;
					option.disabled = !matches;
				});
			updateFormState();
		});
		roleSelect.addEventListener("change", updateFormState);
	});
	updateFormState();
}
