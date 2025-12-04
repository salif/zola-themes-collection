console.log("Hotkeys script loaded");

window.goElems = [];
window.hintInput = "";
window.jumpStack = [];
// 1. INITIALIZE SETTINGS ON LOAD
// Restore 'c' toggle preference immediately
(function initSettings() {
    let savedCollapse = localStorage.getItem("collapse-sidebar");
    if (savedCollapse === 'true') {
        document.body.classList.add('collapse-mode');
    }
    let savedTOC = localStorage.getItem("toc-collapse");
    if (savedTOC === 'true') document.documentElement.classList.add('toc-collapse-mode');
})();
// 2. EXPAND ACTIVE MENU PATH
// This ensures that if you are in a subsection, the parent chapter stays open in 'c' mode
(function expandActivePath() {
    // Find the currently active link/list item
    let activeItem = document.querySelector('.menu li.active');
    
    if (activeItem) {
        // Climb up the tree and mark all parent LIs as "active-parent"
        let parent = activeItem.parentElement; // This is the UL
        while (parent) {
            // If we hit a List Item (Chapter), mark it
            if (parent.tagName === 'LI') {
                parent.classList.add('active-parent');
            }
            // Stop if we reach the root menu
            if (parent.classList.contains('menu')) break;
            
            parent = parent.parentElement;
        }
    }
})();
document.addEventListener("keydown", function(e) {
  // ALLOW ESCAPE EVERYWHERE
  if (e.key === "Escape") {
      closeAllModals();
      return;
  }

  // IGNORE INPUTS
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.isContentEditable) return;
  if (e.altKey || e.ctrlKey || e.metaKey) return;

  // HANDLE "GO MODE"
  if (window.goElems.length > 0) {
    if (e.key === "Escape" || e.key === "f") {
        clearGoElems();
    } else {
        window.hintInput += e.key.toLowerCase();
        followGoElems();
    }
    return; 
  }

  // KEYMAPS
  switch (e.key) {
    // --- UTILITIES ---
    case '?': toggleHelp(); break;
    case '/': e.preventDefault(); focusSearch(); break;
    case 'f': addGoElems(); break;
    
    // --- TOGGLES ---
    case 't': // Toggle Theme
      let themeBtn = document.getElementById("theme-toggle");
      if (themeBtn) themeBtn.click();
      break;
    case 'c': // Toggle Sidebar Collapse (MISSING IN YOUR CODE)
      toggleSidebarCollapse();
      break;
    case '[': // Toggle Left Sidebar
      let menuIcon = document.querySelector(".menu-icon");
      if (menuIcon) menuIcon.click();
      break;
    case ']': // Toggle Right Sidebar
      let tocIcon = document.querySelector(".toc-icon");
      if (tocIcon) tocIcon.click();
      break;
    case '\\': // Toggle Head Bar
      toggleHeader();
      break;

    // --- NAVIGATION ---
    case 'r': window.location.reload(); break;
    case 'H': history.back(); break;
    case 'L': history.forward(); break;
    
    case 'h': saveJump(); navigateMap(-1); break;
    case 'l': saveJump(); navigateMap(1); break;
    case 'u': saveJump(); navigateParent(); break;
    case 'd': saveJump(); navigateNextChapter(); break;

    // --- SCROLLING ---
    case 'j': scrollPage(100); break;
    case 'k': scrollPage(-100); break;
    case 'J': scrollTOC(100); break;
    case 'K': scrollTOC(-100); break;
    case 'g': saveJump(); scrollToPosition(0); break;
    case 'G': saveJump(); scrollToPosition(999999); break;
    case 'v': toggleTOCCollapse(); break;
    case 's': window.dispatchEvent(new Event('toggle-scroll-spy')); break;
    case 'o': jumpBack(); break;

    case 'i': toggleMatrix(); break;
    case 'F': toggleFullScreen(); break;
    case 'a': toggleAquarium(); break;
  }
});

/* ============================
   FUNCTIONS
   ============================ */

function toggleSidebarCollapse() {
    let body = document.body;
    if (body.classList.contains('collapse-mode')) {
        body.classList.remove('collapse-mode');
        localStorage.setItem("collapse-sidebar", "false");
    } else {
        body.classList.add('collapse-mode');
        localStorage.setItem("collapse-sidebar", "true");
    }
}

function toggleHeader() {
  let header = document.querySelector(".page__header");
  let body = document.body;
  
  if (header) {
    if (header.style.display === 'none') {
      header.style.removeProperty('display');
      body.classList.remove('header-hidden');
    } else {
      header.style.setProperty('display', 'none', 'important');
      body.classList.add('header-hidden');
    }
  }
}

function toggleHelp() {
  let help = document.getElementById("help-window");
  if (help) {
    help.style.display = (help.style.display === 'none') ? 'flex' : 'none';
  }
}

function closeAllModals() {
  let help = document.getElementById("help-window");
  if (help) help.style.display = 'none';

  clearGoElems();

  if (document.activeElement) document.activeElement.blur();

  let searchContainer = document.querySelector(".search-container");
  if (searchContainer && searchContainer.classList.contains("search-container--is-visible")) {
      let searchIcon = document.querySelector(".search-icon");
      if (searchIcon) searchIcon.click();
  }
  let matrix = document.getElementById("cmatrix-canvas");
  if (matrix) toggleMatrix();
  let fish = document.getElementById("aquarium-canvas");
  if (fish) toggleAquarium();
}

function focusSearch() {
  let searchInput = document.getElementById("search");
  let searchContainer = document.querySelector(".search-container");
  let searchIcon = document.querySelector(".search-icon"); 

  if (searchContainer && !searchContainer.classList.contains("search-container--is-visible")) {
      if (searchIcon) searchIcon.click();
  } else if (searchInput) {
      searchInput.focus();
      searchInput.select();
  }
}

function scrollPage(amount) {
    window.scrollBy({ top: amount, behavior: 'smooth' });
    let containers = ['.page', '.book-content', 'html', 'body'];
    for (let selector of containers) {
        let el = document.querySelector(selector);
        if (el && el.scrollHeight > el.clientHeight) {
            el.scrollBy({ top: amount, behavior: 'smooth' });
        }
    }
}

function scrollToPosition(y) {
    window.scrollTo({ top: y, behavior: 'smooth' });
    let containers = ['.page', '.book-content', 'html', 'body'];
    for (let selector of containers) {
        let el = document.querySelector(selector);
        if (el) el.scrollTo({ top: y, behavior: 'smooth' });
    }
}

/* ============================
   NAVIGATION LOGIC
   ============================ */

function getMenuLinks() {
    return Array.from(document.querySelectorAll('.menu nav ul li a'))
        .filter(a => !a.getAttribute('href').startsWith('#'));
}

function normalizeUrl(url) {
    return url.replace(/\/$/, "");
}

function navigateMap(direction) {
    let links = getMenuLinks();
    let currentUrl = normalizeUrl(window.location.href);
    let index = links.findIndex(a => normalizeUrl(a.href) === currentUrl);
    
    if (index !== -1) {
        let targetIndex = index + direction;
        let target = links[targetIndex];

        // --- FIX FOR 'h' (Previous) ---
        if (direction === -1 && target) {
            let currentLink = links[index];
            let parentUl = currentLink.closest('ul');
            if (parentUl && parentUl.parentElement.tagName === 'LI') {
                let parentLink = parentUl.parentElement.querySelector('a');
                if (target === parentLink) {
                    targetIndex--; 
                    target = links[targetIndex];
                }
            }
        }
        if (target) target.click();
    }
}

function navigateParent() {
    let activeLink = document.querySelector('.menu li.active > a');
    if (!activeLink) return;
    let parentUl = activeLink.closest('ul'); 
    if (parentUl && parentUl.parentElement.tagName === 'LI') {
        let parentLink = parentUl.parentElement.querySelector('a');
        if (parentLink) parentLink.click();
    }
}

function navigateNextChapter() {
    let activeItem = document.querySelector('.menu li.active');
    if (!activeItem) return;
    let topLevelLi = activeItem;
    while (topLevelLi && topLevelLi.parentElement.closest('ul') && topLevelLi.parentElement.closest('ul').parentElement.tagName === 'LI') {
         topLevelLi = topLevelLi.parentElement.closest('ul').parentElement;
    }
    if (topLevelLi && topLevelLi.nextElementSibling) {
        let nextChapterLink = topLevelLi.nextElementSibling.querySelector('a');
        if (nextChapterLink) nextChapterLink.click();
    }
}

/* ============================
   LINK HINT LOGIC
   ============================ */
/* ============================
   MULTI-CHAR LINK HINT LOGIC (Fixed)
   ============================ */

function addGoElems() {
  const goElems = window.goElems;
  if (goElems.length > 0) return;
  window.hintInput = "";

  // 1. Identify valid links
  let links = document.querySelectorAll("a, button");
  let validLinks = [];
  links.forEach((elem) => {
    const rect = elem.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0 || rect.top < 0 || rect.top > window.innerHeight) return;
    validLinks.push({ elem: elem, rect: rect });
  });

  // 2. Determine required label length (Depth)
  // This prevents "a" vs "aa" conflicts by making ALL labels the same length
  // e.g. If you have 30 links, everyone gets 2 letters (aa, ab... ba...)
  const chars = "abcdeghijklmnopqrstuvwxyz"; // 'f' excluded? Add it back if you want.
  const total = validLinks.length;
  let depth = 1;
  
  // Increase depth until we can fit all links (25^1 = 25, 25^2 = 625)
  while (Math.pow(chars.length, depth) < total) {
      depth++;
  }

  validLinks.forEach((item, index) => {
    let labelText = "";
    let n = index;
    
    // Generate fixed-length label (Base-25 conversion)
    for (let i = 0; i < depth; i++) {
        let remainder = n % chars.length;
        labelText = chars[remainder] + labelText;
        n = Math.floor(n / chars.length);
    }

    // Create visual label
    const label = document.createElement("div");
    label.innerText = labelText;
    label.className = "goelems"; 
    label.style.position = "fixed";
    label.style.top = item.rect.top + "px";
    label.style.left = item.rect.left + "px";
    label.style.zIndex = "10000";
    label.style.background = "gold";
    label.style.color = "black";
    label.style.border = "1px solid black";
    label.style.padding = "2px 5px";
    label.style.fontWeight = "bold";
    label.style.borderRadius = "3px";
    label.style.fontSize = "12px";
    label.style.lineHeight = "1";
    label.style.textTransform = "lowercase";

    document.body.appendChild(label);
    goElems.push({ elem: item.elem, label: label, key: labelText });
  });
}
function followGoElems() {
  const input = window.hintInput;
  
  // Find matches starting with what you typed
  let matches = window.goElems.filter(item => item.key.startsWith(input));
  
  // 1. No matches? Reset.
  if (matches.length === 0) {
      clearGoElems();
      return;
  }

  // 2. Exact Match? Execute.
  if (matches.length === 1 && matches[0].key === input) {
      saveJump();
      matches[0].elem.click();
      // if (matches[0].elem.tagName === 'A') window.location.href = matches[0].elem.href;
      clearGoElems();
      return;
  }

  // 3. Partial Matches? Filter visual labels
  // Hide labels that don't match what you typed so far
  window.goElems.forEach(item => {
      if (!item.key.startsWith(input)) {
          item.label.style.display = 'none';
      }
  });
}

function clearGoElems() {
  window.goElems.forEach(item => item.label.remove());
  window.goElems = [];
  window.hintInput = ""; // Reset buffer
}
function scrollTOC(amount) {
    let toc = document.querySelector('.toc-sidebar');
    if (toc) {
        toc.scrollBy({ top: amount, behavior: 'smooth' });
    }
}
function toggleTOCCollapse() {
    let html = document.documentElement;
    if (html.classList.contains('toc-collapse-mode')) {
        html.classList.remove('toc-collapse-mode');
        localStorage.setItem("toc-collapse", "false");
    } else {
        html.classList.add('toc-collapse-mode');
        localStorage.setItem("toc-collapse", "true");
    }
}
/* ============================
   JUMP LIST LOGIC
   ============================ */

// Helper: Find which element is actually scrolled
function getScrollTop() {
    // 1. Try Window
    if (window.scrollY > 0) return window.scrollY;
    
    // 2. Try Containers
    let containers = ['.page', '.book-content', 'html', 'body'];
    for (let selector of containers) {
        let el = document.querySelector(selector);
        if (el && el.scrollTop > 0) return el.scrollTop;
    }
    
    // 3. Default to 0
    return 0;
}

function saveJump() {
    // Limit stack size
    if (window.jumpStack.length > 20) window.jumpStack.shift();
    
    // Save the REAL scroll position (from window or container)
    let currentPos = getScrollTop();
    window.jumpStack.push(currentPos);
    
    console.log("Saved Jump Position:", currentPos);
}

function jumpBack() {
    // 1. Try Local Jump
    if (window.jumpStack.length > 0) {
        let y = window.jumpStack.pop();
        console.log("Jumping back to:", y);
        
        // Use the helper that knows how to scroll containers
        scrollToPosition(y); 
    } 
    // 2. Fallback to History
    else {
        console.log("Jump stack empty, going back in history.");
        history.back();
    }
}
function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}
