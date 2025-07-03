# Zola Themes Collection

[A curated directory of themes for Zola](https://salif.github.io/zola-themes-collection/)

## Theme requirements

- Have a `config.toml` or `config.example.toml` file. Can be on a separate repository.
- Have a `theme.toml` file or `themes/theme-name/theme.toml` file.
- Building is successful using the latest Zola version (0.20.0).

## Non-eligible themes

### Build failed

- [DeepThought](https://github.com/RatanShreshtha/DeepThought): 153 commits: `unknown field generate_feed`
- [zola-inky](https://github.com/jimmyff/zola-inky): 30 commits: `unknown field images`
- [halve-z](https://github.com/charlesrocket/halve-z): 553 commits: `.git/HEAD doesn't exist`
- [apocalisse-peluche](https://github.com/lanzani/apocalisse-peluche): 37 commits: `Undefined operation`
- [zola-clean-blog](https://github.com/dave-tucker/zola-clean-blog): 12 commits: `unknown field generate_rss`
- [re137](https://github.com/tinikov/zola-theme-re137): 17 commits: `style.css doesn't exist`
- [butler](https://github.com/shalzz/butler): 108 commits: `critical.css doesn't exist`
- [polymathic](https://github.com/anvlkv/polymathic): 95 commits: `config.toml not found`
- [tranquil](https://github.com/TeaDrinkingProgrammer/tranquil): 298 commits: `unknown field generate_feed`
- [hermit_zola](https://github.com/VersBinarii/hermit_zola): 66 commits: `unknown field highlight_code`
- [hayflow](https://github.com/aaw3/hayflow): 19 commits: `variable not found`
- [stardust-theme](https://github.com/UWCS/stardust-theme): 269 commits: `config.toml not found`
- [zola-metro](https://github.com/RedstoneParadox/zola-metro): 30 commits: `unknown field generate_feed`
- [sigmund](https://github.com/videah/sigmund): 45 commits: `unknown field generate_feed`
- [zola-pickles](https://github.com/lukehsiao/zola-pickles): 94 commits: `failed to render youtube shortcode`
- [archie-zola](https://github.com/XXXMrG/archie-zola): 59 commits: `unknown field path`
- [archie-zola-modified](https://codeberg.org/akselmo/archie-zola-modified): 71 commits: `unknown field path`
- [arsmateria-zola-theme](https://github.com/mboleary/arsmateria-zola-theme): 19 commits: `unknown field highlight_code`
- [snow-kitty](https://codeberg.org/SnowCode/snow-kitty): 94 commits: `unknown field generate_feed`
- [zola-academic](https://github.com/zola-academic/zola-academic): 85 commits: `unknown field highlight_code`
- [zola-paper](https://github.com/schoenenberg/zola-paper): 15 commits: `unknown field highlight_code`
- [citrus](https://github.com/tatumroaquin/citrus): 93 commits: `sun.svg doesn't exist`
- [datum](https://github.com/davidmreed/datum): 16 commits: `config.toml not found`
- [seagull](https://git.lacontrevoie.fr/HugoTrentesaux/seagull): 16 commits: `can't find stylesheet to import`
- [navhive](https://github.com/idevsig/navhive): 13 commits: `failed to open file theme.toml`
- [Neutral-Zola-Theme](https://github.com/gfauredev/Neutral-Zola-Theme): 144 commits: `tried to iterate`
- [izy-zola](https://github.com/VV0JC13CH/izy-zola): 127 commits: `config.toml not found`
- [2020_dt](https://github.com/0xSbock/2020_dt): 47 commits: `unknown field highlight_code`
- [Ergo](https://github.com/insipx/Ergo): 115 commits: `unknown field highlight_theme`
- [boring](https://github.com/clflushopt/boring): 70 commits: `archived`
- [rahix](https://github.com/Rahix/blog-theme): 88 commits: `unknown field highlight_code`
- [kireizola](https://codeberg.org/pitbuster/kireizola): 43 commits: `archived`
- [cblanken-terminimal](https://github.com/cblanken/zola-theme-terminimal): 174 commits:  `variable not found`
- [anpu-zola-theme](https://github.com/zbrox/anpu-zola-theme): 30 commits: `unknown field highlight_code`
- [zola-devin](https://github.com/seankearney/zola-devin): 36 commits: `cannot find file`
- [zerm](https://github.com/ejmg/zerm): 76 commits: `unknown field generate_feed`
- [zola.386](https://github.com/lopes/zola.386): 26 commits: `unknown field highlight_code`
- [papaya](https://github.com/justint/papaya): 62 commits: `unknown field generate_feed`
- [zola-solarized](https://github.com/komputerwiz/zola-solarized): 2 commits: `config.toml not found`
- [lightspeed](https://github.com/carpetscheme/lightspeed): 37 commits: `style.css doesn't exist`
- [zolanote](https://github.com/ghventix/zolanote): 1 commit: `can't find stylesheet to import`
- [ametrine](https://codeberg.org/daudix/ametrine): 200 commits: `filter call 'urlencode' failed`
- [lookr](https://github.com/m0ddr/lookr): 12 commits: `base.css doesn't exist`
- [tlachtga](https://github.com/puppy-witch/tlachtga-theme): 9 commits: `unknown field highlight_code`
- [mintec-zola-theme](https://github.com/Coffeeri/mintec-zola-theme): 9 commits: `config.toml not found`
- [hayakuchi](https://github.com/deepcodesoln/hayakuchi): 10 commits: `Section 'blog/_index.md' not found`
- [zola-theme-brief](https://github.com/w4ngzhen/zola-theme-brief.git): 2 commits: `config.toml not found`

In addition to the usual causes, build may also fail if the theme uses `load_data` from `public` directory (my scripts use a different name) or `.git/HEAD` (not available in the submodule directory).

### Broken links if base url contains a subpath

- [zolarwind](https://github.com/thomasweitzel/zolarwind): 76 commits
- [blow](https://github.com/tchartron/blow): 472 commits
- [feather](https://github.com/piedoom/feather): 81 commits
- [slightknack](https://github.com/slightknack/slightknack.dev): 230 commits
- [norwind](https://github.com/nobodygx/norwind): 12 commits
- [zola-nomad-theme](https://github.com/nomad-dev-writer/zola-nomad-theme): 26 commits
- [cosmic__cube](https://github.com/ccarral/cosmic__cube): 56 commits
- [jiaxiang.wang](https://github.com/iWangJiaxiang/zola-theme-jiaxiang.wang): 35 commits
- [Homepage-Creators](https://github.com/iWangJiaxiang/Homepage-Creators): 6 commits
- [anemone](https://github.com/Speyll/anemone): 62 commits
- [book-shelf](https://github.com/anccnuer/book-shelf): 5 commits
- [zola-aurora](https://github.com/vimpostor/zola-aurora): 86 commits
- [zola-folio](https://github.com/evjrob/zola-folio): 50 commits
- [fl1tzi-com-theme](https://codeberg.org/Fl1tzi/fl1tzi-com-theme): 13 commits
- [zizotto](https://github.com/xihn/zizotto): 12 commits
- [Baie](https://github.com/Wtoll/Baie): 7 commits
- [zola-theme](https://github.com/rutrum/zola-theme): 16 commits
- [portfolio-starter-kit](https://github.com/roblesch/portfolio-starter-kit): 4 commits
- [cablab-theme](https://codeberg.org/cablab/cablab-theme): 8 commits
- [zola-scribble](https://github.com/jzbor/zola-scribble): 24 commits
- [zola-theme-by-g](https://github.com/akshithg/zola-theme-by-g): 8 commits
- [neovim-theme](https://github.com/Super-Botman/neovim-theme): 71 commits
- [ennui](https://codeberg.org/leana8959/ennui): 41 commits
- [doc_zola_theme](https://github.com/ProPixelizer/doc_zola_theme): 62 commits
- [simple_zola](https://codeberg.org/murtezayesil/simple_zola): 5 commits
- [no-style-please](https://github.com/atgumx/no-style-please): 26 commits
- [basic-infosite](https://codeberg.org/lukaskluge/basic-infosite): 118 commits
- [carbon](https://github.com/nik-rev/carbon.git): 274 commits

### No license that allows me to host a live demo

- [attention](https://github.com/tongyul/attention-theme-zola): 19 commits
- [bare-room](https://github.com/ghrrlp/bare-room): 2 commits
- [zola-es-theme](https://github.com/scouten/zola-es-theme): 252 commits

### Other

- [juice](https://github.com/huhu/juice): 73 commits
- [bluetheme](https://github.com/bluerobotics/bluetheme): 28 commits
- [bd](https://github.com/flabbergastedbd/bd): 20 commits
- [eips-wg](https://github.com/bluerobotics/bluetheme): 503 commits
