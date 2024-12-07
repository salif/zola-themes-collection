#!/usr/bin/env -S just --justfile

set unstable

demo_base_url := "https://salif.github.io/zola-themes-collection/demo/"
local_base_url := "http://127.0.0.1:1111/demo/"

just := just_executable() + " --justfile '" + justfile() + "'"
rm := "rm"
git := "git"
zola := "zola"
browser := "brave"

_:
	command {{ just }} --list --unsorted

[private, script('zx')]
themes-js cmd *args:
	$.verbose = true
	const allThemes = await glob("themes/*", { onlyDirectories: true })
	const basePath = process.cwd()
	const cmd = "{{ cmd }}"
	const args = {{ args }};
	const localBaseURL = "{{ local_base_url }}"
	switch (cmd) {
		case "build-check-all":
			await buildThemes(allThemes, false, localBaseURL)
			break
		case "build-demo-all":
			await buildThemes(allThemes, true, args[0])
			break
		case "build-check":
			await buildThemes([args[0]], false, localBaseURL)
			break
		case "build-demo":
			await buildThemes([args[0]], true, args[1])
			break
		default:
			console.error(`Unknown cmd: ${cmd}`)
			break
	}
	async function buildThemes(themes, doInstall, baseURL) {
		for (const theme of themes) {
			const themePath = path.join(basePath, theme)
			const themeName = path.basename(themePath)
			await cd(themePath)
			await buildTheme(themeName, baseURL)
			if (doInstall) await installDemo(themePath, themeName,
				path.join(basePath, "static", "demo", themeName))
			await remPublic()
		}
	}
	async function buildTheme(themeName, baseURL) {
		if (!(await fs.pathExists("theme.toml"))) {
			console.warn("Warning: theme.toml not found!")
		}
		if (await fs.pathExists("themes")) {
			console.warn("Warning: themes found!")
		}
		if (!(await fs.pathExists("config.toml"))) {
			console.error("Error: config.toml not found!")
			return
		}
		await remPublic()
		const demoBaseURL = new URL(themeName + "/", baseURL).href
		await $`{{ zola }} build -u ${demoBaseURL} -o ZTC_PUBLIC`
	}
	async function installDemo(themePath, themeName, demoPath) {
		if (await fs.pathExists(demoPath)) {
			await fs.remove(demoPath)
		}
		await fs.rename(path.join(themePath, "ZTC_PUBLIC"), demoPath)
	}
	async function remPublic() {
		if (await fs.pathExists("ZTC_PUBLIC")) {
			await fs.remove("ZTC_PUBLIC")
		}
	}

[group('build')]
build-check-all: (themes-js "build-check-all" "[]")

[group('build')]
build-check path: (themes-js "build-check" "['"+path+"']")

[group('build')]
build-demo-all base_url=demo_base_url: (themes-js "build-demo-all" "['"+base_url+"']")

[group('build')]
build-demo path base_url=demo_base_url: (themes-js "build-demo" "['"+path+"','"+base_url+"']")

[group('build'), script('zx')]
remove-demo-all:
	const demos = await glob("static/demo/*", { onlyDirectories: true })
	for (const demo of demos) {
		fs.remove(demo)
	}

[group('screenshot')]
screenshot-all mode="dark" url=local_base_url:
	find static/demo -mindepth 1 -maxdepth 1 -type d -printf "%f\n" | xargs -I {} \
		{{ just }} screenshot '{}' '{{ mode }}' '{{ url }}'

[group('screenshot')]
screenshot name mode="dark" url=local_base_url:
	{{ browser }} --headless --disable-gpu --screenshot="static/screenshots/temp.png" \
		--window-size=1400,936 --hide-scrollbars "{{ url }}{{ name }}"
	magick static/screenshots/temp.png -gravity north -crop '1360x765+0+0' "static/screenshots/{{ mode }}-{{ name }}.png"
	{{ rm }} -f static/screenshots/temp.png
	mat2 --inplace "static/screenshots/{{ mode }}-{{ name }}.png"

[group('screenshot')]
[script('zx')]
screenshots-missing:
	const demos = await glob("static/demo/*", { onlyDirectories: true })
	const output = []
	for (const demo of demos) {
		const themeName = path.basename(demo)
		if (!(await fs.pathExists(path.join("static", "screenshots", `light-${themeName}.png`)))) {
			output.push(`  light for ${themeName}`)
		}
		if (!(await fs.pathExists(path.join("static", "screenshots", `dark-${themeName}.png`)))) {
			output.push(`  dark for ${themeName}`)
		}
	}
	if (output.length > 0) {
		console.error("missing screenshots:")
		console.error(output.join("\n"))
	}

[private]
local-test-all:
	command {{ just }} build-demo-all '{{ local_base_url }}' data-update '{{ local_base_url }}'
	command {{ zola }} serve --open

[group('build')]
data-update url=demo_base_url:
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
	const sep = new Map([["project-portfolio", "https://github.com/awinterstein/zola-theme-project-portfolio"]]);
	const data = [];
	Object.values(parsed).forEach( theme => {
		let themeName = theme.path;
		if (themeName.startsWith("themes/"))
			themeName = themeName.substring(7);
		else
			return;
		if (sep.has(themeName)) {
			theme.url = sep.get(themeName);
		}
		let themeLink = theme.url;
		if (themeLink.endsWith(".git"))
			themeLink = themeLink.substring(0, themeLink.length - 4);
		data.push(
			'[[project]]\nname = "' + themeName + '"\ndesc = "<picture>' +
			"<source srcset='./screenshots/light-" + themeName + ".png' media='(prefers-color-scheme: light)'/>" +
			"<source srcset='./screenshots/dark-" + themeName + ".png' media='(prefers-color-scheme: dark)'/>" +
			"<img src='./screenshots/light-" + themeName + ".png' alt='Screenshot of the " + themeName + " theme'/>" +
			"</picture><menu class='mt-1'><a href='" + new URL(themeName, '{{ url }}').href + "' rel='noopener' target='_blank' class='underline'>Live Demo</a>&nbsp;&nbsp;" +
			"<a href='" + themeLink + "' rel='noopener' target='_blank' class='underline'>Repository</a>&nbsp;&nbsp;" +
			"<details style='display: inline-block;'><summary class='select-none cursor-pointer underline' style='text-underline-offset: 2px; list-style-type: none;'>Install</summary>" +
			'<code>git submodule add ' + theme.url + ' ' + theme.path + '</code></details></menu>' +
			'"\ntags = []\nlinks = []\n');
		});
	fs.writeFileSync('content/home/data.toml', data.join("\n"));

[group('help')]
submodule-remove path:
	test -d '{{ path }}'
	command {{ git }} submodule deinit -f '{{ path }}'
	command {{ rm }} -rf '.git/modules/{{ path }}'
	command {{ git }} rm -f '{{ path }}'

[group('help')]
submodule-add url name: && (build-check "themes/"+name)
	! test -d 'themes/{{ name }}'
	command {{ git }} submodule add -- '{{ url }}' 'themes/{{ name }}'

[group('help')]
submodule-update-all:
	command {{ git }} submodule update --remote --merge

[group('push'), script('zx')]
fix-docs-dir:
	const demos = await glob("docs/static/demo/*", { onlyDirectories: true })
	for (const demo of demos) {
		const robotsTxtPath = path.join(demo, "robots.txt")
		if (await fs.pathExists(robotsTxtPath))
			fs.remove(robotsTxtPath)
	}
	const gitignorePath = path.join("docs", "screenshots", ".gitignore")
	if (await fs.pathExists(gitignorePath))
		await fs.remove(gitignorePath)

[group('push'), confirm]
gh-pages:
	command {{ git }} diff --cached --quiet
	command {{ git }} switch gh-pages
	command {{ git }} merge main -X theirs --no-ff --no-commit
	command {{ just }} build-demo-all '{{ demo_base_url }}' \
		screenshots-missing data-update '{{ demo_base_url }}'
	command {{ rm }} -rf docs
	command {{ zola }} build -o docs
	command {{ just }} fix-docs-dir
	command {{ git }} add docs
	command {{ git }} merge --continue
	command {{ git }} push
	command {{ rm }} -rf docs
	command {{ git }} switch -
