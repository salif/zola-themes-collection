// Debounce helper to avoid hammering the index while typing.
function debounce(func, wait, immediate) {
  var timeout;
  return function () {
    var context = this,
      args = arguments;
    var later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

function formatSearchResultItem(item) {
  var title = item.doc && item.doc.title ? item.doc.title : item.ref;
  var summary = "";
  if (item.doc) {
    summary = item.doc.summary || item.doc.description || "";
    if (!summary && item.doc.body) {
      summary =
        item.doc.body.slice(0, 140) + (item.doc.body.length > 140 ? "…" : "");
    }
  }
  return (
    '<article class="post-entry">' +
    '<header class="entry-header">' +
    '<h3>'+
    title +
    "&nbsp;»</h3></header>" +
    (summary ? '<div class="entry-content"><p>' + summary + "</p></div>" : "") +
    '<a class="entry-link" href="' +
    item.ref +
    '" aria-label="' +
    title +
    '"></a>' +
    '</article>'
  );
}

function normalizeTerm(term) {
  return term.toLowerCase().split(/\s+/).filter(Boolean);
}

function documentMatches(doc, terms) {
  if (!terms.length) return false;
  var haystack = ((doc.title || "") + " " + (doc.body || "")).toLowerCase();
  for (var i = 0; i < terms.length; i++) {
    if (haystack.indexOf(terms[i]) === -1) {
      return false;
    }
  }
  return true;
}

function initSearch() {
  var input = document.getElementById("searchInput");
  var resultsList = document.getElementById("searchResults");
  if (!input || !resultsList) {
    return; // No search DOM on this page.
  }

  var MAX_ITEMS = 10;
  var currentTerm = "";
  var indexPromise = null; // resolves to array of docs

  async function initIndex() {
    if (!indexPromise) {
      indexPromise = loadIndex();
    }
    return indexPromise;
  }

  async function loadIndex() {
    // Try JSON index first (if enabled).
    try {
      var jsonResponse = await fetch("/search_index.en.json");
      if (
        jsonResponse.ok &&
        jsonResponse.headers.get("content-type")?.includes("application/json")
      ) {
        var data = await jsonResponse.json();
        return Array.isArray(data) ? data : data.docs || [];
      }
    } catch (_) {
      // fall back to JS format
    }

    // Fallback: Zola default JS index format (`window.searchIndex = {...}`)
    try {
      var jsResponse = await fetch("/search_index.en.js");
      var text = await jsResponse.text();
      var prefix = "window.searchIndex = ";
      if (text.startsWith(prefix)) {
        var parsed = JSON.parse(text.slice(prefix.length));
        var docsObj = (parsed.documentStore && parsed.documentStore.docs) || {};
        return Object.keys(docsObj).map(function (key) {
          var doc = docsObj[key];
          return {
            title: doc.title || key,
            body: doc.body || "",
            summary: doc.summary || "",
            permalink: key,
            url: key,
          };
        });
      }
    } catch (err) {
      console.error("Failed to load search index", err);
    }
    return [];
  }

  async function performSearch(term) {
    if (!term) {
      resultsList.style.display = "none";
      resultsList.innerHTML = "";
      return;
    }
    var docs = await initIndex();
    var terms = normalizeTerm(term);
    var results = [];
    for (var i = 0; i < docs.length; i++) {
      if (documentMatches(docs[i], terms)) {
        results.push({ ref: docs[i].permalink || docs[i].url, doc: docs[i] });
      }
    }
    if (!results.length) {
      resultsList.style.display = "none";
      resultsList.innerHTML = "";
      return;
    }
    resultsList.style.display = "block";
    resultsList.innerHTML = "";
    for (var i = 0; i < Math.min(results.length, MAX_ITEMS); i++) {
      resultsList.innerHTML += formatSearchResultItem(results[i]);
    }
  }

  var debounced = debounce(async function () {
    var term = input.value.trim();
    if (term === currentTerm) {
      return;
    }
    currentTerm = term;
    performSearch(term);
  }, 150);

  input.addEventListener("keyup", debounced);

  window.addEventListener("click", function (e) {
    if (
      resultsList.style.display === "block" &&
      !resultsList.contains(e.target)
    ) {
      resultsList.style.display = "none";
    }
  });

  // Pre-fill from ?q=...
  var params = new URLSearchParams(window.location.search);
  var initial = params.get("q");
  if (initial) {
    input.value = initial;
    currentTerm = ""; // force search
    performSearch(initial);
  }
}

if (
  document.readyState === "complete" ||
  (document.readyState !== "loading" && !document.documentElement.doScroll)
) {
  initSearch();
} else {
  document.addEventListener("DOMContentLoaded", initSearch);
}
