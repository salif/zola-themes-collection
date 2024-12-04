#!/usr/bin/env -S just --justfile

just := just_executable() + " --justfile '" + justfile() + "'"

_:
    @{{ just }} --list --unsorted

build-check-all:
	find themes -mindepth 1 -maxdepth 1 | xargs -I {} sh -c "printf 'Building {}\n'; cd {}; zola build -o ZTC_PUBLIC || ( pwd | lolcat ); rm -rf ZTC_PUBLIC"

build-demo-all url='https://salif.github.io/zola-themes-collection/demo':
	find themes -mindepth 1 -maxdepth 1 | xargs -I {} {{ just }} build-demo '{}' '{{ url }}'

build-demo path url='https://salif.github.io/zola-themes-collection/demo':
	#!/usr/bin/env bash
	ZTC_DEMO_NAME=$(basename '{{ path }}')
	ZTC_DEMO=../../static/demo/"${ZTC_DEMO_NAME}"; 
	printf 'Building %s\n' "${ZTC_DEMO_NAME} and ${ZTC_DEMO}"
	cd '{{ path }}'
	rm -rf ZTC_PUBLIC "${ZTC_DEMO}";
	zola build -u "{{ url }}/${ZTC_DEMO_NAME}/" -o ZTC_PUBLIC && (mv ZTC_PUBLIC "${ZTC_DEMO}"; printf '*' > "${ZTC_DEMO}/.gitignore") || rm -rf ZTC_PUBLIC

rem-ztc-public-all:
	find themes -mindepth 1 -maxdepth 1 | xargs -I {} sh -c "rm -rf '{}/ZTC_PUBLIC'"

rem-demo-all:
	rm -rf static/demo/*
	touch static/demo/.gitkeep
