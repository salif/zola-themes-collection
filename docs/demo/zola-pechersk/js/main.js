// Mermaid.js conditional loading and rendering
let mmdElements = [];
let mmdHTML = [];
let mermaidLoaded = false;

function detectMermaidElements() {
	mmdElements = document.getElementsByClassName("mermaid");
	if (mmdElements.length > 0) {
		// Store original HTML content
		for (let i = 0; i < mmdElements.length; i++) {
			mmdHTML[i] = mmdElements[i].innerHTML;
		}
		return true;
	}
	return false;
}

function loadMermaidScript() {
	return new Promise((resolve, reject) => {
		if (mermaidLoaded) {
			resolve();
			return;
		}
		
		const script = document.createElement('script');
		script.src = '/js/mermaid.min.js';
		script.onload = () => {
			mermaidLoaded = true;
			resolve();
		};
		script.onerror = reject;
		document.head.appendChild(script);
	});
}

function mermaidRender(theme) {
	if (!mermaidLoaded || mmdElements.length === 0) {
		return;
	}
	
	if (theme == "dark") {
		initOptions = {
			startOnLoad: false,
			theme: "dark",
		};
	} else {
		initOptions = {
			startOnLoad: false,
			theme: "neutral",
		};
	}
	
	for (let i = 0; i < mmdElements.length; i++) {
		delete mmdElements[i].dataset.processed;
		mmdElements[i].innerHTML = mmdHTML[i];
	}
	
	mermaid.initialize(initOptions);
	mermaid.run();
}

async function initializeMermaid() {
	if (detectMermaidElements()) {
		try {
			await loadMermaidScript();
			
			// Determine initial theme
			const htmlElement = document.documentElement;
			const colorScheme = htmlElement.getAttribute('color-scheme');
			let effectiveTheme;
			
			if (colorScheme === 'dark') {
				effectiveTheme = 'dark';
			} else if (colorScheme === 'light') {
				effectiveTheme = 'light';
			} else {
				// Auto or no attribute - check system preference
				effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
			}
			
			mermaidRender(effectiveTheme);
		} catch (error) {
			console.error('Failed to load Mermaid.js:', error);
		}
	}
}

function setTheme(theme) {
	const htmlElement = document.documentElement;
	
	if (theme === 'auto') {
		// Remove the attribute to let CSS media queries handle it
		htmlElement.removeAttribute('color-scheme');
	} else {
		// Set explicit theme
		htmlElement.setAttribute('color-scheme', theme);
	}
	
	localStorage.setItem('theme', theme);
	
	// Handle mermaid re-rendering if needed (only if Mermaid is loaded)
	if (mermaidLoaded && mmdElements.length > 0) {
		let effectiveTheme;
		if (theme === 'auto') {
			effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
		} else {
			effectiveTheme = theme;
		}
		mermaidRender(effectiveTheme);
	}
}

function setFlavor(flavor) {
	const htmlElement = document.documentElement;
	htmlElement.setAttribute('flavor', flavor);
	localStorage.setItem('flavor', flavor);
}

function initializeCoreTheme() {
	const themeSwitcherEnabled = document.querySelector('.theme-switcher') !== null;
	
	if (themeSwitcherEnabled) {
		// Apply saved theme preferences from localStorage
		const savedTheme = localStorage.getItem('theme');
		const savedFlavor = localStorage.getItem('flavor');
		
		if (savedTheme) {
			setTheme(savedTheme);
		}
		if (savedFlavor) {
			setFlavor(savedFlavor);
		}
	} else {
		// When theme switcher is disabled, process config defaults
		// Fix color-scheme="auto" by removing attribute to let CSS media queries work
		const htmlElement = document.documentElement;
		const colorScheme = htmlElement.getAttribute('color-scheme');
		
		if (colorScheme === 'auto') {
			htmlElement.removeAttribute('color-scheme');
		}
	}
}

function initializeThemeSwitcherUI() {
	const themeButtons = document.querySelectorAll('[data-theme]');
	const flavorButtons = document.querySelectorAll('[data-flavor]');
	
	themeButtons.forEach(button => {
		button.addEventListener('click', () => {
			const theme = button.getAttribute('data-theme');
			setTheme(theme);
			updateActiveStates();
		});
	});
	
	flavorButtons.forEach(button => {
		button.addEventListener('click', () => {
			const flavor = button.getAttribute('data-flavor');
			setFlavor(flavor);
			updateActiveStates();
		});
	});
	
	updateActiveStates();
}

function updateActiveStates() {
	const savedTheme = localStorage.getItem('theme') || 'auto';
	const currentFlavor = document.documentElement.getAttribute('flavor') || 'monochrome';
	
	document.querySelectorAll('[data-theme]').forEach(button => {
		button.classList.toggle('active', button.getAttribute('data-theme') === savedTheme);
	});
	
	document.querySelectorAll('[data-flavor]').forEach(button => {
		button.classList.toggle('active', button.getAttribute('data-flavor') === currentFlavor);
	});
}

document.addEventListener('DOMContentLoaded', () => {
	// Always initialize core theme functionality
	initializeCoreTheme();
	
	// Initialize Mermaid.js only if needed
	initializeMermaid();
	
	// Only initialize theme switcher UI if it exists
	if (document.querySelector('.theme-switcher')) {
		initializeThemeSwitcherUI();
		initializeThemeSwitcherToggle();
	}
	
	
	// Listen for system theme changes when in auto mode
	window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
		const themeSwitcherEnabled = document.querySelector('.theme-switcher') !== null;
		const savedTheme = themeSwitcherEnabled ? localStorage.getItem('theme') : null;
		const htmlTheme = document.documentElement.getAttribute('color-scheme');
		
		// Only respond to system changes if:
		// 1. Theme switcher is enabled and saved theme is auto/null, OR
		// 2. Theme switcher is disabled and HTML theme is auto/null
		const shouldRespond = themeSwitcherEnabled 
			? (!savedTheme || savedTheme === 'auto')
			: (!htmlTheme || htmlTheme === 'auto');
			
		if (shouldRespond && mermaidLoaded && mmdElements.length > 0) {
			const effectiveTheme = e.matches ? 'dark' : 'light';
			mermaidRender(effectiveTheme);
		}
	});
});

function initializeThemeSwitcherToggle() {
	const switcher = document.getElementById('theme-switcher');
	const toggleButton = document.getElementById('theme-switcher-toggle');
	
	if (!switcher || !toggleButton) {
		return;
	}
	
	// Check if switcher should be hidden based on saved preference
	const isHidden = localStorage.getItem('theme-switcher-hidden') === 'true';
	if (isHidden) {
		switcher.classList.add('hidden');
	}
	
	// Add click event to toggle button
	toggleButton.addEventListener('click', () => {
		const isCurrentlyHidden = switcher.classList.contains('hidden');
		
		if (isCurrentlyHidden) {
			switcher.classList.remove('hidden');
			localStorage.setItem('theme-switcher-hidden', 'false');
		} else {
			switcher.classList.add('hidden');
			localStorage.setItem('theme-switcher-hidden', 'true');
		}
	});
}
