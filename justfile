#!/usr/bin/env -S just --justfile

set unstable

demo_base_url := "https://salif.github.io/zola-themes-collection/demo/"
local_base_url := "http://127.0.0.1:1111/demo/"

just := just_executable() + " --justfile '" + justfile() + "'"
rm := "rm"
git := "git"
zola := "zola"
browser := "brave"
node_modules := justfile_directory() / "node_modules"
export PATH := "./node_modules/.bin:" + env_var('PATH')

_:
	command {{ just }} --list --unsorted

[group('build')]
build-check-all: (themes-js "build-check-all")

[group('build')]
build-check path: (themes-js "build-check" "'"+path+"'")

[group('build')]
build-demo-all base_url=demo_base_url: (themes-js "build-demo-all" "'"+base_url+"'")

[group('build')]
build-demo path base_url=demo_base_url: (themes-js "build-demo" "'"+path+"','"+base_url+"'")

[group('build')]
update-data url=demo_base_url: (themes-js "update-data" "'"+url+"'")

[group('build'), script('zx')]
remove-demo-all:
	/*
	#!/usr/bin/env node */
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
	magick static/screenshots/temp.png -gravity north -crop '1360x765+0+0' "static/screenshots/{{ mode }}-{{ name }}.webp"
	{{ rm }} -f static/screenshots/temp.png

[group('screenshot'), script('zx')]
screenshots-missing:
	/*
	#!/usr/bin/env node */
	const demos = await glob("static/demo/*", { onlyDirectories: true })
	const output = []
	for (const demo of demos) {
		const themeName = path.basename(demo)
		if (!(await fs.pathExists(path.join("static", "screenshots", `light-${themeName}.webp`)))) {
			output.push(`  light for ${themeName}`)
		}
		if (!(await fs.pathExists(path.join("static", "screenshots", `dark-${themeName}.webp`)))) {
			output.push(`  dark for ${themeName}`)
		}
	}
	if (output.length > 0) {
		console.error("missing screenshots:")
		console.error(output.join("\n"))
	}

[group('screenshot'), script('zx'), private]
screenshots-to-remove:
	/*
	#!/usr/bin/env node */
	const screenshots = await glob("static/screenshots/*")
	const output = []
	for (const screenshotPath of screenshots) {
		const screenshot = path.basename(screenshotPath)
		if (screenshot.startsWith("light-") && screenshot.endsWith(".webp")) {
			const demo = screenshot.substring(6, screenshot.length-5)
			if (!(await fs.pathExists(path.join("static", "demo", demo)))) {
				output.push(screenshot)
			}
		} else if (screenshot.startsWith("dark-") && screenshot.endsWith(".webp")) {
			const demo = screenshot.substring(5, screenshot.length-5)
			if (!(await fs.pathExists(path.join("static", "demo", demo)))) {
				output.push(screenshot)
			}
		} else {
			output.push(screenshot)
		}
	}
	if (output.length > 0) {
		console.error("screenshots to remove:")
		console.error(output.join("\n"))
	}

[private]
local-test-all:
	command {{ just }} build-demo-all '{{ local_base_url }}' update-data '{{ local_base_url }}'
	command {{ zola }} serve --open

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
	/*
	#!/usr/bin/env node */
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
	command {{ just }} remove-demo-all build-demo-all '{{ demo_base_url }}' \
		screenshots-missing update-data '{{ demo_base_url }}'
	command {{ rm }} -rf docs
	command {{ zola }} build -o docs
	command {{ just }} fix-docs-dir
	command {{ git }} add docs
	command {{ git }} merge --continue
	command {{ git }} push
	command {{ git }} switch -

[private, script('zx')]
themes-js cmd args='':
	/*
	#!/usr/bin/env node */
	"use strict"
	$.verbose = true
	process.env.CLICOLOR_FORCE='1'
	const basePath = process.cwd()
	const cmd = "{{ cmd }}"
	const args = [{{ args }}]
	const localBaseURL = "{{ local_base_url }}"
	const sepThemes = new Map([
		["linkita", "https://codeberg.org/salif/linkita.git"],
		["tabi", "https://github.com/welpo/tabi.git"],
		["project-portfolio", "https://github.com/awinterstein/zola-theme-project-portfolio.git"]
		])
	const errors = []
	switch (cmd) {
		case "build-check-all":
			await buildThemes(await listThemes(), false, localBaseURL)
			break
		case "build-demo-all":
			await buildThemes(await listThemes(), true, args[0])
			break
		case "build-check":
			await buildThemes([{ path: args[0] }], false, localBaseURL)
			break
		case "build-demo":
			await buildThemes([{ path: args[0] }], true, args[1])
			break
		case "update-data":
			await updateData(args[0], await listThemes())
			break
		case "list-themes":
			(await listThemes()).forEach(theme=>{console.log(theme.path)})
			break
		default:
			console.error(`Unknown cmd: ${cmd}`)
			break
	}
	async function buildThemes(themes, doInstall, baseURL) {
		for (const theme of themes) {
			const themePath = path.join(basePath, theme.path)
			const themeName = path.basename(themePath)
			await cd(themePath)
			await buildTheme(themeName, baseURL)
			if (doInstall) await installDemo(themePath, themeName,
				path.join(basePath, "static", "demo", themeName))
			await remPublic()
		}
		if (errors.length > 0) errors.forEach(err=>{console.error(err)})
	}
	async function buildTheme(themeName, baseURL) {
		if (!(await fs.pathExists("theme.toml")) && !(await fs.pathExists(path.join("themes", themeName, "theme.toml")))) {
			errors.push(`Warning: theme.toml not found! themes/${themeName}`)
		}
		if ((await fs.pathExists("theme.toml")) && (await fs.pathExists("themes"))) {
			errors.push(`Warning: themes dir found! themes/${themeName}`)
		}
		if (!(await fs.pathExists("config.toml"))) {
			errors.push(`Error: config.toml not found! themes/${themeName}`)
			return
		}
		await remPublic()
		const demoBaseURL = new URL(themeName + "/", baseURL).href
		await $`{{ zola }} ${['build', '-u', demoBaseURL, '-o', 'ZTC_PUBLIC']}`
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
	async function listThemes() {
		const content = await fs.readFile('.gitmodules', 'utf8');
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
		if (result["themes/linkita-theme"]) delete result["themes/linkita-theme"]
		return Object.values(result).filter(r=>r.path.startsWith("themes/"));
	}
	function updateData(baseURL, themes) {
		const TOML = require('{{ node_modules / "@iarna" / "toml" }}');
		const data = [];
		for (const theme of themes) {
			const themeInfo = readThemeInfo(theme, baseURL, TOML);
			if (null != themeInfo) data.push(themeInfo);
			else console.error(theme);
		}
		fs.writeFileSync('content/home/data.toml', TOML.stringify({ project: data }));
	}
	function onlyIf(v, ifFalse, ifTrue) {
		if (undefined == v || v.length == 0) return ifFalse;
		else return ifTrue;
	}
	function readThemeInfo(theme, baseURL, TOML) {
		if (!theme.path.startsWith("themes/")) return;
		const themeName = theme.path.substring(7);
		let themeTomlPath = path.join(theme.path, "theme.toml");
		const themeInfo = {};
		if (sepThemes.has(themeName)) {
			themeInfo.clone = sepThemes.get(themeName);
			themeTomlPath = path.join(theme.path, "themes", themeName, "theme.toml");
		} else {
			themeInfo.clone = theme.url;
		}
		themeInfo.repo = themeInfo.clone.endsWith(".git") ?
			themeInfo.clone.substring(0, themeInfo.clone.length - 4) :
			themeInfo.clone;
		let themeToml = {};
		if (fs.existsSync(themeTomlPath)) {
			themeToml = TOML.parse(fs.readFileSync(themeTomlPath, "utf8"));
		}
		themeInfo.name = onlyIf(themeToml.name, themeName, themeToml.name);
		themeInfo.description = onlyIf(themeToml.description, "",  themeToml.description);
		themeInfo.tags = (undefined == themeToml.tags || !Array.isArray(themeToml.tags)) ? [] : themeToml.tags;
		themeInfo.license = themeToml.license;
		themeInfo.homepage = onlyIf(themeToml.homepage, themeInfo.repo, themeToml.homepage);
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
		const themeDetails = newDetails("install", `
	### Installation
	0. Create a new Zola site: \`zola init\` and initialize a Git repository: \`git init\`
	1. Download the theme
	  - Option A. Add the theme as a git submodule:
	\`\`\`sh
	git submodule add ${themeInfo.clone} themes/${themeName}
	\`\`\`
	  - Option B. Clone the theme into your themes directory:
	\`\`\`sh
	git clone ${themeInfo.clone} themes/${themeName}
	\`\`\`
	2. Set theme in your \`config.toml\`
	\`\`\`toml
	theme = "${themeName}"
	\`\`\`
	`) + newDetails("info", `
	### Info` + onlyIf(themeInfo.authorHomepage, onlyIf(themeInfo.authorName, "", `
	- **Author**: ${themeInfo.authorName}`), `
	- **Author**: [${themeInfo.authorName}](${themeInfo.authorHomepage})`) + `
	- **License**: ${themeInfo.license}
	- **Homepage**: <${themeInfo.homepage}>` + onlyIf(themeInfo.demo, "", `
	- **Off. Live Demo**: <${themeInfo.demo}>`) + onlyIf(themeInfo.minVersion, "", `
	- **Min version**: ${themeInfo.minVersion}`) + onlyIf(themeInfo.originalRepo, "", `
	- **Original**: <${themeInfo.originalRepo}>`));
		return {
			theme: themeName,
			name: themeInfo.name,
			desc: themeInfo.description,
			tags: themeInfo.tags,
			details: themeDetails,
			links: [
				{ name: "Live Demo", url: new URL(themeName + "/", baseURL).href },
				{ name: "Repository", url: themeInfo.repo },
				{ name: "Install", url: "#install-" + themeName, js: newJS("install-" + themeName) },
				{ name: "Info", url: "#info-" + themeName, js: newJS("info-" + themeName) },
			],
		};
	}
