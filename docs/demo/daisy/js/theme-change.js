function themeBtn() {
    (function (theme = localStorage.getItem("theme")) {
        if (theme != undefined && theme != "") {
            if (localStorage.getItem("theme") && localStorage.getItem("theme") != "") {
                document.documentElement.setAttribute("data-theme", theme);
                [...document.querySelectorAll("[data-set-theme='" + theme.toString() + "']")].forEach(el => {
                    el.classList.add("btn-active")
                    el.classList.add("btn-primary")
                    el.classList.add("menu-active")
                });
            }
        }
    })();
    [...document.querySelectorAll("[data-set-theme]")].forEach(el => {
        el.addEventListener("click", function () {
            newTheme = this.getAttribute("data-set-theme")
            document.documentElement.setAttribute("data-theme", this.getAttribute("data-set-theme"));
            localStorage.setItem("theme", document.documentElement.getAttribute("data-theme"));
            [...document.querySelectorAll("[data-set-theme]")].forEach(el => {
                el.classList.remove("btn-active")
                el.classList.remove("btn-primary")
                el.classList.remove("menu-active")
            });

            [...document.querySelectorAll("[data-set-theme='" + newTheme.toString() + "']")].forEach(el => {
                el.classList.add("btn-active")
                el.classList.add("btn-primary")
                el.classList.add("menu-active")
            });
        })
    })
}

function themeChange(attach = true) {
    if (attach === true) {
        document.addEventListener("DOMContentLoaded", function (event) {
            themeBtn()
        })
    } else {
        themeBtn()
    }
}
if (typeof exports != "undefined") {
    module.exports = {
        themeChange: themeChange
    }
} else {
    themeChange()
}