var searchElem = document.getElementById("search-input");
var posts;
function loadSearch() { 
	// call the index.json file from server by http get request
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function () {
		if (xhr.readyState === 4) {
			if (xhr.status === 200) {
				var data = JSON.parse(xhr.responseText);
				if (data) {
					posts = data.items; // load json data
				}
			} else {
				console.log(xhr.responseText);
			}
		}
	};
	xhr.open('GET', "index.json");
	xhr.send();
}
loadSearch(); // call loadsearch to load the json file
function showSearchResults() {
	var query = searchElem.value || ''; // get the value from input
	var searchString = query.replace(/[^\w\s]/gi, ''); // clear white spaces
	var target = document.getElementById('searchres');
	var postsByTitle = posts.reduce((acc, curr) => { // map lunr search index to your articles
		acc[curr.title] = curr;
		return acc;
	}, {}
	);
	// build lunr index file
	var index = lunr(function () {
		this.ref('title')
		this.field('content')
		posts.forEach(function (doc) {
			this.add(doc)
		}, this)
	});
	// search in lunr index
	if (searchString && searchString != '') {
		var matches = index.search(searchString);
		var matchPosts = [];
		matches.forEach((m) => {
			matchPosts.push(postsByTitle[m.ref]);
		});
		if (matchPosts.length > 0) {
			// match found with input text and lunr index
			target.innerHTML = matchPosts.map(function (p) {
				if (p != undefined) {
					return `<h3><a href="${p.url}"> ${p.title}</a></h3>
						${p.content}`;
				}
			}).join('');
		} else {
			// if no results found, then render a general message
			target.innerHTML = `<br><h2 style="text-align:center">No search results found</h2>`;
		};
	} else {
		target.innerHTML = ''
	}
};