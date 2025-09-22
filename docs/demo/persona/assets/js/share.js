(function() {
  "use strict";

  // --- Main Component Object ---
  const ShareButton = {
      // Cache DOM elements for performance
      elements: {},

      // Initialize the component
      init() {
          // Find all necessary elements first
          this.elements.button = document.getElementById('share-button');
          this.elements.menu = document.getElementById('share-menu');
          
          // If the core components don't exist on this page, do nothing.
          if (!this.elements.button || !this.elements.menu) {
              return;
          }
          
          // Cache the share link
          this.elements.link = document.getElementById('share-link')

          console.log('Share button component initialized.');

          this.bindEvents();
      },
      
      // Set up all event listeners
      bindEvents() {
          // Toggle menu on button click
          this.elements.button.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              this.toggleMenu();
          });

          // Handle the copy link action
          this.elements.link.addEventListener('click', (e) => {
              e.preventDefault();
              this.copyLink();
          });
      },
      
      // Toggle the menu's visibility and manage the "click outside" listener
      toggleMenu() {
          const isActive = this.elements.menu.classList.toggle('active');
          
          if (isActive) {
              // If menu was opened, listen for clicks outside to close it
              // We bind `this` to ensure `closeMenu` can access the component's elements
              document.addEventListener('click', this.closeMenuOnClickOutside.bind(this), { once: true });
          }
      },
      
      // Handler to close the menu if a click occurs outside of it
      closeMenuOnClickOutside(event) {
          if (!this.elements.menu.contains(event.target) && event.target !== this.elements.button) {
              this.elements.menu.classList.remove('active');
          }
      },
      
      // Handle the clipboard copy action and visual feedback
      copyLink() {
          const urlToCopy = window.location.href;
          const copyButton = this.elements.link;
          const feedbackSpan = copyButton.querySelector('span');
          const originalText = feedbackSpan.textContent;

          // --- Clipboard Logic ---
          const copyToClipboard = (text) => {
              if (navigator.clipboard) {
                  navigator.clipboard.writeText(text).catch(err => {
                      console.error('Modern copy failed:', err);
                  });
              } else {
                  // Fallback for older browsers
                  const textArea = document.createElement('textarea');
                  textArea.value = text;
                  textArea.style.position = 'fixed';
                  textArea.style.left = '-9999px';
                  document.body.appendChild(textArea);
                  textArea.select();
                  try {
                      document.execCommand('copy');
                  } catch (err) {
                      console.error('Fallback copy failed:', err);
                  }
                  document.body.removeChild(textArea);
              }
          };
          
          copyToClipboard(urlToCopy);

          // --- Visual Feedback ---
          feedbackSpan.textContent = 'Copied!';
          copyButton.classList.add('active'); // Use a class for active state
          
          setTimeout(() => {
              feedbackSpan.textContent = originalText;
              copyButton.classList.remove('active');
              this.elements.menu.classList.remove('active');
          }, 1500);
      }
  };

  // Initialize the component only after the DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
      ShareButton.init();
  });

})();