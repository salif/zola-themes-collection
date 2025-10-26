/**
 * Lightweight Sidenotes System for Pechersk Theme
 * Optimized for minimal CPU usage while maintaining core functionality
 */
class SidenotesManager {
  constructor() {
    this.breakpoints = {
      mobile: 768,
      tablet: 1024
    };
    
    this.state = {
      currentLayout: this.getCurrentLayout(),
      processedSidenotes: new Set(),
      isInitialized: false,
      lastSide: null, // Track the last side used (explicit or auto)
      lastWasExplicit: false // Track if last sidenote was explicitly positioned
    };
    
    this.init();
  }
  
  init() {
    this.setupLightweightResponsive();
    this.processSidenotes();
    this.setupBasicInteractions();
    this.addBasicAriaLabels();
    this.state.isInitialized = true;
  }
  
  getCurrentLayout() {
    const width = window.innerWidth;
    if (width < this.breakpoints.mobile) return 'mobile';
    if (width < this.breakpoints.tablet) return 'tablet';
    return 'desktop';
  }
  
  setupLightweightResponsive() {
    // Use lightweight matchMedia instead of ResizeObserver
    const mobileQuery = window.matchMedia(`(max-width: ${this.breakpoints.mobile - 1}px)`);
    const tabletQuery = window.matchMedia(`(min-width: ${this.breakpoints.mobile}px) and (max-width: ${this.breakpoints.tablet - 1}px)`);
    
    const handleLayoutChange = () => {
      if (!this.state.isInitialized) return;
      
      const newLayout = this.getCurrentLayout();
      if (newLayout !== this.state.currentLayout) {
        this.state.currentLayout = newLayout;
        // Only re-process if switching between mobile and non-mobile
        if ((newLayout === 'mobile') !== (this.state.currentLayout === 'mobile')) {
          this.processSidenotes();
        }
      }
    };
    
    // Much lighter than ResizeObserver
    mobileQuery.addEventListener('change', handleLayoutChange);
    tabletQuery.addEventListener('change', handleLayoutChange);
  }
  
  
  processSidenotes() {
    const footnoteReferences = document.querySelectorAll('.footnote-reference a');
    
    footnoteReferences.forEach(reference => {
      const href = reference.getAttribute('href');
      if (!href) return;
      
      const footnoteId = href.substring(1);
      const footnote = document.getElementById(footnoteId);
      
      if (!footnote || this.state.processedSidenotes.has(footnoteId)) return;
      
      this.state.processedSidenotes.add(footnoteId);
      this.processSingleSidenote(reference, footnote, footnoteId);
    });
  }
  
  processSingleSidenote(reference, footnote, footnoteId) {
    const layout = this.state.currentLayout;
    
    switch (layout) {
      case 'mobile':
        this.setupMobileSidenote(reference, footnote, footnoteId);
        break;
      case 'tablet':
        this.setupTabletSidenote(reference, footnote, footnoteId);
        break;
      case 'desktop':
        this.setupDesktopSidenote(reference, footnote, footnoteId);
        break;
    }
  }
  
  setupMobileSidenote(reference, footnote, footnoteId) {
    // Mobile: inline footnotes with smooth scrolling
    reference.addEventListener('click', (e) => {
      requestAnimationFrame(() => {
        const targetFootnote = document.getElementById(footnoteId);
        if (targetFootnote) {
          targetFootnote.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
          
          // Add temporary focus indicator
          targetFootnote.classList.add('sidenote-highlighted');
          setTimeout(() => {
            targetFootnote.classList.remove('sidenote-highlighted');
          }, 2000);
        }
      });
    });
  }
  
  setupTabletSidenote(reference, footnote, footnoteId) {
    // Tablet: all sidenotes go to right side (CSS handles this)
    const paragraphElement = reference.closest('p');
    if (paragraphElement) {
      this.positionSidenote(paragraphElement, footnote, footnoteId, 'right');
    }
  }
  
  setupDesktopSidenote(reference, footnote, footnoteId) {
    // Desktop: intelligent auto-side positioning
    const paragraphElement = reference.closest('p');
    if (paragraphElement) {
      const side = this.determineOptimalSide(footnoteId);
      this.positionSidenote(paragraphElement, footnote, footnoteId, side);
    }
  }
  
  determineOptimalSide(footnoteId) {
    // Check for explicit left/right specification
    const hasExplicitLeft = footnoteId.includes('left');
    const hasExplicitRight = footnoteId.includes('right');
    
    let chosenSide;
    
    if (hasExplicitLeft) {
      chosenSide = 'left';
      this.state.lastWasExplicit = true;
    } else if (hasExplicitRight) {
      chosenSide = 'right';
      this.state.lastWasExplicit = true;
    } else {
      // Auto-side logic
      chosenSide = this.calculateAutoSide();
      this.state.lastWasExplicit = false;
    }
    
    // Update state
    this.state.lastSide = chosenSide;
    
    return chosenSide;
  }
  
  calculateAutoSide() {
    // If this is the first sidenote, start with right
    if (this.state.lastSide === null) {
      return 'right';
    }
    
    // If previous was explicit, go to opposite side
    if (this.state.lastWasExplicit) {
      return this.state.lastSide === 'left' ? 'right' : 'left';
    }
    
    // If previous was also auto, alternate
    return this.state.lastSide === 'left' ? 'right' : 'left';
  }
  
  
  positionSidenote(paragraphElement, footnote, footnoteId, side) {
    // Create relationship attributes
    const paragraphId = `ref-para-${footnoteId}`;
    paragraphElement.id = paragraphId;
    footnote.setAttribute('data-ref-paragraph', paragraphId);
    footnote.setAttribute('data-sidenote-side', side);
    
    // Apply side-specific ID modification for left side
    if (side === 'left' && !footnoteId.includes('left')) {
      // Change the ID to trigger left-side CSS by adding 'left' to the ID
      footnote.id = footnoteId + '-left';
    }
    
    // Insert sidenote in DOM
    paragraphElement.parentNode.insertBefore(footnote, paragraphElement);
    
    // Add debug info for development
    const isAuto = !footnoteId.includes('left') && !footnoteId.includes('right');
    console.log(`Sidenote ${footnoteId} (final ID: ${footnote.id}) positioned on ${side} side (auto: ${isAuto}, lastSide: ${this.state.lastSide}, lastWasExplicit: ${this.state.lastWasExplicit})`);
  }
  
  
  setupBasicInteractions() {
    // Lightweight hover interactions using CSS :hover (no JS needed)
    // Only add essential click handlers
    document.addEventListener('click', (e) => {
      const ref = e.target.closest('.footnote-reference a');
      if (ref && this.state.currentLayout === 'mobile') {
        this.handleMobileClick(ref, e);
      }
    });
  }
  
  handleMobileClick(reference, event) {
    const href = reference.getAttribute('href');
    if (!href) return;
    
    const footnoteId = href.substring(1);
    
    // Small delay for smooth scroll
    setTimeout(() => {
      const footnote = document.getElementById(footnoteId);
      if (footnote) {
        footnote.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 10);
  }
  
  
  // Minimal accessibility setup
  addBasicAriaLabels() {
    this.state.processedSidenotes.forEach(footnoteId => {
      const footnote = document.getElementById(footnoteId) || document.getElementById(footnoteId + '-left');
      if (footnote) {
        footnote.setAttribute('role', 'note');
      }
    });
  }
  
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new SidenotesManager();
}); 