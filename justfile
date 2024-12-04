#!/usr/bin/env -S just --justfile

just := just_executable() + " --justfile '" + justfile() + "'"
browser := "brave"

_:
	@{{ just }} --list --unsorted

build-check-all:
	find themes -mindepth 1 -maxdepth 1 -type d | xargs -I {} sh -c \
		"printf 'Building {}\n'; cd {}; rm -rf ZTC_PUBLIC; zola build -o ZTC_PUBLIC || ( pwd | lolcat ); rm -rf ZTC_PUBLIC"

build-demo-all url="https://salif.github.io/zola-themes-collection/demo":
	find themes -mindepth 1 -maxdepth 1 -type d | xargs -I {} \
		{{ just }} build-demo '{}' '{{ url }}'

build-demo path url="https://salif.github.io/zola-themes-collection/demo":
	#!/usr/bin/env bash
	ZTC_DEMO_NAME=$(basename '{{ path }}')
	ZTC_DEMO=../../static/demo/"${ZTC_DEMO_NAME}"; 
	printf 'Building %s\n' "${ZTC_DEMO_NAME} and ${ZTC_DEMO}"
	cd '{{ path }}'
	rm -rf ZTC_PUBLIC "${ZTC_DEMO}";
	if ! test -f config.toml; then exit 1; fi
	zola build -u "{{ url }}/${ZTC_DEMO_NAME}/" -o ZTC_PUBLIC && (mv ZTC_PUBLIC "${ZTC_DEMO}"; printf '*' > "${ZTC_DEMO}/.gitignore") || rm -rf ZTC_PUBLIC

rem-ztc-public-all:
	find themes -mindepth 1 -maxdepth 1 -type d | xargs -I {} \
		sh -c "rm -rf '{}/ZTC_PUBLIC'"

rem-demo-all:
	rm -rf static/demo/*
	touch static/demo/.gitkeep

screenshot-all mode="dark" url="http://127.0.0.1:1111/demo":
	find static/demo -mindepth 1 -maxdepth 1 -type d | xargs -I {} \
		{{ just }} screenshot '{}' '{{ mode }}' '{{ url }}'

screenshot path mode="dark" url="http://127.0.0.1:1111/demo":
	#!/usr/bin/env bash
	ZTC_NAME=$(basename '{{ path }}')
	{{ browser }} --headless --disable-gpu --screenshot="static/screenshots/temp.png" \
		--window-size=1400,936 --hide-scrollbars "{{ url }}/${ZTC_NAME}"
	magick static/screenshots/temp.png -gravity north -crop '1360x765+0+0' "static/screenshots/{{ mode }}-${ZTC_NAME}.png"
	rm -f static/screenshots/temp.png
	mat2 --inplace "static/screenshots/{{ mode }}-${ZTC_NAME}.png"
