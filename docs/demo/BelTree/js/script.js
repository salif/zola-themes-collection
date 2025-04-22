function changeTheme(themeNumber) {
            const body = document.body;
            const themeOptions = document.querySelectorAll('.theme-option');
            const themeIndicator = document.querySelector('.theme-indicator span');
            
            // Remove all theme classes from body
            body.className = body.className.replace(/\btheme-\d\b/, '');
            
            // Add selected theme class
            body.classList.add(`theme-${themeNumber}`);
            
            // Update active theme option
            themeOptions.forEach(option => {
                option.classList.remove('active');
            });
            document.querySelector(`.theme-option[data-theme="${themeNumber}"]`).classList.add('active');
            
            // Update theme indicator text
            const themeNames = {
                1: 'Deep Ocean',
                2: 'Mint Fresh',
                3: 'Sunset'
            };
            themeIndicator.textContent = `Theme: ${themeNames[themeNumber]}`;
        }
        
        // Create sparkles on click
        function createSparkle(e) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.style.left = `${e.clientX}px`;
            sparkle.style.top = `${e.clientY}px`;
            document.getElementById('sparkles-container').appendChild(sparkle);
            
            setTimeout(() => {
                sparkle.remove();
            }, 1500);
        }
        
        // Create fireflies
        function createFireflies() {
            const container = document.getElementById('fireflies-container');
            const count = 10;
            
            for (let i = 0; i < count; i++) {
                const firefly = document.createElement('div');
                firefly.className = 'firefly';
                
                // Random position at bottom of screen
                firefly.style.left = `${Math.random() * 100}vw`;
                firefly.style.bottom = '0';
                
                // Random delay and duration
                firefly.style.animationDelay = `${Math.random() * 10}s`;
                firefly.style.animationDuration = `${8 + Math.random() * 7}s`;
                
                container.appendChild(firefly);
            }
        }
        
        document.addEventListener('DOMContentLoaded', function() {
            changeTheme(1);
            createFireflies();
            
            document.addEventListener('click', createSparkle);
            
            // Add some random sparkles occasionally
            setInterval(() => {
                if (Math.random() > 0.7) {
                    const x = Math.random() * window.innerWidth;
                    const y = Math.random() * window.innerHeight;
                    createSparkle({ clientX: x, clientY: y });
                }
            }, 1000);
        });