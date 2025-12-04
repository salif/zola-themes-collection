let matrixInterval = null;

function toggleMatrix() {
    // 1. If Matrix is already running, stop it and remove the canvas
    const existingCanvas = document.getElementById('cmatrix-canvas');
    if (existingCanvas) {
        clearInterval(matrixInterval);
        existingCanvas.remove();
        document.body.style.overflow = ''; // Restore scrolling
        return;
    }

    // 2. Setup Canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'cmatrix-canvas';
    
    // Style: Fixed, Full Screen, On Top of Everything
    Object.assign(canvas.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        zIndex: '999999', // Higher than everything
        background: 'black',
        pointerEvents: 'none' // Let clicks pass through if needed (optional)
    });

    document.body.appendChild(canvas);
    document.body.style.overflow = 'hidden'; // Stop scrolling while in Matrix

    const ctx = canvas.getContext('2d');

    // 3. Resize Logic
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // 4. Matrix Characters (Katakana + Latin)
    const chars = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const charArray = chars.split('');

    const fontSize = 16;
    const columns = canvas.width / fontSize; 
    
    // Array to track the y-coordinate of each column
    const drops = [];
    for (let x = 0; x < columns; x++) {
        drops[x] = 1;
    }

    // 5. Draw Function
    function draw() {
        // Black BG with slight opacity to create the "trail" effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Green Text (Bold for -b style)
        ctx.fillStyle = '#0F0'; 
        ctx.font = 'bold ' + fontSize + 'px monospace';

        for (let i = 0; i < drops.length; i++) {
            const text = charArray[Math.floor(Math.random() * charArray.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            // Randomly reset drop to top
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    // 6. Run Loop (30 FPS)
    matrixInterval = setInterval(draw, 33);
    
    // Resize listener
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}
