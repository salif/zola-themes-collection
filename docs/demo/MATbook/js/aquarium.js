// inspired by https://github.com/cmatsuoka/asciiquarium/tree/master
// use https://www.asciiart.eu/animals/fish
let aquariumInterval = null;
let aquariumListeners = null;

function toggleAquarium() {
    const existingCanvas = document.getElementById('aquarium-canvas');
    if (existingCanvas) {
        clearInterval(aquariumInterval);

	if (aquariumListeners) {
            window.removeEventListener('keydown', aquariumListeners.down);
            window.removeEventListener('keyup', aquariumListeners.up);
        }
	
        existingCanvas.remove();
        document.body.style.overflow = '';
        return;
    }

    // --- SETUP CANVAS ---
    const canvas = document.createElement('canvas');
    canvas.id = 'aquarium-canvas';
    Object.assign(canvas.style, {
        position: 'fixed', top: '0', left: '0',
        width: '100%', height: '100%',
        zIndex: '999999', background: '#000000',
        pointerEvents: 'none', fontFamily: 'monospace', fontWeight: 'bold'
    });
    document.body.appendChild(canvas);
    document.body.style.overflow = 'hidden';

    const ctx = canvas.getContext('2d');
    const fontSize = 14; 
    let width, height;
    let WATER_LEVEL = 40; // Y-coordinate of the surface

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        ctx.font = `bold ${fontSize}px monospace`;
        
        WATER_LEVEL = 150; 
	
    }
    resize();
    window.addEventListener('resize', resize);
    
    const keys = { left: false, right: false, drop: false, reel: false};
    const handleKeyDown = (e) => {
        if (e.code === 'ArrowLeft') keys.left = true;
        if (e.code === 'ArrowRight' ) keys.right = true;
        if (e.code === 'Space' || e.code === 'ArrowDown' || e.key === 'j') keys.drop = true;
	if (e.code === 'ArrowUp' || e.key === 'k') keys.reel = true;
    };

    const handleKeyUp = (e) => {
        if (e.code === 'ArrowLeft') keys.left = false;
        if (e.code === 'ArrowRight') keys.right = false;
        if (e.code === 'Space' || e.code === 'ArrowDown' || e.key === 'j') keys.drop = false;
	if (e.code === 'ArrowUp' || e.key === 'k') keys.reel = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    aquariumListeners = { down: handleKeyDown, up: handleKeyUp };
    // -------------------------------
    // --- ASSETS ---
    const mirrorMap = {
        '(': ')', ')': '(', '[': ']', ']': '[', '{': '}', '}': '{',
        '<': '>', '>': '<', '/': '\\', '\\': '/', '`': '\'', '\'': '`'
    };
    function mirrorArt(lines) {
        if (!Array.isArray(lines)) lines = [lines];
        return lines.map(line => {
            return line.split('').reverse().map(char => mirrorMap[char] || char).join('');
        });
    }

    const sprites = {
        fish: [
            { art: ["   \\", "  / \\", ">=_('>","  \\_/","   /"], color: "#ffff00", speed: 2, facesRight: true },
            { art: ["  /", " / \\", "<')_=<"," \\_/","  \\"], color: "#00ffff", speed: 2, facesRight: false },
            { art: ["      ,", "      }\\","\\  .'  `\\","}}<    ( 6>", "/  `,  .'","      }/","      '"], color: "#ff00ff", speed: 1.5, facesRight: true },
            { art: ["    ,", "   /{", " /'  `.  /", "<6 )   >{{", " `.  ,'  \\","   \\{","    `"], color: "#00ff00", speed: 1.5, facesRight: false }, 
            { art: ["><((('>" ], color: "#00ffff", speed: 3, facesRight: true },
            { art: ["<°)))><" ], color: "#ff00ff", speed: 4, facesRight: false }, 
            { art: [" ><>" ], color: "#ffff00", speed: 5, facesRight: true },
            { art: ["¸.·´¯`·.¸><(((º>" ], color: "#00ff00", speed: 2, facesRight: true }, 
            { art: ["       ,'`/", "      /  (", "  .-'` ` `'-._      .')", "_/ (o)        '.  .' /", ")        )))     ><  <", "`\\  |_\\       _.'  '. \\", "  '-._  _ .-'       '.)", "      `\\__\\"], color: "#aaaaaa", speed: 1.2, facesRight: false }
        ],
        shark: {
            right: [
	"                              __",
	"                             ( `\ ",
	"  ,                          )   `\ ",
	";' `.                        (     `\ __",
	" ;   `.             __..---''          `~~~~-._",
	"  `.   `.____...--''                       (b  `--._",
	"    >                     _.-'      .((      ._     )",
	"  .`.-`--...__         .-'     -.___.....-(|/|/|/|/'",
	" ;.'         `. ...----`.___.',,,_______......---'",
	" '           '-'",
            ],
            left: [
                "                      __",
                "                     /' )",
                "                   /'   (                          ,",
                "               __/'     )                       .' `;",
                "       _.-~~~~'          ``---..__            .'   ;",
                " _.--'  b)                        ``--...____.'   .'",
                "(      _.       )).       `-._                   <",
                " `\\|\\|\\|\\|)-.....___.-      `-.         __...--'-.'.",
                "   `---......_______,,,`.___.'----... .'.........`.;",
                "                                     `-`.          `"
            ],
            color: "#cccccc",
            speed: 4
        },
        castle: [
        "	               /~~~~~~~~~~~~~~~",
	"	               |╔═╗╦═╗  ╦  ╦╦ ╦|",
	"	               |╚═╗╠╦╝  ║  ║║ ║|",
	"	               |╚═╝╩╚═  ╩═╝╩╚═╝|",
	"	               |~~~~~~~~~~~~~~~/",
	"	               |",
	"	               |",
	"	              /^\\",
	"	             /   \\",
	"	 _   _   _  /     \\  _   _   _",
	"	[ ]_[ ]_[ ]/ _   _ \\[ ]_[ ]_[ ]",
	"	|_=__-_ =_|_[ ]_[ ]_|_=-___-__|",
	"	 | _- =  | =_ = _    |= _=   |",
	"	 |= -[]  |- = _ =    |_-=_[] |",
	"	 | =_    |= - ___    | =_ =  |",
	"	 |=  []- |-  /| |\\   |=_ =[] |",
	"	 |- =_   | =| | | |  |- = -  |",
	"	 |_______|__|_|_|_|__|_______|"
        ],
        ship: [
            "      |    |    |",
            "     )_)  )_)  )_)",
            "    )___))___))___)\\",
            "   )____)____)_____)\\\\",
            " _____|____|____|____\\\\__",
            " \\___________________/"
        ],
	monster: [
	"                         ,.---.   ",
	"               ,,,,     /    _ `. ",
	"                \\\\\\\\   /      \\  ) ",
	"                 |||| /\\/``-.__\\/ ",
	"                 ::::/\\/_ ",
	" {{`-.__.-'(`(^^(^^^(^ 9 `.=========' ",
	"{{{{{{ { ( ( (  (   (-----:= ",
	" {{.-'~~'-.(,(,,(,,,(__6_.'=========. ",
	"                 ::::\\/\\ ",
	"                 |||| \\/\\  ,-'/\\ ",
	"                ////   \\ `` _/  )",
	"               ''''     \\  `   /",
	"                         `---''"
	],
	//        turtle: [
	// 	"                       _,.---.---.---.--.._", 
	// 	"           _.-' `--.`---.`---'-. _,`--.._",
	// 	"          /`--._ .'.     `.     `,`-.`-._\\",
	// 	"         ||   \\  `.`---.__`__..-`. ,'`-._/ ",
	// 	"    _  ,`\\ `-._\\   \\    `.    `_.-`-._,``-.",
	// 	" ,`   `-_ \\/ `-.`--.\\    _\\_.-'\\__.-`-.`-._`.",
	// 	"(_.o> ,--. `._/'--.-`,--`  \\_.-'       \\`-._ \\",
	// 	" `---'    `._ `---._/__,----`           `-. `-\\",
	// 	"           /_, ,  _..-'                    `-._\\",
	// 	"           \\_, \\/ ._(",
	// 	"            \\_, \\/ ._\\",
	// 	"             `._,\\/ ._\\",
	// 	"               `._// ./`-._",
	// 	"                 `-._-_-_.-'"
	// ],
        whale: [
	"                      . .",
	"                    '.-:-.`",
	"                    '  :  `",
	"                 .-----:",
	"               .'       `.",
	"         ,    /       (o) \\",
	"         \\`._/          ,__)"
	],
        duck: [
            "    __",
            "___( o)>",
            "\\ <_. )",
            " `---'"
        ]
    };

    // --- GAME STATE ---
    let entities = [];
    let bloodParticles = [];
    let bubbles = [];
    let weeds = [];
    let waterParticles = []; 
    let tick = 0;

    // Hook State
    let hook = {
        active: false,
        x: width / 2,
	y: -100,
        state: 'idle', // idle, dropping, waiting, reeling
        catch: null, // The fish caught
        lineLength: 0
    };

    // 1. Initialize Seaweed
    for (let i = 0; i < width / 100; i++) {
        weeds.push({
            x: (i * 100) + Math.random() * 50,
            height: Math.floor(Math.random() * 5) + 3
        });
    }

    // 2. Spawn Functions
    function spawnEntity(type, specialType = null) {
        const direction = Math.random() > 0.5 ? 1 : -1;
        let art;

        if (specialType === 'shark') {
            art = direction === 1 ? sprites.shark.right : sprites.shark.left;
        } else if (specialType === 'duck') {
             art = sprites.duck;
             if (direction === -1) art = mirrorArt(art);
        } else if (specialType) {
             art = sprites[specialType];
             if (direction === -1) art = mirrorArt(art);
        } else {
             // Smart Mirroring for Fish
             const facesRight = type.facesRight !== undefined ? type.facesRight : true;
             const shouldFlip = (facesRight && direction === -1) || (!facesRight && direction === 1);
             art = shouldFlip ? mirrorArt(type.art) : type.art;
        }
        
        // Y-Position Logic (Surface vs Underwater)
        let yPos;
        let h = art.length * fontSize;
        
        if (specialType === 'ship' || specialType === 'duck') {
            // Sit exactly on the water line (WATER_LEVEL) minus height of art
            yPos = WATER_LEVEL - h + 10; 
        } else if (specialType === 'monster') {
            yPos = height - 150; 
        } else if (specialType === 'whale') {
            // Whale near surface but submerged
             yPos = WATER_LEVEL -h + 10;
        }
		else {
            // Fish: Between Water Level and Bottom
            yPos = Math.random() * (height - 300 - WATER_LEVEL) + WATER_LEVEL + 50;
        }

	const maxWidth = Math.max(...art.map(line => line.length));
        entities.push({
            x: direction === 1 ? -400 : width + 400,
            y: yPos,
            art: art,
            color: specialType === 'shark' ? sprites.shark.color : (type ? type.color : "#ffffff"),
            speed: (specialType === 'shark' ? 4 : (type ? type.speed : 1)) * direction,
            type: specialType || 'fish',
            width: maxWidth * (fontSize * 0.6),
	    height: h,
            direction: direction
        });
    }

    // Initial Population
    for(let i=0; i<10; i++) spawnEntity(sprites.fish[Math.floor(Math.random() * sprites.fish.length)]);
    spawnEntity(null, 'ship');
    spawnEntity(null, 'monster'); 
    spawnEntity(null, 'duck');
    // spawnEntity(null, 'turtle');

    let sharkTimer = 0;
    let whaleTimer = 0;
    let hookTimer = 0;

    function spawnBlood(x, y) {
        for(let i=0; i<20; i++) {
            bloodParticles.push({
                x: x + (Math.random() * 60 - 30),
                y: y + (Math.random() * 40 - 20),
                char: Math.random() > 0.5 ? "." : "*",
                life: 60
            });
        }
    }
    function spawnWhaleSpout(whale) {
        // Determine spout origin (top of whale's head)
        let spoutX = whale.direction === -1 ? whale.x + 20 : whale.x + whale.width - 20;
        let spoutY = whale.y;

        // 1. Create the vertical column (The "BLAST")
        // These particles shoot straight up fast and turn into spray later
        for(let i=0; i<8; i++) {
             waterParticles.push({
                x: spoutX,
                y: spoutY,
                speedY: -(Math.random() * 2 + 4), // Fast upward speed
                speedX: (Math.random() * 0.5 - 0.25), // Very slight wobble
                life: 30 + Math.random() * 10,
                type: 'column', // New property to track state
                char: "|" 
            });
        }
    }

    // --- MAIN LOOP ---
    function draw() {
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, width, height);
        
        // 1. Draw Water Line (Two rows, animated)
        ctx.fillStyle = "#3399ff";
        const waveOffset = Math.floor(tick / 10) % 2;
        const waveChar1 = waveOffset === 0 ? "~" : " ";
        const waveChar2 = waveOffset === 0 ? " " : "~";
        
        // Row 1
        ctx.fillText((waveChar1 + "~").repeat(Math.ceil(width / 15)), 0, WATER_LEVEL); 
        // Row 2 (slightly offset)
        ctx.fillText((waveChar2 + "~").repeat(Math.ceil(width / 15)), -10, WATER_LEVEL + 10);


        tick++;

        // 2. Seaweed
        ctx.fillStyle = "#00cc00";
        weeds.forEach(w => {
            const sway = Math.floor(tick / 20) % 2 === 0 ? "(" : ")";
            const antiSway = sway === "(" ? ")" : "(";
            for(let h=0; h<w.height; h++) {
                ctx.fillText(h%2===0 ? ` ${sway} ` : ` ${antiSway} `, w.x, height - 20 - (h*16));
            }
        });

        // 3. Castle
        ctx.fillStyle = "#aaaaaa";
        sprites.castle.forEach((line, i) => {
            ctx.fillText(line, width - 300, height - (sprites.castle.length * fontSize) - 20 + (i * fontSize));
        });

        // 4. Hook Logic
        
        // Handle Horizontal Movement
        const moveSpeed = 8;
        if (keys.left) hook.x -= moveSpeed;
        if (keys.right) hook.x += moveSpeed;
        
        // Screen Boundaries
        if (hook.x < 10) hook.x = 10;
        if (hook.x > width - 20) hook.x = width - 20;
        
	ctx.save(); 
        ctx.font = "30px sans-serif"; 
        ctx.fillStyle = "#ffffff"; 
        ctx.fillText("⛵", hook.x - 22, WATER_LEVEL + 5); 
        ctx.restore();

        if (!hook.active) {
            if (keys.drop) {
                hook.active = true;
                hook.state = 'dropping';
                hook.lineLength = 0;
                hook.catch = null;
		const maxPossibleLines = Math.floor((height - WATER_LEVEL - 50) / 10);
		hook.targetLength = Math.floor(Math.random() * (maxPossibleLines - 5) + 5);
            }
        } else {
            ctx.fillStyle = "#ffffff";
            // Draw Line
            for(let i=1; i<hook.lineLength; i++) {
                ctx.fillText("|", hook.x, WATER_LEVEL + (i * 10)+5);
            }
            let hookY = WATER_LEVEL + (hook.lineLength * 10)+5;

	// Draw hook
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 2;
            ctx.beginPath();
            const alignX = hook.x + 4.5; 
            ctx.moveTo(alignX, hookY - 8);
            ctx.lineTo(alignX, hookY + 4);
            ctx.arc(alignX - 3, hookY + 4, 3, 0, Math.PI, false);
            ctx.stroke();

	    if (keys.reel) {
                hook.state = 'reeling';
            }

            if (hook.state === 'dropping' || hook.state === 'waiting') {
                for (let i = 0; i < entities.length; i++) {
                    let e = entities[i];
                    if (e.type === 'fish' && 
                        hook.x > e.x - 10 && 
                        hook.x < e.x + e.width + 10 &&
                        hookY > e.y && 
                        hookY < e.y + e.height) {
                            
                        hook.catch = e;
                        hook.state = 'reeling';
                        entities.splice(i, 1); 
                        break;
                    }
                }
            }

            // --- STATE UPDATES ---
            if (hook.state === 'dropping') {
                hook.lineLength++;
                if (hook.lineLength >= hook.targetLength || hookY > height - 50) {
                    hook.state = 'waiting';
                }
            } 
            else if (hook.state === 'waiting') {
                if (Math.random() > 0.99) hook.state = 'reeling';
            } 
            else if (hook.state === 'reeling') {
                hook.lineLength--;
                if (hook.catch) {
                    ctx.fillStyle = hook.catch.color;
                    hook.catch.art.forEach((line, idx) => {
                        ctx.fillText(line, hook.x - 10, hookY + (idx * 10));
                    });
                }
                if (hook.lineLength <= 0) {
                    hook.active = false;
		
		// Regenerate fish in case of extinction
		    if (hook.catch) {
                        setTimeout(() => {
                             spawnEntity(sprites.fish[Math.floor(Math.random() * sprites.fish.length)]);
                        }, 1000);
                    }
                }
            }
        }
        // 5. Entities
        for (let i = entities.length - 1; i >= 0; i--) {
            let e = entities[i];
            
            // OVERLAP AVOIDANCE (For Fish)
            if (e.type === 'fish') {
                for (let j = 0; j < entities.length; j++) {
                    if (i === j) continue;
                    let other = entities[j];
                    if (other.type !== 'fish') continue;
                    
                    let dist = Math.abs(e.x - other.x);
                    let sameDepth = Math.abs(e.y - other.y) < 30;
                    
                    if (sameDepth && dist < 80) {
                        // If too close, adjust speed slightly to separate them
                        if (e.x < other.x) e.x -= 0.5;
                        else e.x += 0.5;
                    }
                }
            }

            e.x += e.speed;
            
            ctx.fillStyle = e.color;
            e.art.forEach((line, idx) => {
                ctx.fillText(line, e.x, e.y + (idx * fontSize));
            });

            // Whale Spout Check
            if (e.type === 'whale' && Math.random() > 0.95) {
                 // Only spout if close enough to surface
                 if (Math.abs(e.y - WATER_LEVEL) < 150) {
                    spawnWhaleSpout(e);
                 }
            }

            // Boundary & Respawn
            if ((e.speed > 0 && e.x > width) || (e.speed < 0 && e.x < -500)) {
                entities.splice(i, 1);
                if (e.type === 'fish') spawnEntity(sprites.fish[Math.floor(Math.random() * sprites.fish.length)]);
                else if (e.type === 'ship') spawnEntity(null, 'ship'); 
                else if (e.type === 'duck') spawnEntity(null, 'duck');
                else if (e.type === 'whale') { /* Whale doesn't auto respawn immediately */ }
            }

            // SHARK LOGIC
            if (e.type === 'shark') {
                for (let j = entities.length - 1; j >= 0; j--) {
                    let prey = entities[j];
                    if (prey.type !== 'fish') continue; 

                    let mouthX = e.speed > 0 ? e.x + e.width - 20 : e.x + 20;
                    let mouthY = e.y + (e.height / 2);

                    // Hitbox check
                    if (mouthX > prey.x && mouthX < prey.x + prey.width &&
                        mouthY > prey.y && mouthY < prey.y + prey.height) {
                        
                        spawnBlood(prey.x + (prey.width/2), prey.y + (prey.height/2));
                        entities.splice(j, 1);
                        setTimeout(() => spawnEntity(sprites.fish[Math.floor(Math.random() * sprites.fish.length)]), 2000);
                    }
                }
            }
        }

        // 6. Timers
        sharkTimer++;
        if (sharkTimer > 600) { spawnEntity(null, 'shark'); sharkTimer = 0; }
        whaleTimer++;
        if (whaleTimer > 800) { spawnEntity(null, 'whale'); whaleTimer = 0; }

        // 7. Particles
        ctx.fillStyle = "#ff0000";
        for (let i = bloodParticles.length - 1; i >= 0; i--) {
            let b = bloodParticles[i];
            b.life--;
            b.y += 0.5; 
            ctx.globalAlpha = b.life / 60;
            ctx.fillText(b.char, b.x, b.y);
            ctx.globalAlpha = 1.0;
            if (b.life <= 0) bloodParticles.splice(i, 1);
        }
        
        ctx.fillStyle = "#aaf";
        for (let i = waterParticles.length - 1; i >= 0; i--) {
            let w = waterParticles[i];
            w.life--;
            w.x += w.speedX;
            w.y += w.speedY; 
            w.speedY += 0.1; 
            ctx.globalAlpha = w.life / 40;
            ctx.fillText(w.char, w.x, w.y);
            ctx.globalAlpha = 1.0;
            if (w.life <= 0) waterParticles.splice(i, 1);
        }

        if (Math.random() > 0.95) bubbles.push({x: Math.random()*width, y: height});
        ctx.fillStyle = "#ffffff";
        for (let i = bubbles.length - 1; i >= 0; i--) {
            let b = bubbles[i];
            b.y -= 2;
            const wobble = Math.sin(b.y / 20) * 5;
            ctx.fillText("o", b.x + wobble, b.y);
            if (b.y < WATER_LEVEL) bubbles.splice(i, 1); // Pop at surface
        }
    }

    aquariumInterval = setInterval(draw, 40);
}
