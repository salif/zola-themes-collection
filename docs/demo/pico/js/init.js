document.addEventListener("DOMContentLoaded", function(event){
    setStartTheme();
    enableCopy();
    if (document.head.dataset['buildSearchIndex'] == "true") {
      initSearch();
    }

  });