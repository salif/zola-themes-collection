document.addEventListener("DOMContentLoaded", () => {
	const floaties = document.getElementById("floaties");
	if (!floaties) return;

	let lastScrollY = 0;

	const handleScroll = () => {
		const currentScrollY = window.scrollY;

		if (currentScrollY > lastScrollY) {
			setTimeout(() => {
				floaties.classList.add("hidden");
			}, 300);
		} else {
			setTimeout(() => {
				floaties.classList.remove("hidden");
			}, 400);
		}

		lastScrollY = currentScrollY;
	};

	window.addEventListener("scroll", handleScroll);
});
