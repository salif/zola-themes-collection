#!/usr/bin/env -S just --justfile

just := just_executable() + " --justfile '" + justfile() + "'"
rm := "rm"
git := "git"
zola := "zola"
browser := "brave"
themes_list := "find themes -mindepth 1 -maxdepth 1 -type d"
show_err := "(pwd | lolcat)"
demo_url := "https://salif.github.io/zola-themes-collection/demo"
screenshot_url := "http://127.0.0.1:1111/demo"

_:
	@{{ just }} --list --unsorted

[group('build')]
theme-check-all: && theme-remove-public-all
	{{ themes_list }} | xargs -I {} sh -c "\
		printf 'Building {}\n'; cd {}; \
		if ! test -f config.toml; then {{ show_err }}; exit 1; fi; \
		if test -d ZTC_PUBLIC; then {{ rm }} -rf ZTC_PUBLIC; fi; \
		{{ zola }} build -o ZTC_PUBLIC || {{ show_err }};"

[group('build')]
theme-remove-public-all:
	{{ themes_list }} | xargs -I {} \
		sh -c "{{ rm }} -rf '{}/ZTC_PUBLIC'"

[group('build')]
demo-remove-all:
	{{ rm }} -rf static/demo/*
	touch static/demo/.gitkeep

[group('build')]
demo-build-all url=demo_url:
	{{ themes_list }} | xargs -I {} \
		{{ just }} demo-build '{}' '{{ url }}'

[group('build')]
demo-build path url=demo_url:
	#!/usr/bin/env bash
	set -euo pipefail
	ZTC_DEMO_NAME="$(basename '{{ path }}')"
	ZTC_DEMO="../../static/demo/${ZTC_DEMO_NAME}" 
	printf 'Building %s\n' "${ZTC_DEMO_NAME} and ${ZTC_DEMO}"
	cd '{{ path }}'
	if ! test -f config.toml; then {{ show_err }}; exit 1; fi
	if test -d ZTC_PUBLIC; then {{ rm }} -rf ZTC_PUBLIC; fi
	if test -d "${ZTC_DEMO}"; then {{ rm }} -rf "${ZTC_DEMO}"; fi 
	if {{ zola }} build -u "{{ url }}/${ZTC_DEMO_NAME}/" -o ZTC_PUBLIC
	then mv ZTC_PUBLIC "${ZTC_DEMO}"; fi
	{{ rm }} -rf ZTC_PUBLIC

[group('build')]
screenshot-all mode="dark" url=screenshot_url:
	{{ themes_list }} | xargs -I {} \
		{{ just }} screenshot '{}' '{{ mode }}' '{{ url }}'

[group('build')]
screenshot path mode="dark" url=screenshot_url:
	#!/usr/bin/env bash
	set -euo pipefail
	ZTC_NAME=$(basename '{{ path }}')
	{{ browser }} --headless --disable-gpu --screenshot="static/screenshots/temp.png" \
		--window-size=1400,936 --hide-scrollbars "{{ url }}/${ZTC_NAME}"
	magick static/screenshots/temp.png -gravity north -crop '1360x765+0+0' "static/screenshots/{{ mode }}-${ZTC_NAME}.png"
	{{ rm }} -f static/screenshots/temp.png
	mat2 --inplace "static/screenshots/{{ mode }}-${ZTC_NAME}.png"

[group('content')]
data-update url=demo_url:
	#!/usr/bin/env node
	"use strict";
	const fs = require('fs');
	const parseGitmodules = (content) => {
		const lines = content.split('\n');
		const result = {};
		let currentSubmodule = null;
		lines.forEach(line => {
			line = line.trim();
			if (line.startsWith('[submodule')) {
				// Extract submodule name
				currentSubmodule = line.match(/"(.*)"/)[1];
				result[currentSubmodule] = {};
			} else if (currentSubmodule && line.includes('=')) {
				// Parse key-value pairs
				const [key, value] = line.split('=').map(part => part.trim());
				result[currentSubmodule][key] = value;
			}
		});
		return result;
	};
	const gitmodulesContent = fs.readFileSync('.gitmodules', 'utf8');
	const parsed = parseGitmodules(gitmodulesContent);
	const data = [];
	Object.values(parsed).forEach( theme => {
		let themeName = theme.path;
		let themeLink = theme.url;
		if (themeName.startsWith("themes/"))
			themeName = themeName.substring(7);
		else
			return;
		if (themeLink.endsWith(".git"))
			themeLink = themeLink.substring(0, themeLink.length - 4);
		data.push(
			'[[project]]\nname = "' + themeName + '"\ndesc = "<picture>' +
			"<source srcset='./screenshots/light-" + themeName + ".png' media='(prefers-color-scheme: light)'/>" +
			"<source srcset='./screenshots/dark-" + themeName + ".png' media='(prefers-color-scheme: dark)'/>" +
			"<img src='./screenshots/light-" + themeName + ".png' alt='Screenshot of the " + themeName + " theme'/>" +
			"</picture><menu class='mt-1'><a href='{{ url }}/" + themeName + "' rel='noopener' target='_blank' class='underline'>Live Demo</a>&nbsp;&nbsp;" +
			"<a href='" + themeLink + "' rel='noopener' target='_blank' class='underline'>Repository</a>&nbsp;&nbsp;" +
			"<details style='display: inline-block;'><summary class='select-none cursor-pointer underline' style='text-underline-offset: 2px; list-style-type: none;'>Download</summary>" +
			'<code>git submodule add ' + theme.url + ' ' + theme.path + '</code></details></menu>' +
			'"\ntags = []\nlinks = []\n');
		});
	fs.writeFileSync('content/home/data.toml', data.join("\n"));

[group('help')]
submodule-remove name:
	{{ git }} submodule deinit -f 'themes/{{ name }}'
	{{ rm }} -rf '.git/modules/themes/{{ name }}'
	{{ git }} rm -f 'themes/{{ name }}'

[group('help')]
submodule-add url name:
	{{ git }} submodule add -- '{{ url }}' 'themes/{{ name }}'

[group('help')]
submodule-update-all:
	{{ git }} submodule update --remote --merge

[group('push')]
fix-docs-dir:
	find docs/demo -mindepth 1 -maxdepth 1 -type d | xargs -I {} \
		sh -c "if test -f '{}/robots.txt'; then {{ rm }} -f '{}/robots.txt'; fi;"
	{{ rm }} -f docs/screenshots/.gitignore
	printf '' > docs/.nojekyll

[group('push'), confirm]
gh-pages:
	{{ git }} diff --cached --quiet
	{{ git }} switch gh-pages
	{{ git }} merge main -X theirs --no-ff --no-commit
	{{ just }} demo-build-all
	{{ just }} data-update
	{{ rm }} -rf docs
	{{ zola }} build -o docs
	{{ just }} fix-docs-dir
	{{ git }} add ./docs
	{{ git }} merge --continue
	{{ git }} push
	{{ rm }} -rf docs
	{{ git }} switch -
