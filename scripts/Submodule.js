export class Submodule {
	path; // e.g. themes/NAME
	url; // e.g. https://codeberg.org/NAME/NAME.git
	branch; // e.g. main
	ignore; // e.g. dirty
	color; // e.g. both | light | dark
	zola; // e.g. 0.0.0
	link; // e.g. https://codeberg.org/NAME/NAME.git

	isTheme() {
		return this.color != undefined;
	}

	setValue(key, value) {
		if (!Object.hasOwn(this, key)) {
			throw new Error(`Invalid key: ${key}`);
		}
		this[key] = value;
	}
}
