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
  const searchBox = document.getElementById("searchbox");
  const searchModal = document.querySelector("#searchbox .search-modal");
  const searchInput = document.getElementById("searchInput");
  const searchButton = document.getElementById("searchButton");
  const searchLink = document.querySelector('a[title="Search"]');

  searchLink.addEventListener("click", function (event) {
    event.preventDefault();
    searchBox.classList.remove("hidden");
    searchInput.focus(); // focus on input
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      searchBox.classList.add("hidden");
    }
  });

  document.addEventListener("click", function (event) {
    // check if click inside the search panel
    const isClickInside =
      searchModal.contains(event.target) || searchLink.contains(event.target);
    if (!isClickInside) {
      searchBox.classList.add("hidden");
    }
  });

  // TODO search function
  searchButton.addEventListener("click", function () {
    const searchTerm = searchInput.value.trim();

    if (searchTerm) {
      // TODO jump to search page?
      const searchUrl = `/search.html?q=${encodeURIComponent(searchTerm)}`;
      window.location.href = searchUrl;
    } else {
      alert("Please enter a search term.");
    }
  });
});
