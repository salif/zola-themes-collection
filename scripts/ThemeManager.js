import fs from "fs"
import path from "path"
import { Submodule } from "./Submodule.js"
import { ThemeInfo } from "./ThemeInfo.js"
import { Warning } from "./Warning.js"
import { execaSync } from "execa"
import TOML from "@iarna/toml"

export class Do {
	static SKIP_INSTALL = 1
	static INSTALL = 2
	static SKIP_UNCHANGED = 3
}

export class ThemeManager {
	static PUB_DIR = "ZTC_PUBLIC"
	static OK_EXIT_CODE = 0
	static ERROR_EXIT_CODE = 1

	constructor() {
		this.themes = ThemeManager.allThemes()
	}

	setBasePrefix(basePrefix) {
		this.basePrefix = basePrefix
	}

	setArgs(args) {
		if (args.zola == undefined) {
			args.zola = "zola"
		}
		this.args = args
	}

	justStatusShort() {
		const out = []
		out.push(`Local base prefix: ${this.args.local_base_prefix}`)
		out.push(`Public base prefix: ${this.args.public_base_prefix}`)
		out.push(`Screenshot font: ${this.args.font}`)
		out.push(`Screenshot ext: ${this.args.ext}`)
		out.push(`Screenshot browser: ${this.args.browser}`)
		out.push(`Available Zola versions: ${this.getAvailableVersions().length}`)
		out.push(`Themes: ${this.themes.length}`)
		out.push(`Theme diff links: ${this.themes.filter(e => e.link != undefined).length}`)
		out.push(`On Codeberg: ${this.themes.filter(e => e.url.startsWith("https://codeberg.org/")).length}`)
		out.push(`On GitHub: ${this.themes.filter(e => e.url.startsWith("https://github.com/")).length}`)
		out.push(`On Other: ${this.themes.filter(e => !e.url.startsWith("https://codeberg.org/") && !e.url.startsWith("https://github.com/")).length}`)
		Object.entries(Object.groupBy(this.themes, (e) => e.zola)).forEach(([version, themes]) => {
			out.push(`Themes for Zola ${version}: ${themes.length}`)
		})
		out.push(`Themes with both modes: ${this.themes.filter(e => e.color === "both").length}`)
		out.push(`Themes with light mode: ${this.themes.filter(e => e.color === "light").length}`)
		out.push(`Themes with dark mode: ${this.themes.filter(e => e.color === "dark").length}`)
		const [scrToAdds, scrToDelete] = this.checkScreenshots(this.args.ext)
		out.push(`Screenshots to add: ${scrToAdds.length}`)
		out.push(`Screenshots to delete: ${scrToDelete.length}`)
		console.log(out.join("\n"))
	}

	justStatus() {
		const out = []
		out.push(`Changed themes: ${this.getChangedThemes().length}`)
		console.log(out.join("\n"))
	}

	justDemoBuildAll(doInstall = Do.INSTALL) {
		const errors = []
		this.buildDemos(this.themes, errors, doInstall)
		this.check(errors)
	}

	justDemoBuild(themeRelPathStr, doInstall = Do.INSTALL) {
		const errors = []
		themeRelPathStr = ThemeManager.fixRelPath(themeRelPathStr)
		const themes = this.themes.filter(e => e.path === themeRelPathStr)
		if (themes.length === 1) {
			this.buildDemos(themes, errors, doInstall)
		} else {
			errors.push(new Error(`'${themeRelPathStr}' is not found!`))
		}
		this.check(errors)
	}

	justCheckBuild(themeRelPathStr) {
		const versions = this.getAvailableVersions()
		let finalExitCode = ThemeManager.ERROR_EXIT_CODE
		let workingVersion = "0.0.0"
		for (const version of versions) {
			this.args.zolaVer = version
			try {
				this.justDemoBuild(themeRelPathStr, Do.SKIP_INSTALL)
			} catch {
				finalExitCode = ThemeManager.ERROR_EXIT_CODE
				continue
			}
			workingVersion = version
			finalExitCode = ThemeManager.OK_EXIT_CODE
			break
		}
		return [finalExitCode, workingVersion]
	}

	justCheckBuildAll() {
		let exitCodeSum
		const toChange = []
		this.themes.forEach(theme => {
			const [exitCode, version] = this.justCheckBuild(theme.path)
			if (version !== theme.zola) {
				toChange.push({ from: theme.zola, to: version, path: theme.path })
			}
			exitCodeSum += exitCode
		})
		if (toChange.length > 0) {
			console.log("Themes with incorrect version:")
			toChange.forEach(t => {
				console.log(`${t.path}: ${t.from} -> ${t.to}`)
			})
		} else {
			console.log("All themes have correct version.")
		}
		process.exitCode = exitCodeSum > 0 ? 1 : 0
	}

	justDataUpdate() {
		const data = []
		const errors = []
		for (const themeRelPath of this.themes) {
			const themeInfo = this.readThemeInfo(themeRelPath, errors)
			if (null != themeInfo) {
				data.push(themeInfo.toTOML())
			} else {
				errors.push(new Error(themeRelPath))
			}
		}
		this.check(errors)
		fs.writeFileSync("content/themes.toml", TOML.stringify({ project: data }))
	}

	buildDemos(themes, errors, doInstall) {
		const basePath = process.cwd()
		if (themes.length > 1) {
			console.log(`Building ${themes.length} themes`)
		}
		for (const theme of themes) {
			const themePath = path.join(basePath, theme.path)
			const themeName = path.basename(themePath)

			if (this.args.zolaVer == undefined) {
				if (theme.zola == undefined) {
					this.args.zolaCmd = this.args.zola
				} else {
					this.args.zolaCmd = path.join(this.args.bin, theme.zola, this.args.zola)
				}
			} else {
				this.args.zolaCmd = path.join(this.args.bin, this.args.zolaVer, this.args.zola)
			}
			const e = this.buildTheme(themePath, themeName, errors)
			if (e.failed) {
				errors.push(new Error(e.message))
				this.check(errors)
			} else if (doInstall !== Do.SKIP_INSTALL) {
				this.installDemo(themePath, path.join(basePath, "static", "demo", themeName))
			} else {
				fs.rmSync(path.join(themePath, ThemeManager.PUB_DIR), { recursive: true })
			}
			console.log(`\$ ${e.command}\n${e.stdio.join("\n")}`)
		}
	}
	buildTheme(themePath, themeName, errors) {
		if (!fs.existsSync(path.join(themePath, "theme.toml")) && !fs.existsSync(path.join(themePath, "themes", themeName, "theme.toml"))) {
			errors.push(new Warning(`theme.toml not found! themes/${themeName}`))
		}
		if (fs.existsSync(path.join(themePath, "theme.toml")) && fs.existsSync(path.join(themePath, "themes"))) {
			errors.push(new Warning(`themes dir found! themes/${themeName}`))
		}
		if (fs.existsSync(path.join(themePath, "public"))) {
			errors.push(new Warning(`public dir found! themes/${themeName}`))
		}

		let configFile
		if (fs.existsSync(path.join(themePath, "zola.toml"))) {
			configFile = "zola.toml"
		} else if (fs.existsSync(path.join(themePath, "config.toml"))) {
			configFile = "config.toml"
		} else if (fs.existsSync(path.join(themePath, "zola.example.toml"))) {
			configFile = "zola.example.toml"
		} else if (fs.existsSync(path.join(themePath, "config.example.toml"))) {
			configFile = "config.example.toml"
		} else {
			return { failed: true, message: `zola.toml not found! themes/${themeName}` }
		}
		if (fs.existsSync(path.join(themePath, ThemeManager.PUB_DIR))) {
			fs.rmSync(path.join(themePath, ThemeManager.PUB_DIR), { recursive: true })
		}
		const basePrefix = new URL(themeName + "/", this.basePrefix).href
		const buildArgs = ['--config', configFile, 'build', '-u', basePrefix, '-o', ThemeManager.PUB_DIR]
		const result = execaSync(this.args.zolaCmd, buildArgs, { cwd: themePath, reject: false })
		return result
	}
	installDemo(themePath, demoPath) {
		if (fs.existsSync(demoPath)) {
			fs.rmSync(demoPath, { recursive: true })
		}
		fs.renameSync(path.join(themePath, ThemeManager.PUB_DIR), demoPath)
	}

	readThemeInfo(submodule, errors) {
		if (!submodule.path.startsWith("themes/")) return
		const themeInfo = new ThemeInfo(submodule.path.substring("themes/".length), errors)
		let tomlPath
		if (submodule.link) {
			themeInfo.setCloneLink(submodule.link)
			tomlPath = path.join(submodule.path, "themes", themeInfo.pathName, "theme.toml")
		} else {
			themeInfo.setCloneLink(submodule.url)
			tomlPath = path.join(submodule.path, "theme.toml")
		}
		themeInfo.setRepoLink()
		const tomlFile = TOML.parse(fs.readFileSync(tomlPath, "utf8"))
		themeInfo.setName(tomlFile.name)
		themeInfo.setDescription(tomlFile.description)
		themeInfo.setTags(tomlFile.tags)
		themeInfo.setHomepage(tomlFile.homepage)
		themeInfo.setDemoLink(tomlFile.demo)
		themeInfo.setMinVersion(tomlFile.min_version)
		themeInfo.setAuthor(tomlFile.author)
		themeInfo.setOriginalRepo(tomlFile.original?.repo)
		themeInfo.fixAuthorHomepage()
		if (tomlFile.license) {
			themeInfo.setLicense(tomlFile.license)
		} else if (tomlFile.licence) {
			themeInfo.setLicense(tomlFile.licence)
		} else {
			errors.push(new Error(`${submodule.path} license is undefined`))
		}

		if (undefined != tomlFile.homepage &&
			tomlFile.homepage !== themeInfo.repoLink &&
			tomlFile.homepage !== themeInfo.repoLink + "/") {
			errors.push(new Warning("diff: \n  " + tomlFile.homepage + "\n  " + themeInfo.repoLink))
		}
		if (submodule.color === "light" || submodule.color === "both") {
			themeInfo.screenshots.push({
				src: `./screenshots/light-${themeInfo.pathName}.${this.args.ext}`,
				type: `image/${this.args.ext}`,
				width: "1360",
				height: "765",
				alt: `Light mode screenshot of ${themeInfo.name} Zola theme demo website`,
			})
		}
		if (submodule.color === "dark" || submodule.color === "both") {
			themeInfo.screenshots.push({
				src: `./screenshots/dark-${themeInfo.pathName}.${this.args.ext}`,
				type: `image/${this.args.ext}`,
				width: "1360",
				height: "765",
				alt: `Dark mode screenshot of ${themeInfo.name} Zola theme demo website`,
			})
		}
		if (!["light", "dark", "both"].includes(submodule.color)) {
			errors.push(new Error(`Unknown theme.color: ${submodule.color}`))
		}
		return themeInfo
	}

	justScreenshot(themeRelPathStr, mode) {
		const name = path.basename(themeRelPathStr)
		execaSync(this.args.browser, ["--headless", "--screenshot=/tmp/ztc.png", "--hide-scrollbars", `--system-font-family=${this.args.font}`, "--window-size=1360,888", `${this.basePrefix}${name}/`], { verbose: "full" })
		execaSync("cwebp", ["-lossless", "-crop", "0", "0", "1360", "765", "/tmp/ztc.png", "-o", `static/screenshots/${mode}-${name}.${this.args.ext}`], { verbose: "full" })
		fs.rmSync("/tmp/ztc.png")
	}

	checkScreenshots(ext) {
		const toAdd = []
		const toDelete = []
		const screenshots = { light: new Map(), dark: new Map() }
		const screenshotFiles = fs.readdirSync(path.resolve("static", "screenshots"),
			{ withFileTypes: true }).filter(e => !e.isDirectory()).map(e => e.name)
		for (const screenshotFile of screenshotFiles) {
			if (screenshotFile.startsWith("light-") && screenshotFile.endsWith(ext)) {
				const themeName = screenshotFile.substring(6, screenshotFile.length - 5)
				screenshots.light.set(themeName, true)
				if (this.themes.find(e => e.path === `themes/${themeName}`) == undefined) {
					toDelete.push(screenshotFile)
				}
			} else if (screenshotFile.startsWith("dark-") && screenshotFile.endsWith(ext)) {
				const themeName = screenshotFile.substring(5, screenshotFile.length - 5)
				screenshots.dark.set(themeName, true)
				if (this.themes.find(e => e.path === `themes/${themeName}`) == undefined) {
					toDelete.push(screenshotFile)
				}
			} else {
				toDelete.push(screenshotFile)
			}
		}
		for (const theme of this.themes) {
			const themeName = path.basename(theme.path)
			if (!screenshots.light.has(themeName)) {
				toAdd.push(path.join("static", "screenshots", `light-${themeName}${ext}`))
			}
			if (!screenshots.dark.has(themeName)) {
				toAdd.push(path.join("static", "screenshots", `dark-${themeName}${ext}`))
			}
		}
		return [toAdd, toDelete]
	}

	printCheckedScreenshots(toAdd, toDelete) {
		let finalExitCode = ThemeManager.OK_EXIT_CODE
		let out = []
		if (toAdd.length > 0) {
			out.push("screenshots to add:")
			out.push(toAdd.map(e => "  " + e).join("\n"))
			finalExitCode = ThemeManager.ERROR_EXIT_CODE
		}
		if (toDelete.length > 0) {
			out.push("screenshots to delete:")
			out.push(toDelete.map(e => "  " + e).join("\n"))
			finalExitCode = ThemeManager.ERROR_EXIT_CODE
		}
		if (out.length > 0) {
			console.error(out.join("\n"))
			process.exitCode = finalExitCode
		}
	}

	getChangedThemes() {
		const output = execaSync("git", ["diff", "--cached", "--raw"]).stdout
		return output.split("\n")
			.filter(line => line.includes(" 160000 "))
			.map(line => this.themes.find(e => e.path === line.split("\t")[1]))
			.filter(theme => theme != undefined)
	}

	getAvailableVersions() {
		return fs.readdirSync(this.args.bin).sort().reverse()
	}

	check(errors) {
		let doThrow = false
		errors.forEach(err => {
			if (err instanceof Warning) {
				console.warn(err.msg)
			} else {
				console.error(`${err.name}: ${err.message}`)
				doThrow = true
			}
		})
		if (doThrow) throw new Error("Errors found")
	}

	static fixRelPath(str) {
		if (str.endsWith("/"))
			str = str.slice(0, -1)
		return str
	}

	static allThemes() {
		const content = fs.readFileSync(".gitmodules", "utf8")
		const lines = content.split("\n")
		const result = new Map()
		let currentSubmodule = null
		lines.forEach(line => {
			line = line.trim()
			if (line.startsWith("[submodule")) {
				// Extract submodule name
				currentSubmodule = line.match(/"(.*)"/)[1]
				result.set(currentSubmodule, new Submodule())
			} else if (currentSubmodule && line.includes("=")) {
				// Parse key-value pairs
				const [key, value] = line.split("=").map(part => part.trim())
				result.get(currentSubmodule).setValue(key, value)
			}
		})
		return Array.from(result.values()).filter(e => e.isTheme())
	}

}
