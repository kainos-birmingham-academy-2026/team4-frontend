(() => {
	const toggle = document.querySelector<HTMLButtonElement>("[data-nav-toggle]");
	const nav = document.querySelector<HTMLElement>("#primary-nav");

	if (!toggle || !nav) {
		return;
	}

	const setOpen = (open: boolean): void => {
		nav.classList.toggle("is-open", open);
		toggle.classList.toggle("is-open", open);
		toggle.setAttribute("aria-expanded", String(open));
		toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
	};

	toggle.addEventListener("click", () => {
		setOpen(toggle.getAttribute("aria-expanded") !== "true");
	});

	nav.addEventListener("click", (event) => {
		if ((event.target as HTMLElement).tagName === "A") {
			setOpen(false);
		}
	});

	document.addEventListener("keydown", (event) => {
		if (event.key === "Escape") {
			setOpen(false);
		}
	});
})();
