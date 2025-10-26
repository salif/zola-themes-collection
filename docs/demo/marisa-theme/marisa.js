
"use strict";

document.addEventListener("DOMContentLoaded", (event) => {
    initSearch();
    initWebmentionForm();
    initWebmentionData();
});

/* setup search function */
function initSearch() {
    if (document.readyState !== "interactive" && document.readyState !== "complete") {
        return;
    }

    var search_box = document.getElementById("search");
    var search_dialog = document.getElementById("search-results");
    var search_items = document.getElementById("search-results-items");
    var search_items_count = 5;

    if (!search_box || !search_dialog || !search_items) {
        return;
    }

    if (!Fuse || !window.searchIndex) {
        return;
    }

    var searchTerm = "";
    var searchOptions = {
        includeScore: true,
        keys: [
            { name: "title", weight: 1.5 },
            { name: "description", weight: 1 },
            { name: "body", weight: 0.5 },
            { name: "url", weight: 0.5 },
        ]
    };

    var searchIndex = new Fuse(window.searchIndex, searchOptions);
    if (!searchIndex) {
        return;
    }

    search_box.ariaBusy = false;

    search_box.addEventListener("input", debounce(function() {
        var term = search_box.value.trim();

        if (term == searchTerm || term == "") {
            return;
        }

        searchTerm = term;
        var results = searchIndex.search(searchTerm);

        if (results.length == 0) {
            return;
        }

        var count = Math.min(results.length, search_items_count);
        search_items.innerHTML = "";

        for (var i = 0; i < count; i++) {
            var item = results[i].item;
            var group = document.createElement("hgroup");
            var groupLink = document.createElement("a");
            var groupTitle = document.createElement("p");
            var groupBody = document.createElement("small");
            var groupBodyOuter = document.createElement("p");
            var groupDivider = document.createElement("hr");

            groupBody.textContent = item.description.substring(0, 200);
            groupLink.textContent = item.title;
            groupLink.href = item.url;
            groupTitle.appendChild(groupLink);
            groupBodyOuter.appendChild(groupBody);
            group.appendChild(groupTitle);
            group.appendChild(groupBodyOuter);

            search_items.appendChild(group);
            search_items.appendChild(groupDivider);
        }

        search_dialog.open = true;
        document.documentElement.classList.add("modal-is-opening", "modal-is-open");
    }, 500));
}

/* setup webmention form */
function initWebmentionForm() {
    if (document.readyState !== "interactive" && document.readyState !== "complete") {
        return;
    }

    var mentionForm = document.getElementById("wm-field");
    var mentionTarget = document.getElementById("wm-field-target");

    if (mentionForm && mentionTarget)
    {
        mentionForm.action = "https://webmention.io/" + window.location.hostname + "/webmention";
        mentionForm.method = "post";
        mentionTarget.value = window.location.href;
    }
}

/* query webmention data */
async function initWebmentionData() {
    if (document.readyState !== "interactive" && document.readyState !== "complete") {
        return;
    }

    var webmention_container = document.getElementById("wm-interaction");
    var social = document.getElementById("wm-on");
    if (!social || !social.dataset.user) {
        return;
    }

    var social_link_target = document.getElementById("wm-social-link");
    var like_count_target = document.getElementById("wm-like-count");
    var share_count_target = document.getElementById("wm-share-count");
    var reply_count_target = document.getElementById("wm-reply-count");
    var like_users_target = document.getElementById("wm-like-users");
    var share_users_target = document.getElementById("wm-share-users");
    var reply_users_target = document.getElementById("wm-reply-users");
    if (!social_link_target || !like_count_target || !share_count_target || !reply_count_target) {
        return;
    }

    // no comment paging support for now
    var response = await fetch("https://webmention.io/api/mentions.jf2?target=" + encodeURIComponent(document.URL) + "&sort-by=created&sort-dir=up&per-page=200&page=0");
    var data = await response.json();

    if (!data || data.children.length == 0) {
        social_link_target.remove();
        webmention_container.remove();
        return;
    }

    var social_link_author = social.dataset.user.toLowerCase();
    var social_link = "";
    var other_count = 0;
    var like_authors = [];
    var share_authors = [];
    var reply_authors = [];

    for (var child of data.children) {
        var wm_type = child["wm-property"];
        var wm_source = child["wm-source"];
        var wm_url = child["url"];

        // extract author posted thread
        if (!social_link && wm_source.includes(social_link_author)) {
            social_link = wm_url.split("#")[0];
        }

        if (wm_type == "in-reply-to") {
            reply_authors.push({
                author: child["author"]["name"],
                avatar: child["author"]["photo"],
                url: child["wm-source"],
                action: "💬",
            });

        } else if (wm_type == "repost-of") {
            share_authors.push({
                author: child["author"]["name"],
                avatar: child["author"]["photo"],
                url: child["author"]["url"],
                action: "📮",
            });

        } else if (wm_type == "like-of") {
            like_authors.push({
                author: child["author"]["name"],
                avatar: child["author"]["photo"],
                url: child["author"]["url"],
                action: "⭐️",
            });

        } else if (wm_type == "mention-of") {
            other_count++;

        } else if (wm_type == "bookmark-of") {
            other_count++;

        }
    }

    if (social_link) {
        social_link_target.href = social_link;
    } else {
        social_link_target.remove();
    }

    like_count_target.textContent = like_authors.length;
    share_count_target.textContent = share_authors.length;
    reply_count_target.textContent = reply_authors.length;

    for (var user of like_authors) {
        var link = document.createElement("a");
        var avatar = document.createElement("img");
        avatar.src = user.avatar;
        avatar.style.width = "2rem";
        avatar.style.height = "2rem";
        avatar.decoding = "async";
        avatar.loading = "lazy";
        link.href = user.url;
        link.dataset.tooltip = user.action + " " + user.author;

        link.appendChild(avatar);
        like_users_target.appendChild(link);
    }

    if (like_authors.length == 0) {
        like_users_target.parentElement.remove();
    }

    for (var user of share_authors) {
        var link = document.createElement("a");
        var avatar = document.createElement("img");
        avatar.src = user.avatar;
        avatar.style.width = "2rem";
        avatar.style.height = "2rem";
        avatar.decoding = "async";
        avatar.loading = "lazy";
        link.href = user.url;
        link.dataset.tooltip = user.action + " " + user.author;

        link.appendChild(avatar);
        share_users_target.appendChild(link);
    }

    if (share_authors.length == 0) {
        share_users_target.parentElement.remove();
    }

    for (var user of reply_authors) {
        var link = document.createElement("a");
        var avatar = document.createElement("img");
        avatar.src = user.avatar;
        avatar.style.width = "2rem";
        avatar.style.height = "2rem";
        avatar.decoding = "async";
        avatar.loading = "lazy";
        link.href = user.url;
        link.dataset.tooltip = user.action + " " + user.author;

        link.appendChild(avatar);
        reply_users_target.appendChild(link);
    }

    if (reply_authors.length == 0) {
        reply_users_target.parentElement.remove();
    }
}

/* close search dialog */
function closeSearchDialog (ev) {
    if (document.readyState !== "interactive" && document.readyState !== "complete") {
        return;
    }

    if (ev.target != ev.currentTarget) {
        return;
    }

    ev.preventDefault();

    var dialog = document.getElementById("search-results");
    if (!dialog) {
        return;
    }

    dialog.open = false;
    document.documentElement.classList.remove("modal-is-opening", "modal-is-open");

    var items = document.getElementById("search-results-items");
    if (!items) {
        return;
    }

    items.innerHTML = "";
}

/* delay event */
function debounce(func, wait) {
    var timeout;

    return function () {
        var context = this;
        var args = arguments;
        clearTimeout(timeout);

        timeout = setTimeout(function () {
            timeout = null;
            func.apply(context, args);
        }, wait);
    };
}
