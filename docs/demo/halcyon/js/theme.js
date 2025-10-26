const cls = document.documentElement.classList;
const sessionTheme = sessionStorage.getItem("theme");

const setDark = () => {
  cls.add("dark-mode");
  cls.remove("light-mode");
  sessionStorage.setItem("theme", "dark");
};

const setLight = () => {
  cls.add("light-mode");
  cls.remove("dark-mode");
  sessionStorage.setItem("theme", "light");
};

if (sessionTheme === "dark") {
  setDark();
} else if (sessionTheme === "light") {
  setLight();
} else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
  setDark();
}

document.getElementById("dark-mode-on").addEventListener("click", setDark);
document.getElementById("dark-mode-off").addEventListener("click", setLight);