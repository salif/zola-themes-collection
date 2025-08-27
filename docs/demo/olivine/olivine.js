// Mathjax configuration
var MathJax = {
  tex: {
    inlineMath: [['$', '$'], ['\\(', '\\)']],
  },
};

// Toggles sidebar state and saves it to session storage
function toggleBar(bar) {
  var list = document.body.classList;
  if (list.contains(bar)) {
    list.remove(bar);
    sessionStorage.setItem(bar, "false");
  } else {
    list.add(bar);
    sessionStorage.setItem(bar, "true");
  }
};

// Loads sidebar information from session storage
function setSidebar() {
  if (window.matchMedia("screen and (min-width: 70rem)").matches) {
    if (sessionStorage.getItem("leftbar") === null)
      sessionStorage.setItem("leftbar", "true");
  }
  if (window.matchMedia("screen and (min-width: 90rem)").matches) {
    if (sessionStorage.getItem("rightbar") === null)
      sessionStorage.setItem("rightbar", "true");
  }
  for (bartype of ["leftbar", "rightbar"]) {
    var sidebar = sessionStorage.getItem(bartype);
    if (sidebar === "true")
      document.body.classList.add(bartype);
    else
      document.body.classList.remove(bartype);
  }
}

// Sets up correct link to journal items
function setJournal() {
  function dateToString(d) {
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') +
    '-' + String(d.getDate()).padStart(2, '0');
  };
  const date = new Date();
  document.getElementById('olivine-today').setAttribute('href',
    `${olivine.base_url}/journal/${dateToString(date)}/`);
  date.setTime(date.getTime() - 24*60*60*1000);
  document.getElementById('olivine-yesterday').setAttribute('href',
    `${olivine.base_url}/journal/${dateToString(date)}/`);
}

// Sets up theme
function setTheme() {
  var theme = window.sessionStorage.getItem('theme');
  if (theme == undefined) {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches)
      theme = 'light';
    else
      theme = 'dark';
  }
  document.documentElement.setAttribute('data-theme', theme);
}
setTheme();

// Toggle theme
function toggleTheme() {
  var theme = document.documentElement.getAttribute('data-theme');
  var themeList = ['light', 'dark'];
  var index = themeList.findIndex((_) => {return _ == theme;});
  theme = themeList[(index + 1) % themeList.length];
  document.documentElement.setAttribute('data-theme', theme);
  sessionStorage.setItem('theme', theme);
}

// Hydrate forward link
function hydrateForward(id, array, url) {
  fetch(url)
    .then((response) => {
      if (response.status >= 200 && response.status < 300) {
        return Promise.resolve(response)
      } else {
        return Promise.reject(new Error(response.statusText))
      }})
    .then((response) => {
      return response.text();
    })
    .then((text) => {
      text = text.split('<script src="/livereload.js')[0];
      const map = JSON.parse(text);
      array = array.map((path) => {
        path = path.split('#')[0];
        if (!path.endsWith('/')) path = path + '/';
        return path;
      });
      const no_dup = [];
      for (path of array) {
        if (!no_dup.includes(path)) no_dup.push(path);
      }
      const li = no_dup.map((path) => {
        if (!map[path]) return '';
        return `<li><a href="${path}">${map[path]}</a></li>\n`;
      }).join('');
      document.getElementById(id).innerHTML = li;
    });
}

// Expand extra elements in directory
function directoryExpand() {
  document.getElementById('olivine-directory').classList.remove('hidden');
  document.getElementById('olivine-directory-expand').remove();
}

// Hotkeys
document.addEventListener("keydown", function(e) {
  if (e.altKey || e.ctrlKey || e.metaKey) return;
  if (e.key === "Shift") return;
  if (window.goElems.length > 0) {
    followGoElems(e.key);
    return;
  }
  if (e.key === "Escape") {
    document.activeElement.blur();
    document.getElementById("search-results").innerHTML = "";
    document.getElementById("help-window").style.display = "none";
    return;
  }
  if (e.target.nodeName != "BODY") return;
  let scrollDist = 150;
  switch (e.key) {
    case 'k':
      scrollDist *= -1;
    case 'j':
      if (!e.repeat) window.scrollBy({top: scrollDist, behavior: "smooth"});
      else window.scrollBy({top: scrollDist/2, behavior: "instant"});
      break;
    case 'g':
      window.scrollTo({top: 0, behavior: "smooth"});
      break;
    case 'G':
      window.scrollTo({top: document.body.scrollHeight, behavior: "smooth"});
      break;
    case 'h':
      if (olivine.lower !== undefined)
        window.location.href = olivine.lower;
      break;
    case 'l':
      if (olivine.higher !== undefined)
        window.location.href = olivine.higher;
      break;
    case 'u':
      let newUrl = window.location.href;
      while (newUrl.endsWith('/')) newUrl = newUrl.slice(0, -1);
      newUrl = newUrl.split('/').slice(0, -1).join('/');
      if (!newUrl.startsWith(olivine.base_url)) break;
      window.location.href = newUrl;
      break;
    case 'U':
      window.location.href = olivine.base_url;
      break;
    case 'H':
      history.back();
      break;
    case 'L':
      history.forward();
      break;
    case 'r':
      window.location.reload();
      break;
    case '[':
      toggleBar("leftbar");
      break;
    case ']':
      toggleBar("rightbar");
      break;
    case '?':
      let helpElem = document.getElementById("help-window");
      helpElem.style.display = (helpElem.style.display === 'none') ? '' : 'none';
      break;
    case 'f':
      addGoElems();
      break;
    case 't':
      toggleTheme();
      break;
  }
});
document.addEventListener("keyup", function(e) {
  if (e.altKey || e.ctrlKey || e.metaKey) return;
  if (e.target.nodeName != "BODY") return;
  if (e.key == '/')
    document.getElementById("search-input").focus();
});

window.goElems = [];

// Create the Go elements
function addGoElems() {
  const goElems = window.goElems;
  if (goElems.length > 0) return;
  const keyStr = "qwertyasdghzxcvbuiop[]jkl;'nm,./`1234567890-=QWERTYASDFGHZXCVBUIOP{}JKL:\"NM<>?~!@#$%^&*()_+";
  for (elem of document.querySelectorAll("a")) {
    // Throw away if it is outside the window viewport
    const rect = elem.getBoundingClientRect();
    if (rect.top <= 0 || rect.left <= 0 || rect.bottom >= window.innerHeight ||
      rect.right >= window.innerWidth || rect.width == 0 || rect.height == 0)
      continue;
    // Create elements
    const label = document.createElement("span");
    const key = keyStr[goElems.length];
    label.innerText = key;
    label.classList.add("goelems");
    label.style = `top: ${rect.top}px; left: ${rect.left}px;`
    document.body.append(label);
    goElems.push({elem: elem, label: label, key: key});
    if (goElems.length >= keyStr.length) return;
  }
}

// Follow the link along Go elements
function followGoElems(key) {
  const goElems = window.goElems;
  if (goElems.length == 0) return;
  for (item of goElems) {
    if (item.key === key) {
      const elem = item.elem;
      clearGoElems();
      elem.click();
      return;
    }
  }
  clearGoElems();
}

// Remove all the Go elements
function clearGoElems() {
  const goElems = window.goElems;
  for (item of goElems) item.label.remove();
  goElems.length = 0;
}
