export class ThemeInfo {
	#errors;
	pathName;
	cloneLink;
	repoLink;
	screenshots;
	name;
	description;
	tags;
	homepage;
	demo;
	minVersion;
	authorName;
	authorHomepage;
	originalRepo;
	license;
	constructor(pathName, errors) {
		this.#errors = errors;
		this.pathName = pathName;
		this.screenshots = [];
	}
	setCloneLink(link) {
		this.cloneLink = link;
	}
	setRepoLink() {
		if (this.cloneLink.endsWith(".git")) {
			this.repoLink = this.cloneLink.substring(0, this.cloneLink.length - 4)
		} else {
			this.repoLink = this.cloneLink
		}
	}
	setName(name) {
		if (name == undefined || name.length == 0)
			this.name = this.pathName;
		else this.name = name;
	}
	setDescription(description) {
		if (description == undefined || description.length == 0)
			this.description = "";
		else this.description = description;
	}
	setTags(tags) {
		if (tags == undefined || !Array.isArray(tags))
			this.tags = [];
		else this.tags = tags;
	}
	setHomepage(homepage) {
		if (homepage == undefined || homepage.length == 0)
			this.homepage = this.repoLink;
		else this.homepage = homepage;
	}
	setDemoLink(demoLink) {
		this.demo = demoLink;
	}
	setMinVersion(minVersion) {
		this.minVersion = minVersion;
	}
	setAuthor(author) {
		this.authorName = author?.name;
		this.authorHomepage = author?.homepage;
	}
	fixAuthorHomepage() {
		if (this.authorHomepage && !this.authorHomepage.includes("://")) {
			this.authorHomepage = "https://" + this.authorHomepage
		}
	}
	setOriginalRepo(originalRepo) {
		this.originalRepo = originalRepo;
	}
	setLicense(license) {
		this.license = license;
	}
	genDetails() {
		return `<details style='display: inline-block;'><summary class='not-prose' ` +
			`style='list-style-type: none; display: none;'></summary>

### Info{#info-${this.pathName}}` + this.#ifEmpty(this.authorHomepage, this.#ifEmpty(this.authorName, "", `
- **Author**: ${this.authorName}`), `
- **Author**: [${this.authorName}](${this.authorHomepage})`) + `
- **License**: ${this.license}
- **Homepage**: <${this.homepage}>` + this.#ifEmpty(this.demo, "", `
- **Main Live Preview**: <${this.demo}>`) + this.#ifEmpty(this.minVersion, "", `
- **Min Zola version**: ${this.minVersion}`) + this.#ifEmpty(this.originalRepo, "", `
- **Original**: <${this.originalRepo}>`) + `

### Installation{#install-${this.pathName}}
Some themes require additional configuration before they can work properly.
Be sure to follow the instructions found on your chosen theme's documentation to properly configure the theme.

0. Create a new Zola site: \`zola init\` and initialize a Git repository: \`git init\`
1. Download the theme
  - Option A: Add the theme as a git submodule:
\`\`\`sh
git submodule add ${this.cloneLink} themes/${this.pathName}
\`\`\`
  - Option B: Clone the theme into your themes directory:
\`\`\`sh
git clone ${this.cloneLink} themes/${this.pathName}
\`\`\`
2. Enable the theme in your \`zola.toml\` or \`config.toml\` file:
\`\`\`toml
theme = "${this.pathName}"
\`\`\`

</details>`
	}
	#ifEmpty(value, then, otherwise) {
		return (undefined == value || value.length == 0) ? then : otherwise
	}
	toTOML() {
		return {
			theme: this.pathName,
			name: this.name,
			desc: this.description,
			tags: this.tags,
			screenshots: this.screenshots,
			details: this.genDetails(),
			links: [
				{ name: "Live Preview", url: `./demo/${this.pathName}/` },
				{ name: "Repository", url: this.repoLink },
				{
					name: "Info", newtab: false, url: "#info-" + this.pathName,
					js: "document.getElementById('info-" + this.pathName +
						"').parentElement.setAttribute('open', true); this.style.display='none';"
				},
			],
		}
	}
}
