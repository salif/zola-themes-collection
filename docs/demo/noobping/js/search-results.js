function titleFromUrl(url) {
    const u = new URL(url, window.location.origin);
    const segments = u.pathname.split("/").filter(Boolean);
    if (segments.length === 0) return document.title;
    return segments.pop()
        .split("-")
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
}

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q") || "";
    const idx = elasticlunr.Index.load(window.searchIndex);
    const results = q ? idx.search(q, { expand: true }) : [];
    const container = document.getElementById("search-results");

    container.innerHTML = "";

    results.forEach(({ ref }) => {
        const doc = idx.documentStore.getDoc(ref);
        if (!doc) return;  // guard against missing refs

        const displayTitle = doc.title || titleFromUrl(doc.id);
        const li = document.createElement("li");
        li.innerHTML = `<a href="${doc.id}">${displayTitle}</a>`;
        container.appendChild(li);
    });

    document.querySelector("form").addEventListener("submit", e => {
        e.preventDefault();
        const term = document.getElementById("search").value;
        window.location.search = "?q=" + encodeURIComponent(term);
    });
});
