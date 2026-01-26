#!/usr/bin/env -S just --justfile

set unstable := true

public_base_prefix := "https://salif.github.io/zola-themes-collection/demo/"
local_base_prefix := "http://127.0.0.1:1111/demo/"
browser := "chromium"
ext := "webp"
font := "Roboto"
this_file := source_file()
this := just_executable() + " -f " + quote(this_file)
scripts := source_directory() / "scripts"
node_modules := scripts / "node_modules"
bin := scripts / ".bin"
zola_version := "0.22.1"

export PATH := bin / zola_version + PATH_VAR_SEP + node_modules / ".bin" + PATH_VAR_SEP + env_var("PATH")

_:
    @{{ this }} --list --unsorted

[group("help")]
[script("node")]
status_short:
    import { ThemeManager } from "{{ scripts }}/ThemeManager.js"
    const m = new ThemeManager()
    m.setArgs({
        local_base_prefix: "{{ local_base_prefix }}", public_base_prefix: "{{ public_base_prefix }}",
        bin: "{{ bin }}", browser: "{{ browser }}", ext: "{{ ext }}", font: "{{ font }}",
    })
    m.justStatusShort()

[group("help")]
[script("node")]
status:
    import { ThemeManager } from "{{ scripts }}/ThemeManager.js"
    const m = new ThemeManager()
    m.justStatus()

[group("build")]
[script("node")]
demo_build path base_prefix=public_base_prefix:
    import { ThemeManager, Do } from "{{ scripts }}/ThemeManager.js"
    const m = new ThemeManager()
    m.setBasePrefix("{{ base_prefix }}")
    m.setArgs({bin: "{{ bin }}"})
    m.justDemoBuild("{{ path }}", Do.INSTALL)

[group("build")]
[script("node")]
demo_build_all base_prefix=public_base_prefix:
    import { ThemeManager, Do } from "{{ scripts }}/ThemeManager.js"
    const m = new ThemeManager()
    m.setBasePrefix("{{ base_prefix }}")
    m.setArgs({bin: "{{ bin }}"})
    m.justDemoBuildAll(Do.INSTALL)

[group("build")]
[script("node")]
check_build path base_prefix=local_base_prefix:
    import { ThemeManager } from "{{ scripts }}/ThemeManager.js"
    const m = new ThemeManager()
    m.setBasePrefix("{{ base_prefix }}")
    m.setArgs({bin: "{{ bin }}"})
    const [exitCode, version] = m.justCheckBuild("{{ path }}")
    console.log("VERSION {{ path }}: " + version)
    process.exit(exitCode)

[group("build")]
[script("node")]
check_build_all base_prefix=local_base_prefix:
    import { ThemeManager } from "{{ scripts }}/ThemeManager.js"
    const m = new ThemeManager()
    m.setBasePrefix("{{ base_prefix }}")
    m.setArgs({bin: "{{ bin }}"})
    m.justCheckBuildAll()

[group("build")]
[script("node")]
demo_remove_all:
    import fs from "fs"
    import path from "path"
    const demos = fs.readdirSync(path.resolve("static", "demo"),
        { withFileTypes: true }).filter(e => e.isDirectory())
    console.log(`Removing ${demos.length} dirs`)
    for (const demo of demos) {
        fs.rmSync(path.join(demo.parentPath, demo.name), { recursive: true, force: true })
    }

[group("build")]
[script("node")]
data_update:
    import { ThemeManager } from "{{ scripts }}/ThemeManager.js"
    const m = new ThemeManager()
    m.setBasePrefix("{{ public_base_prefix }}")
    m.setArgs({bin: "{{ bin }}", ext: "{{ ext }}"})
    m.justDataUpdate()

[group("screenshot")]
[script("node")]
screenshot_changed mode browser=browser base_prefix=local_base_prefix:
    import { ThemeManager } from "{{ scripts }}/ThemeManager.js"
    const m = new ThemeManager()
    m.setBasePrefix("{{ base_prefix }}")
    m.setArgs({browser: "{{ browser }}", ext: "{{ ext }}", font: "{{ font }}"})
    m.getChangedThemes().forEach(theme => {
        m.justScreenshot(theme.path, "{{ mode }}")
    })

[group("screenshot")]
[script("node")]
screenshot_all_dark browser=browser base_prefix=local_base_prefix:
    import { ThemeManager } from "{{ scripts }}/ThemeManager.js"
    const m = new ThemeManager()
    m.setBasePrefix("{{ base_prefix }}")
    m.setArgs({browser: "{{ browser }}", ext: "{{ ext }}", font: "{{ font }}"})
    m.themes.forEach(theme => {
        m.justScreenshot(theme.path, "dark")
    })

[group("screenshot")]
[script("node")]
screenshot_all_light browser=browser base_prefix=local_base_prefix:
    import { ThemeManager } from "{{ scripts }}/ThemeManager.js"
    const m = new ThemeManager()
    m.setBasePrefix("{{ base_prefix }}")
    m.setArgs({browser: "{{ browser }}", ext: "{{ ext }}", font: "{{ font }}"})
    m.themes.forEach(theme => {
        m.justScreenshot(theme.path, "light")
    })

[group("screenshot")]
[script("node")]
screenshot path mode browser=browser base_prefix=local_base_prefix:
    import { ThemeManager } from "{{ scripts }}/ThemeManager.js"
    const m = new ThemeManager()
    m.setBasePrefix("{{ base_prefix }}")
    m.setArgs({browser: "{{ browser }}", ext: "{{ ext }}", font: "{{ font }}"})
    m.justScreenshot("{{ path }}", "{{ mode }}")

[group("screenshot")]
[script("node")]
screenshots_to_fix:
    import { ThemeManager } from "{{ scripts }}/ThemeManager.js"
    const m = new ThemeManager()
    const [toAdd, toDelete] = m.checkScreenshots(".{{ ext }}")
    m.printCheckedScreenshots(toAdd, toDelete)

[group("build")]
local_test_all: (demo_build_all local_base_prefix) data_update
    zola serve

[confirm]
[private]
docker_build:
    docker build -t zola-ztc -f Dockerfile .

[private]
docker_test:
    docker run --rm -v "$PWD:/src" \
    zola-ztc:latest sh -c \
        "just"

[group("help")]
install_zola version=zola_version ar='x86_64-unknown-linux-gnu':
    mkdir -p "{{ bin }}/{{ version }}"
    curl -s -L "https://github.com/getzola/zola/releases/download/v{{ version }}/zola-v{{ version }}-{{ ar }}.tar.gz" | \
        tar xvzf - -C "{{ bin }}/{{ version }}"

[group("help")]
submodule_remove path: && screenshots_to_fix
    @git diff --quiet .gitmodules
    test -d '{{ path }}'
    git submodule deinit -f '{{ path }}'
    rm -rf '.git/modules/{{ path }}'
    git rm -f '{{ path }}'

[group("help")]
submodule-add url name:
    @if ! [[ "{{ name }}" =~ ^[A-Za-z0-9._-]+$ ]]; then \
        printf "Name not allowed!\n"; exit 1; fi;
    @git diff --quiet .gitmodules
    ! test -d 'themes/{{ name }}'
    git submodule add -- '{{ url }}' 'themes/{{ name }}'
    git config -f .gitmodules submodule.'themes/{{ name }}'.ignore dirty
    git config -f .gitmodules submodule.'themes/{{ name }}'.color both
    git config -f .gitmodules submodule.'themes/{{ name }}'.zola {{ zola_version }}
    {{ this }} check_build 'themes/{{ name }}'
    git add .gitmodules

[group("help")]
submodule_update_all:
    @git diff --quiet .gitmodules
    git submodule update --remote
    git submodule foreach --recursive git submodule update --init
    git submodule summary

[group("help")]
submodule_dates:
    for t in themes/*; do \
        git log --diff-filter=A --pretty=format:"%ad" --date=short -- "$t"; \
    done

[group("push")]
[script("node")]
fix_public_dir:
    import fs from "fs"
    const filesToDelete = fs.globSync(["docs/demo/**/*.mp4", "docs/demo/**/*.webm", "docs/demo/*/robots.txt"])
    for (const fileToDelete of filesToDelete) {
        fs.rmSync(fileToDelete, { recursive: true, force: true })
    }
    console.log(`Deleted ${filesToDelete.length} files`)

[confirm]
[group("push")]
gh_pages: && demo_remove_all (demo_build_all public_base_prefix) screenshots_to_fix data_update gh_pages_2
    git diff --cached --quiet
    git switch gh-pages
    git merge main -X theirs --no-ff --no-commit

[group("push")]
[private]
gh_pages_2: && fix_public_dir gh_pages_3
    rm -rf docs
    zola build -o docs

[group("push")]
[private]
gh_pages_3:
    git add docs
    git merge --continue
    git push
    git switch -
