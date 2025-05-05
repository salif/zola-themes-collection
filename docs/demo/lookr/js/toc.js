/**
 * Dynamic Table of Contents for Zola blogs
 * This script automatically generates a TOC from headings in the content,
 * adds smooth scrolling, and highlights the current section while scrolling.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Only run if we have a TOC container
    const tocContainer = document.getElementById('table-of-contents');
    if (!tocContainer) {
      console.log("TOC container not found");
      return;
    }
  
    console.log("TOC script running"); // Debugging
  
    // 1. Generate the table of contents
    generateTableOfContents();
    
    // 2. Set up intersection observer for active state
    setupIntersectionObserver();
    
    // 3. Handle window resize events
    handleResponsiveLayout();
  });
  
  /**
   * Scans the content for headings and builds the TOC structure
   */
  function generateTableOfContents() {
    const tocContainer = document.getElementById('table-of-contents');
    // Look for headings in the article content
    const contentArea = document.querySelector('article');
    
    if (!contentArea) {
      console.error("Content area not found"); // Debugging
      return;
    }
    
    const headings = contentArea.querySelectorAll('h2, h3, h4');
    
    console.log(`Found ${headings.length} headings`); // Debugging
    
    if (headings.length === 0) {
      const tocParent = document.getElementById('toc-container');
      if (tocParent) tocParent.style.display = 'none';
      return;
    } else {
      // Make sure TOC is visible if we have headings
      const tocParent = document.getElementById('toc-container');
      if (tocParent) tocParent.classList.remove('hidden');
    }
    
    let currentList = document.createElement('ul');
    currentList.className = 'space-y-2 text-gray-700';
    tocContainer.appendChild(currentList);
    
    let prevLevel = 0; // Initialize to 0 to handle first heading correctly
    let lists = [currentList]; // Stack to keep track of nested lists
    let sectionLists = {}; // Keep track of section lists for collapsible behavior
    
    // Process each heading
    headings.forEach(heading => {
      // Make sure headings have IDs for linking
      if (!heading.id) {
        heading.id = heading.textContent.trim()
          .toLowerCase()
          .replace(/[^\w\s-]/g, '') // Remove special chars
          .replace(/\s+/g, '-'); // Replace spaces with hyphens
      }
      
      // Get heading level (2 for h2, 3 for h3, etc.)
      const level = parseInt(heading.tagName[1]);
      
      // For the first heading, set prevLevel to this level
      if (prevLevel === 0) prevLevel = level;
      
      // Create TOC item
      const listItem = document.createElement('li');
      
      // Apply different styling based on heading level
      if (level === 2) {
        listItem.className = 'toc-h2 mt-2';
      } else if (level === 3) {
        listItem.className = 'toc-h3 pl-4 mt-1 text-sm hidden'; // Start hidden
      } else {
        listItem.className = 'toc-h4 pl-6 mt-1 text-xs hidden'; // Start hidden
      }
      
      // Clean the heading text - remove hashtags from start and end
      let headingText = heading.textContent.trim();
      // Remove hashtags from the beginning of the heading
      headingText = headingText.replace(/^#+\s*/, '');
      // Remove hashtags from the end of the heading
      headingText = headingText.replace(/\s*#+$/, '');
      
      // Create link
      const link = document.createElement('a');
      link.href = `#${heading.id}`;
      link.textContent = headingText;
      link.className = 'toc-link hover:text-orange-500 transition-colors duration-200';
      link.dataset.target = heading.id;
      link.dataset.level = level;
      
      // Add smooth scroll behavior
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetEl = document.getElementById(heading.id);
        if (targetEl) {
          targetEl.scrollIntoView({
            behavior: 'smooth'
          });
          
          // Update URL without full page reload
          history.pushState(null, null, `#${heading.id}`);
        }
      });
      
      listItem.appendChild(link);
      
      // Handle list nesting
      if (level > prevLevel) {
        // Create a nested list
        const nestedList = document.createElement('ul');
        nestedList.className = 'pl-2 space-y-1 nested-toc';
        
        // Only append if there's a last child
        if (lists[lists.length - 1].lastChild) {
          lists[lists.length - 1].lastChild.appendChild(nestedList);
          
          // Store reference to the list for this section if it's an h2->h3 transition
          if (level === 3 && prevLevel === 2) {
            // Get the parent heading ID
            const parentLink = lists[lists.length - 1].lastChild.querySelector('a');
            if (parentLink) {
              sectionLists[parentLink.dataset.target] = nestedList;
            }
          }
          
          lists.push(nestedList);
          currentList = nestedList;
        }
      } else if (level < prevLevel) {
        // Go back to parent list
        const steps = prevLevel - level;
        for (let i = 0; i < steps && lists.length > 1; i++) {
          lists.pop();
        }
        currentList = lists[lists.length - 1];
      }
      
      currentList.appendChild(listItem);
      prevLevel = level;
    });
    
    // Hide TOC container if no TOC was generated
    if (tocContainer.querySelector('ul').children.length === 0) {
      const tocParent = document.getElementById('toc-container');
      if (tocParent) tocParent.style.display = 'none';
    }
  }
  
  /**
   * Sets up intersection observer to highlight current section in TOC
   * and control visibility of subsections
   */
  function setupIntersectionObserver() {
    // Find all heading elements in the content
    const contentArea = document.querySelector('article');
    if (!contentArea) return;
    
    const headingElements = contentArea.querySelectorAll('h2, h3, h4');
    const tocLinks = document.querySelectorAll('.toc-link');
    
    if (headingElements.length === 0 || tocLinks.length === 0) return;
    
    // Options for the observer
    const options = {
      root: null, // Use the viewport
      rootMargin: '-100px 0px -70% 0px', // Consider element visible when it's in the top part of viewport
      threshold: 0
    };
    
    // Callback function for the observer
    const callback = (entries) => {
      let foundActive = false;
      
      // Process visible headings
      entries.forEach(entry => {
        const targetId = entry.target.id;
        const targetLink = document.querySelector(`.toc-link[data-target="${targetId}"]`);
        
        if (!targetLink) return;
        
        const level = parseInt(targetLink.dataset.level);
        
        if (entry.isIntersecting && !foundActive) {
          foundActive = true;
          
          // Remove active class from all links
          tocLinks.forEach(link => {
            link.classList.remove('active');
          });
          
          // Add active class to the current link
          targetLink.classList.add('active');
          
          // Show/hide subsections based on current heading
          if (level === 2) {
            // Hide all subsections first
            document.querySelectorAll('.toc-h3, .toc-h4').forEach(item => {
              item.classList.add('hidden');
            });
            
            // Show subsections for this h2
            const h3Items = document.querySelectorAll(`.toc-link[data-target="${targetId}"] ~ ul .toc-h3`);
            h3Items.forEach(item => {
              item.classList.remove('hidden');
            });
            
            // Also show siblings of the current h2 section
            const h2Items = document.querySelectorAll('.toc-h2');
            h2Items.forEach(item => {
              item.classList.remove('hidden');
            });
          } else if (level === 3) {
            // Show this h3's parent h2's subsections
            let parentH2 = targetLink.closest('li').parentElement;
            while (parentH2 && !parentH2.querySelector('.toc-h2')) {
              parentH2 = parentH2.parentElement;
            }
            
            if (parentH2) {
              const h3Items = parentH2.querySelectorAll('.toc-h3');
              h3Items.forEach(item => {
                item.classList.remove('hidden');
              });
            }
            
            // Show h4 items under this h3
            const h4Items = document.querySelectorAll(`.toc-link[data-target="${targetId}"] ~ ul .toc-h4`);
            h4Items.forEach(item => {
              item.classList.remove('hidden');
            });
          }
        }
      });
      
      // If scrolled to the top, show only h2
      if (window.scrollY < 50) {
        document.querySelectorAll('.toc-h3, .toc-h4').forEach(item => {
          item.classList.add('hidden');
        });
      }
      
      // If no entry is intersecting but we scrolled past all sections,
      // set the last link as active
      if (!foundActive && entries.some(entry => entry.boundingClientRect.top < 0)) {
        tocLinks.forEach(link => {
          link.classList.remove('active');
        });
        
        if (tocLinks.length > 0) {
          tocLinks[tocLinks.length - 1].classList.add('active');
        }
      }
    };
    
    // Create and start the observer
    const observer = new IntersectionObserver(callback, options);
    headingElements.forEach(element => {
      observer.observe(element);
    });
  }
  
  /**
   * Handles responsive behavior of the TOC
   */
  function handleResponsiveLayout() {
    const tocContainer = document.getElementById('toc-container');
    if (!tocContainer) return;
    
    // Check on load and on resize
    function checkWidth() {
      if (window.innerWidth < 1024) { // lg breakpoint in Tailwind
        tocContainer.classList.add('hidden');
      } else {
        tocContainer.classList.remove('hidden');
      }
    }
    
    // Initial check
    checkWidth();
    
    // Listen for window resize
    window.addEventListener('resize', checkWidth);
  }