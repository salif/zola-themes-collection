document.addEventListener("DOMContentLoaded", () => {
  const toggles = document.querySelectorAll(".toggle-content");

  toggles.forEach((toggle) => {
    toggle.addEventListener("click", (event) => {
      event.preventDefault();

      const content = toggle
        .closest(".home-list")
        .querySelector(".home-list-content");

      if (content.classList.contains("show")) {
        content.classList.remove("show");
        toggle.setAttribute("aria-expanded", "false");
      } else {
        content.classList.add("show");
        toggle.setAttribute("aria-expanded", "true");
      }
    });
  });
});
document.addEventListener("DOMContentLoaded", function () {
  const searchToggleBox = document.getElementById("search-toggle-box");
  const searchToggleModal = document.querySelector("#search-toggle-box .search-toggle-modal");
  const searchToggleInput = document.getElementById("search-toggle-input");
  const searchToggleButton = document.getElementById("search-toggle-button");
  const searchToggleLink = document.querySelector('[data-search-toggle="true"]');

  if (!searchToggleBox || !searchToggleModal || !searchToggleInput || !searchToggleButton || !searchToggleLink) {
    return; // Search toggle UI not present.
  }

  searchToggleLink.addEventListener("click", function (event) {
    event.preventDefault();
    searchToggleBox.classList.remove("hidden");
    searchToggleInput.focus();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      searchToggleBox.classList.add("hidden");
    }
  });

  document.addEventListener("click", function (event) {
    // check if click inside the search panel
    const isClickInside =
      searchToggleModal.contains(event.target) || searchToggleLink.contains(event.target);
    if (!isClickInside) {
      searchToggleBox.classList.add("hidden");
    }
  });

  // TODO search function
  searchToggleButton.addEventListener("click", function () {
    const searchTerm = searchToggleInput.value.trim();

    if (searchTerm) {
      // TODO jump to search page?
      const searchUrl = `/search/?q=${encodeURIComponent(searchTerm)}`;
      window.location.href = searchUrl;
    } else {
      alert("Please enter a search term.");
    }
  });
});
