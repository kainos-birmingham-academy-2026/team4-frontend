(() => {
	const prefersReducedMotion = window.matchMedia(
		"(prefers-reduced-motion: reduce)",
	).matches;

	const revealTargets = document.querySelectorAll<HTMLElement>(
		".fade-in, .timeline-card-reveal",
	);
	if (!revealTargets.length) return;

	if (prefersReducedMotion) {
		revealTargets.forEach((el) => {
			el.classList.add("visible");
		});
		return;
	}

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;

				const target = entry.target as HTMLElement;
				const delay = target.getAttribute("data-delay");
				if (delay) {
					target.style.animationDelay = `${Number(delay) * 0.1}s`;
				}
				target.classList.add("visible");
				observer.unobserve(target);
			}
		},
		{ threshold: 0.1, rootMargin: "0px 0px -100px 0px" },
	);

	revealTargets.forEach((el) => {
		observer.observe(el);
	});
})();
