const cls = document.querySelector("html").classList;
        const sessionTheme = sessionStorage.getItem("theme");

        function setDark() {
            cls.add("dark-mode");
            cls.remove("light-mode");
            sessionStorage.setItem("theme", "dark");
        }
        function setLight() {
            cls.add("light-mode");
            cls.remove("dark-mode");
            sessionStorage.setItem("theme", "light");
        }

        if (sessionTheme === "dark") {
            setDark();
        } else if (sessionTheme === "light") {
            setLight();
        } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            setDark();
        }

        document.getElementById("dark-mode-on").addEventListener("click", function(e) {
            setDark();
        });
        document.getElementById("dark-mode-off").addEventListener("click", function(e) {
            setLight();
        });