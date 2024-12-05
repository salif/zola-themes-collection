/*
Js script that allows you to have the ability to copy code blocks.
Built-in script for Zluinav which is distributed under the terms of the MIT License.
In Zluinav block, this is placed under extrafoot block.
*/
document.querySelectorAll("pre").forEach(pre => {
	const code_block = pre.querySelector("code"); // Check if <code> exists inside <pre>
	// Get the content (if there"s <code>, use it; otherwise, fallback to <pre>)
	const code_content = code_block ? code_block.textContent : pre.textContent;
	// Create a container to hold the language label, button, and the code block
	const container = document.createElement("div");
	// Extract the language from <pre>"s data-lang or <code>"s class
	let language = pre.getAttribute("data-lang");
	if (!language && code_block && code_block.className) {
		const match = code_block.className.match(/language-(\w+)/);
		language = match ? match[1] : "";
	}
	// If language is found, create and insert a language label
	if (language) {
		const lang_label = document.createElement("span");
		lang_label.textContent = `${language}`;
		container.appendChild(lang_label); // Add language label before the button
	}
	// Create the copy button
	const copy_button = document.createElement("button");
	const copy_text="Copy " + (language ? language + " " : "") + "code to clipboard";
	copy_button.textContent = copy_text;
	container.appendChild(copy_button); // Add the button to the container
	// Insert the container before the <pre> tag
	pre.parentNode.insertBefore(container, pre);
	container.appendChild(pre); // Add the pre inside the container
	// Copy functionality
	copy_button.addEventListener("click", () => {
		navigator.clipboard.writeText(code_content)
		.then(() => {
			copy_button.textContent = "Copied " + code_content.length + " characters";
			setTimeout(() => {
				copy_button.textContent = copy_text;
			}, 1500);
		})
		.catch(err => {
			console.error("Failed to copy: ", err);
		});
		});
});