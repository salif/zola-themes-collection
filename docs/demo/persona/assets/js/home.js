(function() {
  "use strict";

  /**
   * ------------------------------------------------------------------------
   * Configuration Object
   * ------------------------------------------------------------------------
   */
  const CONFIG = {
    preloader: {
      selector: '#preloader'
    },
    aos: {
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    },
    typed: {
      selector: '.typed',
      attribute: 'data-typed-items',
      options: {
        loop: true,
        typeSpeed: 100,
        backSpeed: 50,
        backDelay: 2000
      }
    },
    navigation: {
      header: '#header',
      toggleBtn: '.nav-toggle',
      navmenu: '#navmenu',
      dropdownToggle: '.navmenu .toggle-dropdown',
      scrollOffset: 200
    },
    scrollTop: {
      selector: '.scroll-top',
      threshold: 100
    },
    contactForm: {
      selector: '.contact-form',
      loading: '.loading',
      errorMessage: '.error-message',
      sentMessage: '.sent-message',
      submitButton: 'button[type="submit"]',
      hideMessageDelay: 3000
    }
  };

  /**
   * ------------------------------------------------------------------------
   * Application Module
   * ------------------------------------------------------------------------
   */
  const App = {
    /**
     * Initializes all necessary components and libraries.
     */
    init() {
      // The 'load' event is used specifically for the preloader.
      // Other scripts depending only on the DOM can be run on 'DOMContentLoaded'.
      this.initPreloader();

      // Firing events on DOMContentLoaded is generally faster than 'load'.
      document.addEventListener('DOMContentLoaded', () => {
        this.initAOS();
        this.initTyped();
        this.initNavigation();
        this.initScrollTop();
        this.initContactForm();
        // Future initializations can be added here easily.
        // e.g., this.initSwiper();
      });

      // Initialize scroll-dependent features on load
      window.addEventListener('load', () => {
        this.initNavmenuScrollspy();
      });

      // Initialize scroll event listeners
      this.initScrollEvents();
    },
    
    /**
    * Handles the removal of the preloader screen once the page is fully loaded.
    */
    initPreloader() {
      const preloader = document.querySelector(CONFIG.preloader.selector);
      if (preloader) {
        window.addEventListener('load', () => {
          preloader.remove();
        });
      }
    },

    /**
     * Initializes the Animate On Scroll (AOS) library with options from CONFIG.
     */
    initAOS() {
      // Check if AOS is defined to avoid errors if the library fails to load.
      if (typeof AOS !== 'undefined') {
        AOS.init(CONFIG.aos);
      } else {
        console.warn('AOS library not found.');
      }
    },

    /**
     * Finds and initializes all Typed.js instances on the page.
     * This version handles multiple '.typed' elements gracefully.
     */
    initTyped() {
      // Check if Typed is defined.
      if (typeof Typed === 'undefined') {
        console.warn('Typed.js library not found.');
        return;
      }

      const typedElements = document.querySelectorAll(CONFIG.typed.selector);
      if (!typedElements.length) {
        return; // No elements to initialize, exit quietly.
      }

      typedElements.forEach(element => {
        const strings = element.getAttribute(CONFIG.typed.attribute);

        // If the data attribute is missing or empty, skip this element.
        if (!strings) {
          console.warn(`Typed.js target element is missing the '${CONFIG.typed.attribute}' attribute.`, element);
          return;
        }

        new Typed(element, {
          strings: strings.split(','),
          ...CONFIG.typed.options // Use spread syntax for clean option merging
        });
      });
    },

    /**
     * Initializes navigation functionality including mobile toggle and dropdowns.
     */
    initNavigation() {
      this.initHeaderToggle();
      this.initNavmenuLinks();
      this.initDropdownToggles();
    },

    /**
     * Sets up the mobile navigation toggle functionality.
     */
    initHeaderToggle() {
      const headerToggleBtn = document.querySelector(CONFIG.navigation.toggleBtn);
      const header = document.querySelector(CONFIG.navigation.header);

      if (!headerToggleBtn || !header) {
        return;
      }

      const toggleHeader = () => {
        header.classList.toggle('navmenu-show');
        headerToggleBtn.classList.toggle('bi-list');
        headerToggleBtn.classList.toggle('bi-x');
      };

      headerToggleBtn.addEventListener('click', toggleHeader);

      // Store reference for potential cleanup
      this.headerToggle = toggleHeader;
    },

    /**
     * Sets up navigation menu links to close mobile nav on click.
     */
    initNavmenuLinks() {
      const navmenuLinks = document.querySelectorAll(`${CONFIG.navigation.navmenu} a`);
      const header = document.querySelector(CONFIG.navigation.header);

      if (!navmenuLinks.length || !header) {
        return;
      }

      navmenuLinks.forEach(link => {
        link.addEventListener('click', () => {
          if (header.classList.contains('navmenu-show') && this.headerToggle) {
            this.headerToggle();
          }
        });
      });
    },

    /**
     * Sets up dropdown toggle functionality for navigation submenus.
     */
    initDropdownToggles() {
      const dropdownToggles = document.querySelectorAll(CONFIG.navigation.dropdownToggle);

      dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
          e.preventDefault();
          this.parentNode.classList.toggle('active');
          this.parentNode.nextElementSibling.classList.toggle('dropdown-active');
          e.stopImmediatePropagation();
        });
      });
    },

    /**
     * Initializes scroll-to-top button functionality.
     */
    initScrollTop() {
      const scrollTopBtn = document.querySelector(CONFIG.scrollTop.selector);

      if (!scrollTopBtn) {
        return;
      }

      // Handle click event
      scrollTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });

      // Store reference for scroll event handler
      this.scrollTopBtn = scrollTopBtn;
    },

    /**
     * Initializes contact form submission handling.
     */
    initContactForm() {
      const form = document.querySelector(CONFIG.contactForm.selector);
      if (!form) {
        return;
      }

      const loading = form.querySelector(CONFIG.contactForm.loading);
      const errorMessage = form.querySelector(CONFIG.contactForm.errorMessage);
      const sentMessage = form.querySelector(CONFIG.contactForm.sentMessage);
      const submitButton = form.querySelector(CONFIG.contactForm.submitButton);

      function hideAllMessages() {
        loading.classList.remove('show');
        errorMessage.classList.remove('show');
        sentMessage.classList.remove('show');
      }

      function showLoading() {
        hideAllMessages();
        loading.classList.add('show');
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
      }

      function showSuccess() {
        hideAllMessages();
        sentMessage.classList.add('show');
        submitButton.disabled = false;
        submitButton.textContent = 'Send Message';
        form.reset();
        setTimeout(hideAllMessages, CONFIG.contactForm.hideMessageDelay);
      }

      function showError(message) {
        hideAllMessages();
        errorMessage.textContent = message || 'Something went wrong. Please try again.';
        errorMessage.classList.add('show');
        submitButton.disabled = false;
        submitButton.textContent = 'Send Message';
        setTimeout(hideAllMessages, CONFIG.contactForm.hideMessageDelay);
      }

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        showLoading();

        try {
          const formData = new FormData(form);
          const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: formData
          });

          const result = await response.json();

          if (response.ok && result.success) {
            showSuccess();
          } else {
            showError(result.message);
          }
        } catch (error) {
          console.error('Form submission error:', error);
          showError('Network error. Please check your connection.');
        }
      });
    },

    /**
     * Initializes navigation scrollspy functionality.
     */
    initNavmenuScrollspy() {
      const navmenuLinks = document.querySelectorAll(`${CONFIG.navigation.navmenu} a`);

      if (!navmenuLinks.length) {
        return;
      }

      const updateActiveNavLink = () => {
        navmenuLinks.forEach(link => {
          if (!link.hash) return;
          
          const section = document.querySelector(link.hash);
          if (!section) return;
          
          const position = window.scrollY + CONFIG.navigation.scrollOffset;
          const sectionTop = section.offsetTop;
          const sectionBottom = sectionTop + section.offsetHeight;
          
          if (position >= sectionTop && position <= sectionBottom) {
            // Remove active class from all links
            document.querySelectorAll(`${CONFIG.navigation.navmenu} a.active`)
              .forEach(activeLink => activeLink.classList.remove('active'));
            // Add active class to current link
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      };

      // Store reference for scroll event handler
      this.navmenuScrollspy = updateActiveNavLink;
    },

    /**
     * Initializes scroll event handlers.
     */
    initScrollEvents() {
      const handleScroll = () => {
        this.toggleScrollTopVisibility();
        if (this.navmenuScrollspy) {
          this.navmenuScrollspy();
        }
      };

      // Add scroll event listeners
      window.addEventListener('load', handleScroll);
      document.addEventListener('scroll', handleScroll);
    },

    /**
     * Toggles scroll-to-top button visibility based on scroll position.
     */
    toggleScrollTopVisibility() {
      if (this.scrollTopBtn) {
        if (window.scrollY > CONFIG.scrollTop.threshold) {
          this.scrollTopBtn.classList.add('active');
        } else {
          this.scrollTopBtn.classList.remove('active');
        }
      }
    }
  };

  // Start the application
  App.init();

})();