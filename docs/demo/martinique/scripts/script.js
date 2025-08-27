const THEME_KEY = "martinique-theme";
let storedPreference = localStorage.getItem(THEME_KEY);
let prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;

if (storedPreference == "light")
    switchTheme(false);
else if (prefersLight && storedPreference != "dark")
    switchTheme(false);

document.querySelector("#theme-switcher").addEventListener("click", switchTheme);

function switchTheme(savePreference = true) {
    let bodyClasses = document.body.classList;
    if (bodyClasses.contains("light-theme")) {
        bodyClasses.remove("light-theme");
        if (savePreference)
            localStorage.setItem(THEME_KEY, "dark");
    }
    else {
        bodyClasses.add("light-theme");
        if (savePreference)
            localStorage.setItem(THEME_KEY, "light");
    }
}