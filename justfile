#!/usr/bin/env -S just --justfile

set unstable

demo_base_url := "https://salif.github.io/zola-themes-collection/demo/"
local_base_url := "http://127.0.0.1:1111/demo/"

just := just_executable() + " --justfile '" + justfile() + "'"
rm := "rm"
git := "git"
zola := "zola"
browser := "brave"

just_scripts := justfile_directory() / "scripts"
export PATH := just_scripts / "node_modules" / ".bin" + ":" + env_var('PATH')
export NODE_PATH := just_scripts / "node_modules"

_: && check-requirements
	@command {{ just }} --list --unsorted

[private]
check-requirements:
	@COMMANDS=("{{ git }}" "{{ zola }}" "zx"); \
	for COMMAND in "${COMMANDS[@]}"; do \
		if ! command -v "${COMMAND}" 2>&1 >/dev/null; then \
			printf "%sWarning: '%s' is not installed or not in PATH%s\n" \
				"{{ style("warning") }}" "${COMMAND}" "{{ NORMAL }}" >&2; \
		fi; \
	done;

[group('build')]
[extension(".mjs"), script("node")]
build-check-all:
	import {buildCheckAll} from "{{ just_scripts }}/themes.js";
	buildCheckAll("{{ local_base_url }}", {zola: "{{ zola }}"});

[group('build')]
[extension(".mjs"), script("node")]
build-check path:
	import {buildCheck} from "{{ just_scripts }}/themes.js";
	buildCheck("{{ path }}", "{{ local_base_url }}", {zola: "{{ zola }}"});

[group('build')]
[extension(".mjs"), script("node")]
build-demo-all base_url=demo_base_url:
	import {buildDemoAll} from "{{ just_scripts }}/themes.js";
	buildDemoAll("{{ base_url }}", {zola: "{{ zola }}"});

[group('build')]
[extension(".mjs"), script("node")]
build-demo path base_url=demo_base_url:
	import {buildDemo} from "{{ just_scripts }}/themes.js";
	buildDemo("{{ path }}", "{{ base_url }}", {zola: "{{ zola }}"});

[group('build')]
[extension(".mjs"), script("node")]
update-data url=demo_base_url:
	import {updateData} from "{{ just_scripts }}/themes.js";
	updateData("{{ url }}");

[group('build')]
remove-demo-all:
	#!/usr/bin/env node
	"use strict"
	const fs = require("fs")
	const path = require("path")
	const demos = fs.readdirSync(path.resolve("static", "demo"),
		{ withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name)
	console.log(`Removing ${demos.length} dirs`)
	for (const demo of demos) {
		fs.rm(path.resolve("static", "demo", demo), { recursive: true, force: true }, () => {})
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
screenshots-to-fix:
	/*
	#!/usr/bin/env node */
	const demos = await glob("static/demo/*", { onlyDirectories: true })
	const missing = []
	for (const demo of demos) {
		const themeName = path.basename(demo)
		if (!(await fs.pathExists(path.join("static", "screenshots", `light-${themeName}.webp`)))) {
			missing.push(`  light for ${themeName}`)
		}
		if (!(await fs.pathExists(path.join("static", "screenshots", `dark-${themeName}.webp`)))) {
			missing.push(`  dark for ${themeName}`)
		}
	}
	const screenshots = await glob("static/screenshots/*")
	const toDelete = []
	for (const screenshotPath of screenshots) {
		const screenshot = path.basename(screenshotPath)
		if (screenshot.startsWith("light-") && screenshot.endsWith(".webp")) {
			const demo = screenshot.substring(6, screenshot.length-5)
			if (!(await fs.pathExists(path.join("static", "demo", demo)))) {
				toDelete.push(screenshot)
			}
		} else if (screenshot.startsWith("dark-") && screenshot.endsWith(".webp")) {
			const demo = screenshot.substring(5, screenshot.length-5)
			if (!(await fs.pathExists(path.join("static", "demo", demo)))) {
				toDelete.push(screenshot)
			}
		} else {
			toDelete.push(screenshot)
		}
	}
	if (missing.length > 0) {
		console.error("missing screenshots:")
		console.error(missing.join("\n"))
		process.exitCode = 1
	}
	if (toDelete.length > 0) {
		console.error("screenshots to delete:")
		console.error(toDelete.join("\n"))
		process.exitCode = 1
	}

[private]
local-test-all: (build-demo-all local_base_url) (update-data local_base_url)
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
	command {{ git }} submodule update --init --remote
	# command {{ git }} submodule foreach --recursive {{ git }} submodule update --init

[group('push')]
fix-docs-dir:
	#!/usr/bin/env node
	"use strict"
	const fs = require("fs")
	const path = require("path")
	const demosPath = path.resolve("docs", "demo")
	const demos = fs.readdirSync(demosPath, { withFileTypes: true }).filter(
		e => e.isDirectory()).map(e => path.join(demosPath, e.name))
	let robotsTxtFiles = 0
	for (const demo of demos) {
		const robotsTxtPath = path.join(demo, "robots.txt")
		if (fs.existsSync(robotsTxtPath)) {
			fs.rmSync(robotsTxtPath)
			robotsTxtFiles += 1
		}
	}
	console.log(`Deleted ${robotsTxtFiles} robots.txt files`)
	const gitignorePath = path.join("docs", "screenshots", ".gitignore")
	if (fs.existsSync(gitignorePath)) fs.rmSync(gitignorePath)
	else console.log("Screenshots .gitignore not deleted")

[group('push'), confirm]
gh-pages:
	command {{ git }} diff --cached --quiet
	command {{ git }} switch gh-pages
	command {{ git }} merge main -X theirs --no-ff --no-commit
	command {{ just }} remove-demo-all build-demo-all '{{ demo_base_url }}' \
		screenshots-to-fix update-data '{{ demo_base_url }}'
	command {{ rm }} -rf docs
	command {{ zola }} build -o docs
	command {{ just }} fix-docs-dir
	command {{ git }} add docs
	command {{ git }} merge --continue
	command {{ git }} push
	command {{ git }} switch -
