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
  }
}

// Sets up correct link to journal items
function setJournal() {
  function dateToString(d) {
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,"0") +
    '-' + String(d.getDate()).padStart(2, '0');
  };

  const date = new Date();
  document.getElementById('olivine-today').setAttribute('href', olivine.base_url
    + '/journal/' + dateToString(date) + '/');
  date.setTime(date.getTime() - 24*60*60*1000);
  document.getElementById('olivine-yesterday').setAttribute('href',
    olivine.base_url + '/journal/' + dateToString(date) + '/');
  document.getElementById('olivine-calendar').setAttribute('href',
    olivine.base_url + '/journal/');
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
      text = text.split('\n')[0];
      var map = JSON.parse(text);
      var li = '';
      for (path of array) {
        path = path.split('#')[0];
        if (!path.endsWith('/')) path = path + '/';
        if (map[path]) li += '<li><a href="' + path + '">' + map[path] + '</a></li>\n';
      }
      document.getElementById(id).innerHTML = li;
    });
}

// Expand extra elements in directory
function directoryExpand() {
  document.getElementById('olivine-directory').classList.remove('hidden');
  document.getElementById('olivine-directory-expand').remove();
}

