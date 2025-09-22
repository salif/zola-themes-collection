#!/usr/bin/env -S just --justfile

set unstable := true

demo_base_url := "https://salif.github.io/zola-themes-collection/demo/"
local_base_url := "http://127.0.0.1:1111/demo/"
browser := "chromium"
font := "Roboto"
ext := "webp"
this_file := source_file()
this := just_executable() + " -f " + quote(this_file)
scripts := source_directory() / "scripts"
node_modules := scripts / "node_modules"

# export PATH := node_modules / ".bin" + PATH_VAR_SEP + env_var("PATH")

_: && check-commands
    @{{ this }} --list --unsorted

[private]
[script("bash")]
check-commands:
    set -eu
    COMMANDS=(git zola node cwebp);
    for COMMAND in "${COMMANDS[@]}"; do
        if ! command -v "${COMMAND}" 2>&1 >/dev/null; then
            printf "%sWarning: '%s' is not installed or not in PATH\n%s%s\n" \
                "{{ style("warning") }}" "${COMMAND}" \
                "Try 'npm install' inside 'scripts' directory" "{{ NORMAL }}" >&2;
        fi;
    done;

[group("build")]
[script("node")]
demo-checkbuild-all:
    import {buildDemoAll} from "{{ scripts }}/themes.js";
    buildDemoAll("{{ local_base_url }}", false, {zola: "zola"});

[group("build")]
[script("node")]
demo-checkbuild path:
    import {buildDemo} from "{{ scripts }}/themes.js";
    buildDemo("{{ path }}", "{{ local_base_url }}", false, {zola: "zola"});

[group("build")]
[script("node")]
demo-build-all base_url=demo_base_url:
    import {buildDemoAll} from "{{ scripts }}/themes.js";
    buildDemoAll("{{ base_url }}", true, {zola: "zola"});

[group("build")]
[script("node")]
demo-build path base_url=demo_base_url:
    import {buildDemo} from "{{ scripts }}/themes.js";
    buildDemo("{{ path }}", "{{ base_url }}", true, {zola: "zola"});

[group("build")]
[script("node")]
update-data:
    import {updateData} from "{{ scripts }}/themes.js";
    updateData();

[group("build")]
[script("node")]
remove-demo-all:
    import fs from "fs"
    import path from "path"
    const demos = fs.readdirSync(path.resolve("static", "demo"),
        { withFileTypes: true }).filter(e => e.isDirectory())
    console.log(`Removing ${demos.length} dirs`)
    for (const demo of demos) {
        fs.rmSync(path.join(demo.parentPath, demo.name), { recursive: true, force: true })
    }

[group("screenshot")]
[private]
[script("node")]
screenshot-changed mode:
    import {execaSync} from "{{node_modules}}/execa/index.js"
    const themes = await execaSync`git diff --cached --name-only`
    themes.stdout.split("\n").filter(e=>e.startsWith("themes/")).forEach(e=>{
        const theme = e.substr("themes/".length)
        execaSync({verbose: 'full'})("{{just_executable()}}", ["screenshot", theme, "{{mode}}"])
    })

[group("screenshot")]
screenshot-all-dark url=local_base_url: (screenshot-all "dark" url)

[group("screenshot")]
screenshot-all-light url=local_base_url: (screenshot-all "light" url)

[group("screenshot")]
[private]
screenshot-all mode="dark" url=local_base_url:
    find static/demo -mindepth 1 -maxdepth 1 -type d -printf "%f\n" | xargs -I {} \
        {{ this }} screenshot '{}' '{{ mode }}' '{{ url }}'

[group("screenshot")]
screenshot name mode="dark" url=local_base_url:
    {{ browser }} --headless --screenshot=/tmp/ztc.png \
        --hide-scrollbars --system-font-family="{{ font }}" --window-size=1360,888 "{{ url }}{{ name }}/"
    cwebp -lossless -crop 0 0 1360 765 /tmp/ztc.png -o "static/screenshots/{{ mode }}-{{ name }}.{{ ext }}"
    rm -f /tmp/ztc.png

[group("screenshot")]
[script("node")]
screenshots-to-fix:
    import {checkScreenshots} from "{{ scripts }}/themes.js";
    checkScreenshots(".{{ ext }}");

[group("build")]
local-test-all: (demo-build-all local_base_url) update-data
    zola serve

[confirm]
[private]
docker-build:
    docker build -t zola-ztc -f Dockerfile .

[private]
docker-test:
    docker run --rm -v "$PWD:/src" \
    zola-ztc:latest sh -c \
        "just"

[group("help")]
submodule-remove path: && screenshots-to-fix
    @git diff --quiet .gitmodules
    test -d '{{ path }}'
    git submodule deinit -f '{{ path }}'
    rm -rf '.git/modules/{{ path }}'
    git rm -f '{{ path }}'

[group("help")]
submodule-add url name: && (demo-checkbuild "themes/" + name)
    @if ! [[ "{{ name }}" =~ ^[A-Za-z0-9._-]+$ ]]; then \
        printf "Name not allowed!\n"; exit 1; fi;
    @git diff --quiet .gitmodules
    ! test -d 'themes/{{ name }}'
    git submodule add -- '{{ url }}' 'themes/{{ name }}'
    git config -f .gitmodules submodule.'themes/{{ name }}'.ignore dirty
    git config -f .gitmodules submodule.'themes/{{ name }}'.color both

[group("help")]
submodule-update-all:
    @git diff --quiet .gitmodules
    git submodule update --remote
    git submodule foreach --recursive git submodule update --init
    git submodule summary

[group("push")]
[script("node")]
fix-public-dir:
    import fs from "fs"
    const filesToDelete = fs.globSync(["docs/demo/**/*.mp4", "docs/demo/**/*.webm", "docs/demo/*/robots.txt"])
    for (const fileToDelete of filesToDelete) {
        fs.rmSync(fileToDelete, { recursive: true, force: true })
    }
    console.log(`Deleted ${filesToDelete.length} files`)

[confirm]
[group("push")]
gh-pages: && remove-demo-all (demo-build-all demo_base_url) screenshots-to-fix update-data gh-pages-2
    git diff --cached --quiet
    git switch gh-pages
    git merge main -X theirs --no-ff --no-commit

[group("push")]
[private]
gh-pages-2: && fix-public-dir gh-pages-3
    rm -rf docs
    zola build -o docs

[group("push")]
[private]
gh-pages-3:
    git add docs
    git merge --continue
    git push
    git switch -
