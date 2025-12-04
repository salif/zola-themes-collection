 document.addEventListener("DOMContentLoaded", function () {
    // 1. Mobile Menu Toggle Logic
    const toggleButton = document.getElementById("toggle-toc");
    const tocSidebar = document.getElementById("toc-sidebar");
    if (toggleButton && tocSidebar) {
        toggleButton.addEventListener("click", function () {
            tocSidebar.classList.toggle("visible");
        });
    }

    // 2. Initialize Scroll Spy State
    // Check if user disabled it previously (Default: ON)
    let spyEnabled = localStorage.getItem("scroll-spy") !== "false"; 
    
    // 3. ScrollSpy Logic (Intersection Observer)
    const observer = new IntersectionObserver((entries) => {
        // If disabled by 's' key, do nothing
        if (!spyEnabled) return;

        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Clear active classes
                document.querySelectorAll('.toc-sidebar li').forEach(li => li.classList.remove('active'));
                
                // Find link matching the header
                const id = entry.target.getAttribute('id');
                const link = document.querySelector(`.toc-sidebar a[href="#${id}"]`);
                
                if (link) {
                    // Highlight the item
                    let parentLi = link.parentElement;
                    parentLi.classList.add('active');
                    
                    // Highlight the parent chapter too (Recursive expansion)
                    let grandParent = parentLi.parentElement.parentElement;
                    if (grandParent && grandParent.tagName === 'LI') {
                        grandParent.classList.add('active');
                    }
                }
            }
        });
    }, {
        // Trigger when header is near the top of the viewport
        rootMargin: "0px 0px -80% 0px" 
    });

    // Start observing headers
    document.querySelectorAll('.book-content h1, .book-content h2, .book-content h3').forEach((header) => {
        observer.observe(header);
    });

    // 4. LISTENER: Toggle Spy & Show Message
    window.addEventListener('toggle-scroll-spy', () => {
        spyEnabled = !spyEnabled;
        localStorage.setItem("scroll-spy", spyEnabled);
        
        const status = spyEnabled ? "ON" : "OFF";
        
        showToast(`Scroll Spy: ${status}`);
        
        // Cleanup visuals
        if (!spyEnabled) {
             document.querySelectorAll('.toc-sidebar li').forEach(li => li.classList.remove('active'));
        }
    });

    function showToast(text) {
        let existing = document.getElementById("status-toast");
        if (existing) existing.remove();

        let toast = document.createElement("div");
        toast.id = "status-toast";
        toast.innerText = text;
        
        Object.assign(toast.style, {
            position: "fixed",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            color: "white",
            padding: "10px 20px",
            borderRadius: "5px",
            zIndex: "10000",
            fontFamily: "sans-serif",
            fontSize: "14px",
            transition: "opacity 0.5s ease",
            opacity: "0"
        });

        document.body.appendChild(toast);

        requestAnimationFrame(() => toast.style.opacity = "1");

        setTimeout(() => {
            toast.style.opacity = "0";
            setTimeout(() => toast.remove(), 500);
        }, 2000);
    }
});

