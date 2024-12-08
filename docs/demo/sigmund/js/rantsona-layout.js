const giscus_collection = document.getElementsByClassName("giscus");
const giscus = giscus_collection.item(0);

var config = { attributes: true, childList: true, subtree: true };
var callback = function() {
    const giscus_collection = document.getElementsByClassName("giscus");
    const giscus = giscus_collection.item(0);
    const footer = document.getElementById("footer");

    document.documentElement.style.setProperty(
        "--rantsona-offset",
        (giscus.offsetHeight + footer.offsetHeight) + "px"
    );

    if (localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        setCommentTheme('dark');
    } else {
        setCommentTheme('light');
    }
}

const observer = new MutationObserver(callback);
observer.observe(giscus, config);