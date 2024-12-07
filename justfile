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

[private, script('./node_modules/.bin/zx')]
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

[group('build'), script('./node_modules/.bin/zx')]
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
[script('./node_modules/.bin/zx')]
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
	command {{ just }} build-demo-all '{{ local_base_url }}' update-data '{{ local_base_url }}'
	command {{ zola }} serve --open

[group('build')]
update-data url=demo_base_url:
	#!/usr/bin/env node
	"use strict";
	const fs = require('fs');
	const path = require('path');
	const TOML = require(process.cwd() + '/node_modules/@iarna/toml');
	const baseURL = "{{ url }}";
	const sep = new Map([
		["project-portfolio", "https://github.com/awinterstein/zola-theme-project-portfolio.git"]
		]);
	function main() {
		const gitmodulesContent = fs.readFileSync('.gitmodules', 'utf8');
		const parsed = parseGitmodules(gitmodulesContent);
		const data = [];
		for (const theme of Object.values(parsed)) {
			const themeInfo = readThemeInfo(theme);
			if (null != themeInfo) data.push(themeInfo);
			else console.error(theme);
		}
		fs.writeFileSync('content/home/data.toml', TOML.stringify({ project: data }));
	}
	main();
	function parseGitmodules(content) {
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
	function onlyIf(v, ifFalse, ifTrue) {
		if (undefined == v || v.length == 0) return ifFalse;
		else return ifTrue;
	}
	function readThemeInfo(theme) {
		if (!theme.path.startsWith("themes/")) return;
		const themeName = theme.path.substring(7);
		let themeTomlPath = path.join(theme.path, "theme.toml");
		const themeInfo = {};
		if (sep.has(themeName)) {
			themeInfo.clone = sep.get(themeName);
			themeTomlPath = path.join(theme.path, "themes", themeName, "theme.toml");
		} else {
			themeInfo.clone = theme.url;
		}
		themeInfo.repo = themeInfo.clone.endsWith(".git") ?
			themeInfo.clone.substring(0, themeInfo.clone.length - 4) :
			themeInfo.clone;
		let themeToml = {};
		if (fs.existsSync(themeTomlPath)) {
			try {
				themeToml = TOML.parse(fs.readFileSync(themeTomlPath, "utf8"));
			} catch (err) {
				console.error(err);
			}
		} else {
			console.warn(themeTomlPath);
		}
		themeInfo.name = onlyIf(themeToml.name, themeName, themeToml.name);
		themeInfo.description = onlyIf(themeToml.description, "",  themeToml.description);
		themeInfo.tags = (undefined == themeToml.tags || !Array.isArray(themeToml.tags)) ? [] : themeToml.tags;
		themeInfo.license = themeToml.license;
		themeInfo.homepage = onlyIf(themeToml.homepage, themeToml.repo, themeToml.homepage);
		themeInfo.demo = themeToml.demo;
		themeInfo.minVersion = themeToml.min_version;
		themeInfo.authorName = themeToml.author?.name;
		themeInfo.authorHomepage = themeToml.author?.homepage;
		themeInfo.originalRepo = themeToml.original?.repo;
		const newDetails = (name, content) => `<details style='display: inline-block;'><summary class='not-prose' ` +
	`style='list-style-type: none; display: none;' id='${name}-${themeName}'></summary>
	${content}
	</details>`;
		const newJS = (name) => "const b=document.getElementById('" + name + "').parentElement;" +
				"if(!b.hasAttribute('open')) b.setAttribute('open', true); this.style.display='none'";
		const themeDetails = newDetails("info", `
	### Info` + onlyIf(themeInfo.authorHomepage, onlyIf(themeInfo.authorName, "", `
	- **Author**: ${themeInfo.authorName}`), `
	- **Author**: [${themeInfo.authorName}](${themeInfo.authorHomepage})`) + `
	- **License**: ${themeInfo.license}
	- **Homepage**: <${themeInfo.homepage}>` + onlyIf(themeInfo.demo, "", `
	- **Off. Live Demo**: <${themeInfo.demo}>`) + onlyIf(themeInfo.minVersion, "", `
	- **Min version**: ${themeInfo.minVersion}`) + onlyIf(themeInfo.originalRepo, "", `
	- **Original**: <${themeInfo.originalRepo}>
	`)) + newDetails("install", `
	### Installation instructions
	\`git submodule add ${themeInfo.clone} themes/${themeName}\``);
		return {
			theme: themeName,
			name: themeInfo.name,
			desc: themeInfo.description,
			tags: themeInfo.tags,
			details: themeDetails,
			links: [
				{ name: "Live Demo", url: new URL(themeName + "/", baseURL).href },
				{ name: "Repository", url: themeInfo.repo },
				{ name: "Info", url: "#info-" + themeName, js: newJS("info-" + themeName) },
				{ name: "Install", url: "#install-" + themeName, js: newJS("install-" + themeName) },
			],
		};
	}

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

[group('push'), script('./node_modules/.bin/zx')]
fix-docs-dir:
	const demos = await glob("docs/demo/*", { onlyDirectories: true })
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
		screenshots-missing update-data '{{ demo_base_url }}'
	command {{ rm }} -rf docs
	command {{ zola }} build -o docs
	command {{ just }} fix-docs-dir
	command {{ git }} add docs
	command {{ git }} merge --continue
	command {{ git }} push
	command {{ git }} switch -
