#!/usr/bin/env -S just --justfile

just := just_executable() + " --justfile '" + justfile() + "'"

build-check-all:
	find themes -mindepth 1 -maxdepth 1 | xargs -I {} sh -c "printf 'Building {}\n'; cd {}; zola build -o ZTC_PUBLIC && rm -rf ZTC_PUBLIC || ( pwd | lolcat )"
