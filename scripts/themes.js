import "zx/globals"
import TOML from "@iarna/toml"

$.verbose = true
process.env.CLICOLOR_FORCE = '1'

const sepThemes = new Map([
	["linkita", "https://codeberg.org/salif/linkita.git"],
	["tabi", "https://github.com/welpo/tabi.git"],
	["project-portfolio", "https://github.com/awinterstein/zola-theme-project-portfolio.git"]
])
const errors = []

export function buildCheckAll(baseURL, commands) {
	listThemes().then(themes => buildThemes(themes, false, baseURL, commands))
}
export function buildCheck(themePath, baseURL, commands) {
	buildThemes([{ path: themePath }], false, baseURL, commands)
}
export function buildDemoAll(baseURL, commands) {
	listThemes().then(themes => buildThemes(themes, true, baseURL, commands))
}
export function buildDemo(themePath, baseURL, commands) {
	buildThemes([{ path: themePath }], true, baseURL, commands)
}
export function updateData(baseURL) {
	listThemes().then(themes => doUpdateData(baseURL, themes))
}

async function buildThemes(themes, doInstall, baseURL, commands) {
	const basePath = process.cwd()
	for (const theme of themes) {
		const themePath = path.join(basePath, theme.path)
		const themeName = path.basename(themePath)
		cd(themePath)
		await buildTheme(themeName, baseURL, commands)
		if (doInstall) await installDemo(themePath, themeName,
			path.join(basePath, "static", "demo", themeName))
		await remPublic()
	}
	if (errors.length > 0) errors.forEach(err => { console.error(err) })
}
async function buildTheme(themeName, baseURL, commands) {
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
	await $`${commands.zola} ${['build', '-u', demoBaseURL, '-o', 'ZTC_PUBLIC']}`
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
	return Object.values(result).filter(r => r.path.startsWith("themes/"));
}
function doUpdateData(baseURL, themes) {
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
	themeInfo.description = onlyIf(themeToml.description, "", themeToml.description);
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