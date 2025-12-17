document.addEventListener("DOMContentLoaded", () => {
    // --- QUICK VIEW LOGIC ---
    const modal = document.getElementById('qv-modal');
    const overlay = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('qv-content');
    const closeBtn = document.querySelector('.close-btn');

    document.querySelectorAll('.quick-view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const content = e.target.closest('.blog-card').querySelector('.hidden-content').innerHTML;
            modalContent.innerHTML = content;
            modal.classList.add('active');
            overlay.classList.add('active');
        });
    });

    const closeModal = () => {
        modal.classList.remove('active');
        overlay.classList.remove('active');
    };

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);

    // --- WALKTHROUGH LOGIC ---
    // This allows buttons to take control of the scroll
    window.startWalkthrough = async function (speed = 1) {
        const docHeight = document.body.scrollHeight;
        const viewHeight = window.innerHeight;
        let currentScroll = window.scrollY;

        // Disable user interaction during walkthrough (optional)
        document.body.style.overflow = 'hidden';

        const step = 2 * speed;
        const intervalTime = 20;

        const scrollInterval = setInterval(() => {
            currentScroll += step;
            window.scrollTo(0, currentScroll);

            // Detect if we hit specific elements to "pause" and read
            // In a real implementation, you'd check element positions relative to viewport

            // Stop at bottom
            if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
                clearInterval(scrollInterval);
                setTimeout(() => {
                    // Return to top
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    document.body.style.overflow = 'auto';
                }, 2000);
            }
        }, intervalTime);

        // Allow user to cancel by clicking anywhere

        // Allow user to cancel by clicking anywhere
        // We use setTimeout to ensure the current 'click' event (that triggered this function)
        // has finished bubbling/propagation before we start listening for the cancel click.
        setTimeout(() => {
            document.addEventListener('click', function cancel() {
                clearInterval(scrollInterval);
                document.body.style.overflow = 'auto';
                document.removeEventListener('click', cancel);
            }, { once: true });
        }, 100);
    };
});