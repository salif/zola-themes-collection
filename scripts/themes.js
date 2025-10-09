import TOML from "@iarna/toml"
import fs from "fs"
import path from "path"
import { execa } from "execa"

const demoRepoThemes = new Map([
	["linkita", "https://codeberg.org/salif/linkita.git"],
	["tabi", "https://github.com/welpo/tabi.git"],
	["serene", "https://github.com/isunjn/serene.git"],
	["project-portfolio", "https://codeberg.org/winterstein/zola-theme-project-portfolio.git"],
	["daisy", "https://codeberg.org/winterstein/zola-theme-daisy.git"],
	["noobping", "https://github.com/noobping/zola-theme.git"],
	["rilling_dev", "https://github.com/RillingDev/rilling.dev_theme.git"],
	["landing-grid", "https://github.com/fastup-one/landing-grid-zola.git"],
])


let cmds = {}
const errors = []
const warnings = []
const PUB_DIR = "ZTC_PUBLIC"
// TODO: durationMs

export function buildDemoAll(baseURL, doInstall, commands) {
	cmds = commands
	buildThemes(allThemes(), doInstall, baseURL)
}
export function buildDemo(themeRelPath, baseURL, doInstall, commands) {
	cmds = commands
	if (themeRelPath.endsWith("/")) themeRelPath = themeRelPath.slice(0, -1)
	const theme = allThemes().find(e => e.path === themeRelPath)
	if (theme != undefined) {
		buildThemes([theme], doInstall, baseURL)
	} else {
		errors.push(`'${themeRelPath}' is not found!`)
	}
	checkErrors()
}
export function updateData() {
	const themesRelPaths = allThemes()
	const data = []
	for (const themeRelPath of themesRelPaths) {
		const themeInfo = readThemeInfo(themeRelPath, TOML)
		if (null != themeInfo) {
			data.push(themeInfo)
		} else {
			errors.push(themeRelPath)
		}
	}
	checkWarnings()
	checkErrors()
	fs.writeFileSync("content/themes.toml", TOML.stringify({ project: data }))
}

function buildThemes(themes, doInstall, baseURL) {
	const basePath = process.cwd()
	if (themes.length > 1) {
		console.log(`Building ${themes.length} themes`)
	}
	for (const theme of themes) {
		const themePath = path.join(basePath, theme.path)
		const themeName = path.basename(themePath)
		buildTheme(themePath, themeName, baseURL).then(e => {
			// console.log(JSON.stringify(e, null, 4))
			if (e.failed) {
				errors.push(e.message)
				checkErrors()
			} else if (doInstall) {
				installDemo(themePath, path.join(basePath, "static", "demo", themeName))
			} else {
				fs.rmSync(path.join(themePath, PUB_DIR), { recursive: true })
			}
			console.log("$ " + e.command)
			console.log(e.stdout)
		})
	}
	checkWarnings()
	checkErrors()
}
function buildTheme(themePath, themeName, baseURL) {
	if (!fs.existsSync(path.join(themePath, "theme.toml")) && !fs.existsSync(path.join(themePath, "themes", themeName, "theme.toml"))) {
		warnings.push(`theme.toml not found! themes/${themeName}`)
	}
	if (fs.existsSync(path.join(themePath, "theme.toml")) && fs.existsSync(path.join(themePath, "themes"))) {
		warnings.push(`themes dir found! themes/${themeName}`)
	}
	if (fs.existsSync(path.join(themePath, "public"))) {
		warnings.push(`public dir found! themes/${themeName}`)
	}

	let configFile
	if (fs.existsSync(path.join(themePath, "config.toml"))) {
		configFile = "config.toml"
	} else if (fs.existsSync(path.join(themePath, "config.example.toml"))) {
		configFile = "config.example.toml"
	} else {
		errors.push(`config.toml not found! themes/${themeName}`)
		checkErrors()
	}
	if (fs.existsSync(path.join(themePath, PUB_DIR))) {
		fs.rmSync(path.join(themePath, PUB_DIR), { recursive: true })
	}
	const demoBaseURL = new URL(themeName + "/", baseURL).href
	let buildArgs = ['--config', configFile, 'build', '-u', demoBaseURL, '-o', PUB_DIR]
	return execa({ cwd: themePath, reject: false })`${cmds.zola} ${buildArgs}`
}
function installDemo(themePath, demoPath) {
	if (fs.existsSync(demoPath)) {
		fs.rmSync(demoPath, { recursive: true })
	}
	fs.renameSync(path.join(themePath, PUB_DIR), demoPath)
}
function allThemes() {
	const content = fs.readFileSync(".gitmodules", "utf8")
	const lines = content.split("\n")
	const result = {}
	let currentSubmodule = null
	lines.forEach(line => {
		line = line.trim()
		if (line.startsWith("[submodule")) {
			// Extract submodule name
			currentSubmodule = line.match(/"(.*)"/)[1]
			result[currentSubmodule] = {}
		} else if (currentSubmodule && line.includes("=")) {
			// Parse key-value pairs
			const [key, value] = line.split("=").map(part => part.trim())
			result[currentSubmodule][key] = value
		}
	})
	return Object.values(result).filter(e => e.color)
}
function IfFalseIfTrue(v, ifFalse, ifTrue) {
	return (undefined == v || v.length == 0) ? ifFalse : ifTrue
}
function readThemeInfo(theme, TOML) {
	if (!theme.path.startsWith("themes/")) return
	const themeName = theme.path.substring(7)
	const themeInfo = {}
	if (demoRepoThemes.has(themeName)) {
		themeInfo.clone = demoRepoThemes.get(themeName)
	} else {
		themeInfo.clone = theme.url
	}
	themeInfo.repo = themeInfo.clone.endsWith(".git") ?
		themeInfo.clone.substring(0, themeInfo.clone.length - 4) :
		themeInfo.clone
	let themeTomlPath = path.join(theme.path, "theme.toml")
	if (!fs.existsSync(themeTomlPath)) {
		themeTomlPath = path.join(theme.path, "themes", themeName, "theme.toml")
	}
	const themeToml = TOML.parse(fs.readFileSync(themeTomlPath, "utf8"))
	themeInfo.name = IfFalseIfTrue(themeToml.name, themeName, themeToml.name)
	themeInfo.description = IfFalseIfTrue(themeToml.description, "", themeToml.description)
	themeInfo.tags = (undefined == themeToml.tags || !Array.isArray(themeToml.tags)) ? [] : themeToml.tags
	themeInfo.license = themeToml.license
	themeInfo.homepage = IfFalseIfTrue(themeToml.homepage, themeInfo.repo, themeToml.homepage)
	themeInfo.demo = themeToml.demo
	themeInfo.minVersion = themeToml.min_version
	themeInfo.authorName = themeToml.author?.name
	themeInfo.authorHomepage = themeToml.author?.homepage
	themeInfo.originalRepo = themeToml.original?.repo
	const themeDetails = `<details style='display: inline-block;'><summary class='not-prose' ` +
		`style='list-style-type: none; display: none;'></summary>

### Info{#info-${themeName}}` + IfFalseIfTrue(themeInfo.authorHomepage, IfFalseIfTrue(themeInfo.authorName, "", `
- **Author**: ${themeInfo.authorName}`), `
- **Author**: [${themeInfo.authorName}](${themeInfo.authorHomepage})`) + `
- **License**: ${themeInfo.license}
- **Homepage**: <${themeInfo.homepage}>` + IfFalseIfTrue(themeInfo.demo, "", `
- **Main Live Preview**: <${themeInfo.demo}>`) + IfFalseIfTrue(themeInfo.minVersion, "", `
- **Min Zola version**: ${themeInfo.minVersion}`) + IfFalseIfTrue(themeInfo.originalRepo, "", `
- **Original**: <${themeInfo.originalRepo}>`) + `

### Installation{#install-${themeName}}
Some themes require additional configuration before they can work properly.
Be sure to follow the instructions found on your chosen theme's documentation to properly configure the theme.

0. Create a new Zola site: \`zola init\` and initialize a Git repository: \`git init\`
1. Download the theme
  - Option A: Add the theme as a git submodule:
\`\`\`sh
git submodule add ${themeInfo.clone} themes/${themeName}
\`\`\`
  - Option B: Clone the theme into your themes directory:
\`\`\`sh
git clone ${themeInfo.clone} themes/${themeName}
\`\`\`
2. Enable the theme in your \`config.toml\`
\`\`\`toml
theme = "${themeName}"
\`\`\`

</details>`
	if (undefined != themeToml.homepage &&
		themeToml.homepage !== themeInfo.repo &&
		themeToml.homepage !== themeInfo.repo + "/") {
		warnings.push("diff: \n  " + themeToml.homepage + "\n  " + themeInfo.repo)
	}
	themeInfo.screenshots = []
	if (theme.color === "light" || theme.color === "both") {
		themeInfo.screenshots.push({
			src: `./screenshots/light-${themeName}.webp`,
			type: "image/webp",
			width: "1360",
			height: "765",
			alt: `Light mode screenshot of ${themeInfo.name} Zola theme demo website`,
		})
	}
	if (theme.color === "dark" || theme.color === "both") {
		themeInfo.screenshots.push({
			src: `./screenshots/dark-${themeName}.webp`,
			type: "image/webp",
			width: "1360",
			height: "765",
			alt: `Dark mode screenshot of ${themeInfo.name} Zola theme demo website`,
		})
	}
	if (!["light", "dark", "both"].includes(theme.color)) {
		errors.push(`Unknown theme.color: ${theme.color}`)
		checkErrors()
	}
	return {
		theme: themeName,
		name: themeInfo.name,
		desc: themeInfo.description,
		tags: themeInfo.tags,
		screenshots: themeInfo.screenshots,
		details: themeDetails,
		links: [
			{ name: "Live Preview", url: `./demo/${themeName}/` },
			{ name: "Repository", url: themeInfo.repo },
			{
				name: "Info", newtab: false, url: "#info-" + themeName,
				js: "document.getElementById('info-" + themeName +
					"').parentElement.setAttribute('open', true); this.style.display='none';"
			},
		],
	}
}

export function checkScreenshots(ext) {
	const themes = allThemes()
	const missing = []
	for (const theme of themes) {
		const themeName = path.basename(theme.path)
		if (!fs.existsSync(path.join("static", "screenshots", `light-${themeName}${ext}`))) {
			missing.push(`  light for ${themeName}`)
		}
		if (!fs.existsSync(path.join("static", "screenshots", `dark-${themeName}${ext}`))) {
			missing.push(`  dark for ${themeName}`)
		}
	}
	const screenshots = fs.readdirSync(path.resolve("static", "screenshots"),
		{ withFileTypes: true }).filter(e => !e.isDirectory()).map(e => e.name)
	const toDelete = []
	for (const screenshot of screenshots) {
		if (screenshot.startsWith("light-") && screenshot.endsWith(ext)) {
			const demo = screenshot.substring(6, screenshot.length - 5)
			if (!fs.existsSync(path.join("static", "demo", demo))) {
				toDelete.push(screenshot)
			}
		} else if (screenshot.startsWith("dark-") && screenshot.endsWith(ext)) {
			const demo = screenshot.substring(5, screenshot.length - 5)
			if (!fs.existsSync(path.join("static", "demo", demo))) {
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
}

function checkWarnings() {
	if (warnings.length > 0) {
		warnings.forEach(w => {
			console.warn("Warning:", w)
		})
	}
}

function checkErrors() {
	if (errors.length > 0) {
		errors.forEach(err => { console.error("Error:", err) })
		console.error(`Error: ${errors.length} errors!`)
		process.exit(1)
	}
}
