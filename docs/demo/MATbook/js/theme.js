document.addEventListener("DOMContentLoaded", function () {
    const toggleBtn = document.getElementById("theme-toggle");
    // Safety check: If the page doesn't have a toggle button, stop to prevent errors
    if (!toggleBtn) return;

    const icon = toggleBtn.querySelector("i");
    const html = document.documentElement;

    // --- 1. ROBUST SYNC ON LOAD ---
    // Check two things:
    // 1. <head> script already set the theme
    // 2. Or LocalStorage say "dark"? (Fallback in case <head> script failed)
    const savedTheme = localStorage.getItem("theme");
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = html.getAttribute("data-theme") === "dark" || savedTheme === "dark" || (!savedTheme && systemDark);

    if (isDark) {
        // Force the attribute (Just in case the head script missed it)
        html.setAttribute("data-theme", "dark");
        
        // Force the Icon to be a Sun
        if (icon) {
            icon.classList.remove("fa-moon");
            icon.classList.add("fa-sun");
        }
    }

    // --- 2. CLICK HANDLER ---
    toggleBtn.addEventListener("click", function () {
        const currentTheme = html.getAttribute("data-theme");
        
        if (currentTheme === "dark") {
            // Switch to Light
            html.setAttribute("data-theme", "light");
            localStorage.setItem("theme", "light");
            if (icon) {
                icon.classList.remove("fa-sun");
                icon.classList.add("fa-moon");
            }
        } else {
            // Switch to Dark
            html.setAttribute("data-theme", "dark");
            localStorage.setItem("theme", "dark");
            if (icon) {
                icon.classList.remove("fa-moon");
                icon.classList.add("fa-sun");
            }
        }
    });
});

