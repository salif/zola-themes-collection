// init - HEADER - MENU
// Get DOM elements
const hamburger = document.querySelector(".hamburger");
const mobileMenu = document.querySelector(".mobile-menu");
const mobileCloseBtn = document.querySelector(".mobile-close-btn");
const mobileBackdrop = document.querySelector(".mobile-menu-backdrop");
const mobileDropdownTrigger = document.querySelector(
  ".mobile-dropdown-trigger",
);
const mobileDropdown = document.querySelector(".mobile-dropdown");

// Toggle mobile menu
function toggleMobileMenu() {
  hamburger.classList.toggle("active");
  mobileMenu.classList.toggle("active");
  mobileBackdrop.classList.toggle("active");
  document.body.style.overflow = mobileMenu.classList.contains("active")
    ? "hidden"
    : "";
}

// Close mobile menu
function closeMobileMenu() {
  hamburger.classList.remove("active");
  mobileMenu.classList.remove("active");
  mobileBackdrop.classList.remove("active");
  document.body.style.overflow = "";
}

// Event listeners
hamburger.addEventListener("click", toggleMobileMenu);
mobileCloseBtn.addEventListener("click", closeMobileMenu);
mobileBackdrop.addEventListener("click", closeMobileMenu);

// Mobile dropdown toggle
if (mobileDropdownTrigger) {
  mobileDropdownTrigger.addEventListener("click", () => {
    mobileDropdown.classList.toggle("active");
  });
}

// Close mobile menu when clicking on a link
const mobileNavLinks = document.querySelectorAll(
  ".mobile-nav-link:not(.mobile-dropdown-trigger)",
);
mobileNavLinks.forEach((link) => {
  link.addEventListener("click", () => {
    if (!link.classList.contains("mobile-dropdown-trigger")) {
      closeMobileMenu();
    }
  });
});

// Close mobile menu on window resize if larger than tablet
window.addEventListener("resize", () => {
  if (window.innerWidth >= 768) {
    closeMobileMenu();
  }
});
// end - HEADER - MENU
