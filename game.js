// ==================== GAME CONSTANTS ====================
const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;
const GRAVITY = 0.45;
const JUMP_FORCE = -16;
const MOVE_SPEED = 6;
const MAX_LIVES = 5;

const RANKS = [
    { title: "Intern", color: "#a0aec0" },
    { title: "Junior Developer", color: "#60a5fa" },
    { title: "Senior Developer", color: "#34d399" },
    { title: "Team Lead", color: "#fbbf24" },
    { title: "Manager", color: "#f97316" },
    { title: "VP of Engineering", color: "#a78bfa" },
    { title: "CEO", color: "#ec4899" }
];

const OBSTACLE_TYPES = [
    { emoji: "📧", name: "email", width: 30, height: 30 },
    { emoji: "📅", name: "meeting", width: 35, height: 35 },
    { emoji: "🧑‍💼", name: "manager", width: 35, height: 40 },
    { emoji: "📊", name: "report", width: 30, height: 30 },
    { emoji: "💼", name: "extra-work", width: 35, height: 30 }
];

const COLLECTIBLE_TYPES = [
    { emoji: "☕", name: "coffee", points: 50, effect: "speed" },
    { emoji: "📎", name: "paperclip", points: 25, effect: "points" },
    { emoji: "⭐", name: "star-review", points: 100, effect: "shield" },
    { emoji: "💡", name: "idea", points: 75, effect: "points" }
];

// ==================== LEARNING TIPS ====================
const PROMOTION_TIPS = {
    1: [ // Promoted to Junior Developer
        "Version control (Git) is essential — commit early and commit often. It saves you when things break.",
        "Code readability matters more than cleverness. Your future self will thank you for clear variable names.",
        "Don't be afraid to ask questions. Senior devs expect it and appreciate curiosity over pretending to know.",
        "Learn to use your IDE shortcuts. They can double your productivity overnight."
    ],
    2: [ // Promoted to Senior Developer
        "Writing tests isn't extra work — it's insurance. A good test suite lets you refactor with confidence.",
        "The DRY principle (Don't Repeat Yourself) saves maintenance headaches. Abstract when you see patterns.",
        "Code reviews aren't criticism — they're learning opportunities. Review others' code to grow faster.",
        "Technical debt is real. Schedule time to refactor, or it compounds like interest on a loan."
    ],
    3: [ // Promoted to Team Lead
        "Leadership is about enabling others, not doing everything yourself. Delegate and trust your team.",
        "Clear communication prevents more bugs than any linter. Document decisions and share context.",
        "A 10-minute standup that stays focused is worth more than a 1-hour meeting with no agenda.",
        "Psychological safety on a team leads to more innovation. People need to feel safe to take risks."
    ],
    4: [ // Promoted to Manager
        "The best managers remove blockers instead of adding process. Ask: 'What's slowing you down?'",
        "1-on-1 meetings aren't status updates — they're for career growth, feedback, and building trust.",
        "Hire for potential and culture-add, not just current skills. Skills can be taught; mindset is harder.",
        "Data-driven decisions beat opinions. Measure what matters, but don't measure everything."
    ],
    5: [ // Promoted to VP
        "Strategy is about saying no to good ideas so you can focus on great ones. Prioritize ruthlessly.",
        "Cross-functional collaboration multiplies impact. Break down silos between teams.",
        "Build systems that scale without you. If you're the bottleneck, you're not leading — you're blocking.",
        "Culture is what happens when no one is watching. Model the behavior you want to see."
    ],
    6: [ // Promoted to CEO
        "Vision without execution is hallucination. Great leaders balance inspiration with operational rigor.",
        "The best companies solve real problems for real people. Stay close to your customers.",
        "Continuous learning is the only sustainable competitive advantage — for individuals and organizations.",
        "Success is never final. Stay humble, stay hungry, and always be willing to reinvent yourself."
    ]
};

const GENERAL_TIPS = [
    "The average person spends 5 years of their life waiting in lines. Use that time to learn something new!",
    "The first computer programmer was Ada Lovelace, who wrote algorithms in the 1840s — before computers existed.",
    "Rubber duck debugging works: explaining your code to an inanimate object helps you find bugs.",
    "The term 'bug' came from an actual moth found in a Harvard computer in 1947.",
    "Studies show taking breaks improves problem-solving. The Pomodoro technique: 25 min work, 5 min rest.",
    "Open source powers 96% of the world's top web servers. Contributing to OSS is a great way to learn.",
    "The most in-demand soft skill in tech is communication, not coding speed.",
    "Imposter syndrome affects 70% of people. Feeling like a fraud? You're in good company.",
    "The best time to start learning something new was yesterday. The second best time is now.",
    "Networking isn't about collecting contacts — it's about planting seeds for mutual growth."
];

// ==================== THEME SYSTEM ====================
let currentTheme = "midnight";

function getThemeColors() {
    const style = getComputedStyle(document.documentElement);
    return {
        bgTop: style.getPropertyValue('--canvas-bg-top').trim(),
        bgBottom: style.getPropertyValue('--canvas-bg-bottom').trim(),
        platformColor: style.getPropertyValue('--platform-color').trim(),
        platformTop: style.getPropertyValue('--platform-top').trim(),
        accent: style.getPropertyValue('--accent').trim(),
        accentGlow: style.getPropertyValue('--accent-glow').trim(),
        accentDim: style.getPropertyValue('--accent-dim').trim(),
        accentSecondary: style.getPropertyValue('--accent-secondary').trim(),
        success: style.getPropertyValue('--success').trim(),
        danger: style.getPropertyValue('--danger').trim(),
        warning: style.getPropertyValue('--warning').trim(),
        textPrimary: style.getPropertyValue('--text-primary').trim(),
        textSecondary: style.getPropertyValue('--text-secondary').trim(),
        textMuted: style.getPropertyValue('--text-muted').trim(),
        surface: style.getPropertyValue('--surface').trim(),
        surfaceHover: style.getPropertyValue('--surface-hover').trim(),
        border: style.getPropertyValue('--border').trim()
    };
}

function setTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);

    // Update active state in theme panel
    document.querySelectorAll('.theme-option').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === theme);
    });

    // Save preference
    try { localStorage.setItem('game-theme', theme); } catch(e) {}
}

function toggleThemePanel() {
    const panel = document.getElementById('theme-panel');
    panel.classList.toggle('hidden');
}

function loadSavedTheme() {
    try {
        const saved = localStorage.getItem('game-theme');
        if (saved) setTheme(saved);
    } catch(e) {}
}

// ==================== GAME STATE ====================
let canvas, ctx;
let gameState = "start";
let score = 0;
let lives = MAX_LIVES;
let currentRank = 0;
let currentFloor = 1;
let player = null;
let platforms = [];
let obstacles = [];
let collectibles = [];
let particles = [];
let floatingTexts = [];
let elevator = null;
let keys = {};
let speedBoostTimer = 0;
let shieldTimer = 0;
let cameraY = 0;
let targetCameraY = 0;
let levelComplete = false;
let animationId = null;
let comboCount = 0;
let comboTimer = 0;
let screenShake = 0;
let frameCount = 0;

// ==================== INITIALIZATION ====================
function init() {
    canvas = document.getElementById("game-canvas");
    ctx = canvas.getContext("2d");
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    document.addEventListener("keydown", (e) => {
        keys[e.code] = true;
        if (e.code === "Space") e.preventDefault();
    });
    document.addEventListener("keyup", (e) => {
        keys[e.code] = false;
    });

    // Close theme panel on click outside
    document.addEventListener("click", (e) => {
        const panel = document.getElementById('theme-panel');
        const switcher = document.getElementById('theme-switcher');
        if (!switcher.contains(e.target) && !panel.classList.contains('hidden')) {
            panel.classList.add('hidden');
        }
    });

    loadSavedTheme();
}

function startGame() {
    score = 0;
    lives = MAX_LIVES;
    currentRank = 0;
    currentFloor = 1;
    speedBoostTimer = 0;
    shieldTimer = 0;
    comboCount = 0;
    comboTimer = 0;
    screenShake = 0;

    hideAllScreens();
    document.getElementById("game-screen").classList.remove("hidden");

    generateLevel();
    gameState = "playing";

    if (animationId) cancelAnimationFrame(animationId);
    gameLoop();
}

function hideAllScreens() {
    document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
}

// ==================== LEVEL GENERATION ====================
function generateLevel() {
    platforms = [];
    obstacles = [];
    collectibles = [];
    particles = [];
    floatingTexts = [];
    levelComplete = false;

    const difficulty = currentRank;
    const numPlatforms = 10 + difficulty * 2;

    // Ground platform
    platforms.push({
        x: 0, y: CANVAS_HEIGHT - 40,
        width: CANVAS_WIDTH, height: 40,
        type: "ground"
    });

    // Player start
    player = {
        x: CANVAS_WIDTH / 2 - 15,
        y: CANVAS_HEIGHT - 80,
        width: 30,
        height: 40,
        vx: 0,
        vy: 0,
        onGround: false,
        facing: 1,
        squash: 1,
        stretch: 1
    };

    cameraY = 0;
    targetCameraY = 0;

    // Generate platforms going upward
    let lastY = CANVAS_HEIGHT - 120;
    let lastX = CANVAS_WIDTH / 2;
    for (let i = 0; i < numPlatforms; i++) {
        const gap = 40 + Math.random() * 25;
        lastY -= gap;
        const width = 130 + Math.random() * 80 - difficulty * 3;
        // Keep platforms horizontally reachable from the previous one
        const maxHorizontalJump = 200;
        let x;
        // Last few platforms guide toward center for elevator access
        if (i >= numPlatforms - 2) {
            x = CANVAS_WIDTH / 2 - width / 2 + (Math.random() - 0.5) * 80;
        } else {
            x = lastX + (Math.random() - 0.5) * maxHorizontalJump;
        }
        x = Math.max(0, Math.min(CANVAS_WIDTH - width, x));
        lastX = x + width / 2;

        platforms.push({
            x: x,
            y: lastY,
            width: Math.max(width, 80),
            height: 15,
            type: "normal",
            moving: difficulty > 2 && Math.random() < 0.15 ? { speed: 0.8 + Math.random() * 0.5, dir: 1, range: 70, startX: x } : null
        });

        // Add obstacles on some platforms (much rarer)
        if (i > 3 && Math.random() < 0.15 + difficulty * 0.03) {
            const obsType = OBSTACLE_TYPES[Math.floor(Math.random() * Math.min(OBSTACLE_TYPES.length, 2 + difficulty))];
            obstacles.push({
                x: x + width / 2 - obsType.width / 2,
                y: lastY - obsType.height - 5,
                width: obsType.width,
                height: obsType.height,
                type: obsType,
                moving: difficulty > 3 && Math.random() < 0.2 ? { speed: 1.2, dir: 1, range: 50, startX: x + width / 2 - obsType.width / 2 } : null
            });
        }

        // Add collectibles (more frequent)
        if (Math.random() < 0.55) {
            const colType = COLLECTIBLE_TYPES[Math.floor(Math.random() * COLLECTIBLE_TYPES.length)];
            collectibles.push({
                x: x + width / 2 - 12,
                y: lastY - 50,
                width: 25,
                height: 25,
                type: colType,
                collected: false,
                bobOffset: Math.random() * Math.PI * 2
            });
        }
    }

    // Elevator platform spans full width — guaranteed reachable from any last platform
    const elevPlatY = lastY - 50;
    platforms.push({
        x: 0,
        y: elevPlatY,
        width: CANVAS_WIDTH,
        height: 18,
        type: "elevator-platform"
    });

    // Elevator door at center (visual goal marker)
    elevator = {
        x: CANVAS_WIDTH / 2 - 40,
        y: elevPlatY - 55,
        width: 80,
        height: 70
    };

    updateHUD();
}

// ==================== GAME LOOP ====================
function gameLoop() {
    if (gameState !== "playing") return;

    frameCount++;
    update();
    render();
    animationId = requestAnimationFrame(gameLoop);
}

// ==================== UPDATE ====================
function update() {
    // Player movement
    let speed = MOVE_SPEED;
    if (speedBoostTimer > 0) {
        speed *= 1.5;
        speedBoostTimer--;
    }
    if (shieldTimer > 0) shieldTimer--;

    // Update boost bar UI
    updateBoostBars();

    // Combo timer
    if (comboTimer > 0) {
        comboTimer--;
        if (comboTimer <= 0) {
            comboCount = 0;
            document.getElementById('combo-display').classList.add('hidden');
        }
    }

    if (keys["ArrowLeft"] || keys["KeyA"]) {
        player.vx = -speed;
        player.facing = -1;
    } else if (keys["ArrowRight"] || keys["KeyD"]) {
        player.vx = speed;
        player.facing = 1;
    } else {
        player.vx *= 0.8;
    }

    // Jump
    if ((keys["Space"] || keys["ArrowUp"] || keys["KeyW"]) && player.onGround) {
        player.vy = JUMP_FORCE;
        player.onGround = false;
        player.squash = 0.6;
        player.stretch = 1.4;
        spawnParticles(player.x + player.width / 2, player.y + player.height, "accent", 5);
    }

    // Apply gravity
    player.vy += GRAVITY;
    player.x += player.vx;
    player.y += player.vy;

    // Squash and stretch lerp
    player.squash += (1 - player.squash) * 0.15;
    player.stretch += (1 - player.stretch) * 0.15;

    // Screen shake decay
    if (screenShake > 0) screenShake *= 0.85;

    // Screen wrap horizontally
    if (player.x + player.width < 0) player.x = CANVAS_WIDTH;
    if (player.x > CANVAS_WIDTH) player.x = -player.width;

    // Platform collision
    player.onGround = false;
    for (let plat of platforms) {
        if (plat.moving) {
            plat.x += plat.moving.speed * plat.moving.dir;
            if (plat.x > plat.moving.startX + plat.moving.range || plat.x < plat.moving.startX - plat.moving.range) {
                plat.moving.dir *= -1;
            }
        }

        if (player.vy >= 0 &&
            player.x + player.width > plat.x &&
            player.x < plat.x + plat.width &&
            player.y + player.height >= plat.y &&
            player.y + player.height <= plat.y + plat.height + 10) {
            player.y = plat.y - player.height;
            if (player.vy > 8) {
                player.squash = 1.3;
                player.stretch = 0.7;
            }
            player.vy = 0;
            player.onGround = true;

            if (plat.moving) {
                player.x += plat.moving.speed * plat.moving.dir;
            }
        }
    }

    // Update obstacles
    for (let obs of obstacles) {
        if (obs.moving) {
            obs.x += obs.moving.speed * obs.moving.dir;
            if (obs.x > obs.moving.startX + obs.moving.range || obs.x < obs.moving.startX - obs.moving.range) {
                obs.moving.dir *= -1;
            }
        }

        if (checkCollision(player, obs)) {
            if (shieldTimer > 0) {
                shieldTimer = 0;
                spawnParticles(obs.x + obs.width / 2, obs.y + obs.height / 2, "warning", 12);
                addFloatingText("BLOCKED!", obs.x, obs.y, "warning");
                obs.x = -1000;
            } else {
                takeDamage();
            }
        }
    }

    // Update collectibles
    for (let col of collectibles) {
        if (col.collected) continue;
        col.bobOffset += 0.05;

        if (checkCollision(player, col)) {
            col.collected = true;

            // Combo system
            comboCount++;
            comboTimer = 120;
            const comboMultiplier = Math.min(comboCount, 5);
            const points = col.type.points * comboMultiplier;
            score += points;

            spawnParticles(col.x + col.width / 2, col.y + col.height / 2, "success", 8);
            addFloatingText(`+${points}`, col.x, col.y, "success");

            if (comboCount > 1) {
                const comboEl = document.getElementById('combo-display');
                comboEl.classList.remove('hidden');
                comboEl.textContent = `COMBO x${comboMultiplier}`;
            }

            if (col.type.effect === "speed") {
                speedBoostTimer = 180;
                addFloatingText("SPEED!", col.x, col.y - 20, "warning");
            }
            if (col.type.effect === "shield") {
                shieldTimer = 300;
                addFloatingText("SHIELD!", col.x, col.y - 20, "accent");
            }
            updateHUD();
        }
    }

    // Check elevator — win triggered by touching door OR standing on elevator platform
    let onElevatorFloor = false;
    if (player.onGround) {
        for (let plat of platforms) {
            if (plat.type === "elevator-platform" &&
                player.x + player.width > plat.x &&
                player.x < plat.x + plat.width &&
                Math.abs(player.y + player.height - plat.y) < 5) {
                onElevatorFloor = true;
                break;
            }
        }
    }
    if (onElevatorFloor || (elevator && checkCollision(player, elevator))) {
        levelComplete = true;
        gameState = "promotion";
        currentRank++;
        currentFloor++;

        if (currentRank >= RANKS.length - 1) {
            showWinScreen();
        } else {
            showPromotionScreen();
        }
        return;
    }

    // Smooth camera follow (both up and down)
    targetCameraY = -(player.y - CANVAS_HEIGHT * 0.5);
    if (targetCameraY > cameraY) {
        cameraY += (targetCameraY - cameraY) * 0.08;
    } else {
        // Follow player downward so they stay visible
        cameraY += (targetCameraY - cameraY) * 0.12;
    }
    if (cameraY < 0) cameraY = 0;

    // Fall death
    if (player.y - cameraY > CANVAS_HEIGHT + 100) {
        takeDamage();
        resetPlayerPosition();
    }

    // Update particles
    particles = particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15;
        p.life--;
        p.size *= 0.97;
        return p.life > 0;
    });

    // Update floating texts
    floatingTexts = floatingTexts.filter(ft => {
        ft.y -= 1.5;
        ft.life--;
        ft.opacity = ft.life / ft.maxLife;
        return ft.life > 0;
    });
}

// ==================== BOOST BARS UI ====================
function updateBoostBars() {
    const speedBar = document.getElementById('speed-bar');
    const shieldBar = document.getElementById('shield-bar');

    if (speedBoostTimer > 0) {
        speedBar.classList.remove('hidden');
        speedBar.querySelector('.boost-fill').style.width = `${(speedBoostTimer / 180) * 100}%`;
    } else {
        speedBar.classList.add('hidden');
    }

    if (shieldTimer > 0) {
        shieldBar.classList.remove('hidden');
        shieldBar.querySelector('.boost-fill').style.width = `${(shieldTimer / 300) * 100}%`;
    } else {
        shieldBar.classList.add('hidden');
    }
}

// ==================== COLLISION ====================
function checkCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

// ==================== DAMAGE & DEATH ====================
function takeDamage() {
    lives--;
    screenShake = 10;
    spawnParticles(player.x + player.width / 2, player.y + player.height / 2, "danger", 15);
    addFloatingText("OUCH!", player.x, player.y, "danger");
    comboCount = 0;
    comboTimer = 0;
    document.getElementById('combo-display').classList.add('hidden');
    updateHUD();

    if (lives <= 0) {
        gameState = "gameover";
        showGameOverScreen();
    } else {
        resetPlayerPosition();
    }
}

function resetPlayerPosition() {
    let bestPlatform = platforms[0];
    const viewY = -cameraY + CANVAS_HEIGHT / 2;

    for (let plat of platforms) {
        if (plat.y > viewY - 200 && plat.y < viewY + 200) {
            bestPlatform = plat;
            break;
        }
    }

    player.x = bestPlatform.x + bestPlatform.width / 2 - player.width / 2;
    player.y = bestPlatform.y - player.height;
    player.vx = 0;
    player.vy = 0;
}

// ==================== PARTICLES ====================
function spawnParticles(x, y, colorKey, count) {
    const colors = getThemeColors();
    let color;
    switch(colorKey) {
        case "accent": color = colors.accent; break;
        case "success": color = colors.success; break;
        case "danger": color = colors.danger; break;
        case "warning": color = colors.warning; break;
        default: color = colors.accent;
    }

    for (let i = 0; i < count; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6 - 2,
            color: color,
            life: 25 + Math.random() * 20,
            size: 3 + Math.random() * 4
        });
    }
}

// ==================== FLOATING TEXT ====================
function addFloatingText(text, x, y, colorKey) {
    const colors = getThemeColors();
    let color;
    switch(colorKey) {
        case "accent": color = colors.accent; break;
        case "success": color = colors.success; break;
        case "danger": color = colors.danger; break;
        case "warning": color = colors.warning; break;
        default: color = colors.textPrimary;
    }

    floatingTexts.push({
        text, x, y, color,
        life: 60,
        maxLife: 60,
        opacity: 1
    });
}

// ==================== RENDERING ====================
function render() {
    const colors = getThemeColors();

    // Background
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, colors.bgTop);
    gradient.addColorStop(1, colors.bgBottom);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Background grid (subtle)
    drawBackgroundGrid(colors);

    ctx.save();

    // Screen shake
    if (screenShake > 0.5) {
        ctx.translate(
            (Math.random() - 0.5) * screenShake,
            (Math.random() - 0.5) * screenShake
        );
    }

    ctx.translate(0, cameraY);

    // Draw platforms
    for (let plat of platforms) {
        drawPlatform(plat, colors);
    }

    // Draw elevator
    if (elevator) {
        drawElevator(colors);
    }

    // Draw obstacles
    for (let obs of obstacles) {
        if (obs.x < -500) continue;
        // Glow behind obstacle
        ctx.shadowColor = colors.danger;
        ctx.shadowBlur = 8;
        ctx.font = `${obs.height}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(obs.type.emoji, obs.x + obs.width / 2, obs.y + obs.height / 2);
        ctx.shadowBlur = 0;
    }

    // Draw collectibles
    for (let col of collectibles) {
        if (col.collected) continue;
        const bobY = Math.sin(col.bobOffset) * 5;
        const scale = 1 + Math.sin(col.bobOffset * 2) * 0.05;

        ctx.save();
        ctx.translate(col.x + col.width / 2, col.y + col.height / 2 + bobY);
        ctx.scale(scale, scale);

        // Glow
        ctx.shadowColor = colors.success;
        ctx.shadowBlur = 12;
        ctx.font = "22px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(col.type.emoji, 0, 0);
        ctx.shadowBlur = 0;
        ctx.restore();
    }

    // Draw player
    drawPlayer(colors);

    // Draw particles
    for (let p of particles) {
        ctx.globalAlpha = Math.min(1, p.life / 20);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Draw floating texts
    for (let ft of floatingTexts) {
        ctx.globalAlpha = ft.opacity;
        ctx.font = "bold 14px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.fillStyle = ft.color;
        ctx.shadowColor = ft.color;
        ctx.shadowBlur = 6;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;

    ctx.restore();
}

function drawBackgroundGrid(colors) {
    ctx.globalAlpha = 0.03;
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 1;
    const gridSize = 60;
    const offsetY = (cameraY * 0.3) % gridSize;

    for (let x = 0; x < CANVAS_WIDTH; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
    }
    for (let y = -gridSize + offsetY; y < CANVAS_HEIGHT + gridSize; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
    }
    ctx.globalAlpha = 1;
}

function drawPlatform(plat, colors) {
    const radius = 4;

    if (plat.type === "ground") {
        ctx.fillStyle = colors.surface;
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
        ctx.fillStyle = colors.platformTop;
        ctx.fillRect(plat.x, plat.y, plat.width, 2);
    } else if (plat.type === "elevator-platform") {
        // Glowing platform
        ctx.shadowColor = colors.accent;
        ctx.shadowBlur = 15;
        ctx.fillStyle = colors.accent;
        roundRect(ctx, plat.x, plat.y, plat.width, plat.height, radius);
        ctx.fill();
        ctx.shadowBlur = 0;
    } else {
        ctx.fillStyle = colors.platformColor;
        roundRect(ctx, plat.x, plat.y, plat.width, plat.height, radius);
        ctx.fill();

        // Top edge highlight
        ctx.fillStyle = plat.moving ? colors.warning : colors.platformTop;
        ctx.fillRect(plat.x + radius, plat.y, plat.width - radius * 2, 2);
    }
}

function drawElevator(colors) {
    // Elevator glow
    ctx.shadowColor = colors.accent;
    ctx.shadowBlur = 20;

    // Body
    ctx.fillStyle = colors.surface;
    roundRect(ctx, elevator.x, elevator.y, elevator.width, elevator.height, 6);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Border
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 2;
    roundRect(ctx, elevator.x, elevator.y, elevator.width, elevator.height, 6);
    ctx.stroke();

    // Doors
    const doorGap = 3;
    const doorWidth = (elevator.width - 14) / 2;
    ctx.fillStyle = colors.platformColor;
    roundRect(ctx, elevator.x + 5, elevator.y + 12, doorWidth, elevator.height - 17, 3);
    ctx.fill();
    roundRect(ctx, elevator.x + 5 + doorWidth + doorGap + 1, elevator.y + 12, doorWidth, elevator.height - 17, 3);
    ctx.fill();

    // Arrow indicator (pulsing)
    const pulse = Math.sin(frameCount * 0.05) * 0.3 + 0.7;
    ctx.globalAlpha = pulse;
    ctx.font = "18px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = colors.accent;
    ctx.fillText("⬆", elevator.x + elevator.width / 2, elevator.y - 8);
    ctx.globalAlpha = 1;
}

function drawPlayer(colors) {
    const px = player.x;
    const py = player.y;
    const pw = player.width;
    const ph = player.height;

    ctx.save();
    ctx.translate(px + pw / 2, py + ph / 2);
    ctx.scale(player.squash, player.stretch);
    ctx.translate(-(px + pw / 2), -(py + ph / 2));

    // Shield glow
    if (shieldTimer > 0) {
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 2;
        ctx.shadowColor = colors.accent;
        ctx.shadowBlur = 15;
        ctx.globalAlpha = 0.6 + Math.sin(frameCount * 0.1) * 0.2;
        ctx.beginPath();
        ctx.arc(px + pw / 2, py + ph / 2, 28, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
    }

    // Speed trail
    if (speedBoostTimer > 0) {
        ctx.globalAlpha = 0.4;
        for (let i = 1; i <= 3; i++) {
            ctx.globalAlpha = 0.15 / i;
            ctx.fillStyle = colors.warning;
            ctx.fillRect(px - player.facing * i * 6 + 5, py + 15, pw - 10, ph - 20);
        }
        ctx.globalAlpha = 1;
    }

    // Shadow under player
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.ellipse(px + pw / 2, py + ph + 2, 12, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Body (suit)
    const bodyColor = RANKS[currentRank].color;
    ctx.fillStyle = bodyColor;
    roundRect(ctx, px + 5, py + 15, pw - 10, ph - 20, 4);
    ctx.fill();

    // Head
    ctx.fillStyle = "#fcd34d";
    ctx.beginPath();
    ctx.arc(px + pw / 2, py + 10, 10, 0, Math.PI * 2);
    ctx.fill();

    // Tie
    ctx.fillStyle = colors.danger;
    ctx.beginPath();
    ctx.moveTo(px + pw / 2, py + 18);
    ctx.lineTo(px + pw / 2 - 3, py + 30);
    ctx.lineTo(px + pw / 2 + 3, py + 30);
    ctx.closePath();
    ctx.fill();

    // Eyes (following facing direction)
    ctx.fillStyle = "#1a1a2e";
    const eyeOffsetX = player.facing * 2;
    ctx.fillRect(px + pw / 2 - 4 + eyeOffsetX, py + 7, 3, 3);
    ctx.fillRect(px + pw / 2 + 2 + eyeOffsetX, py + 7, 3, 3);

    // Legs
    ctx.fillStyle = colors.surface;
    ctx.fillRect(px + 8, py + ph - 8, 5, 8);
    ctx.fillRect(px + pw - 13, py + ph - 8, 5, 8);

    ctx.restore();
}

// ==================== UTILITIES ====================
function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

// ==================== UI UPDATES ====================
function updateHUD() {
    document.getElementById("level-display").textContent = RANKS[currentRank].title;
    document.getElementById("floor-display").textContent = `Floor ${currentFloor}`;
    document.getElementById("score-display").textContent = score.toLocaleString();

    // Update hearts
    const livesContainer = document.getElementById("lives-display");
    let heartsHTML = '';
    for (let i = 0; i < MAX_LIVES; i++) {
        heartsHTML += `<span class="heart ${i < lives ? 'active' : ''}">♥</span>`;
    }
    livesContainer.innerHTML = heartsHTML;
}

// ==================== SCREEN TRANSITIONS ====================
function showGameOverScreen() {
    hideAllScreens();
    document.getElementById("gameover-screen").classList.remove("hidden");
    document.getElementById("final-score").textContent = score.toLocaleString();
    document.getElementById("final-rank").textContent = RANKS[currentRank].title;
    document.getElementById("final-floors").textContent = currentFloor;

    const messages = [
        "Your badge has been deactivated...",
        "HR would like a word with you...",
        "Your desk has been cleared...",
        "Your parking spot has been reassigned...",
        "The vending machine rejected your card...",
        "Your Slack has been archived..."
    ];
    document.getElementById("gameover-message").textContent = messages[Math.floor(Math.random() * messages.length)];

    // Show a general learning tip on game over
    const tip = GENERAL_TIPS[Math.floor(Math.random() * GENERAL_TIPS.length)];
    document.getElementById("gameover-tip").textContent = tip;
}

function showPromotionScreen() {
    hideAllScreens();
    document.getElementById("promotion-screen").classList.remove("hidden");
    document.getElementById("promotion-text").textContent = RANKS[currentRank].title;

    const arts = ["📈", "🏆", "💰", "🎯", "🚀", "👑"];
    document.getElementById("promotion-art").textContent = arts[Math.min(currentRank - 1, arts.length - 1)];

    // Show learning tip for this rank
    const tips = PROMOTION_TIPS[currentRank];
    if (tips) {
        const tip = tips[Math.floor(Math.random() * tips.length)];
        document.getElementById("learning-tip").textContent = tip;
    }

    // Progress bar
    const progress = (currentRank / (RANKS.length - 1)) * 100;
    document.getElementById("promo-progress-fill").style.width = `${progress}%`;

    // Labels
    const labelsEl = document.getElementById("promo-labels");
    labelsEl.innerHTML = `<span>Intern</span><span>CEO</span>`;
}

function showWinScreen() {
    hideAllScreens();
    document.getElementById("win-screen").classList.remove("hidden");
    document.getElementById("win-score").textContent = score.toLocaleString();
}

// ==================== BIOTECH QUIZ ====================
const BIOTECH_QUIZ = {
    1: [ // After Intern → Junior Developer
        {
            q: "What does DNA stand for?",
            options: ["Deoxyribonucleic Acid", "Dinitrogen Acid", "Dual Nucleic Arrangement", "Direct Nuclear Assembly"],
            correct: 0,
            explanation: "DNA (Deoxyribonucleic Acid) carries the genetic instructions for all living organisms."
        },
        {
            q: "How many chromosomes do humans typically have?",
            options: ["23", "46", "48", "92"],
            correct: 1,
            explanation: "Humans have 46 chromosomes arranged in 23 pairs — one set from each parent."
        },
        {
            q: "Which scientist is known for discovering penicillin?",
            options: ["Louis Pasteur", "Charles Darwin", "Alexander Fleming", "Gregor Mendel"],
            correct: 2,
            explanation: "Alexander Fleming discovered penicillin in 1928, revolutionizing modern medicine."
        },
        {
            q: "What is the basic structural unit of all living organisms?",
            options: ["Atom", "Cell", "Molecule", "Tissue"],
            correct: 1,
            explanation: "The cell is the smallest unit of life — all organisms are composed of one or more cells."
        },
        {
            q: "What process do plants use to make food from sunlight?",
            options: ["Respiration", "Fermentation", "Photosynthesis", "Digestion"],
            correct: 2,
            explanation: "Photosynthesis converts sunlight, water, and CO2 into glucose and oxygen."
        }
    ],
    2: [ // After Junior → Senior Developer
        {
            q: "What does PCR stand for in biotechnology?",
            options: ["Protein Cell Regeneration", "Polymerase Chain Reaction", "Plasmid Cloning Replication", "Primary Cellular Response"],
            correct: 1,
            explanation: "PCR (Polymerase Chain Reaction) amplifies DNA sequences and is fundamental to modern genetics."
        },
        {
            q: "Which molecule is known as the 'energy currency' of the cell?",
            options: ["DNA", "ATP", "RNA", "Glucose"],
            correct: 1,
            explanation: "ATP (Adenosine Triphosphate) stores and releases energy for cellular processes."
        },
        {
            q: "What is CRISPR primarily used for?",
            options: ["Cell imaging", "Gene editing", "Protein synthesis", "Tissue culture"],
            correct: 1,
            explanation: "CRISPR-Cas9 is a revolutionary gene-editing tool that allows precise modification of DNA."
        },
        {
            q: "What type of molecule is insulin?",
            options: ["Lipid", "Carbohydrate", "Protein", "Nucleic acid"],
            correct: 2,
            explanation: "Insulin is a protein hormone that regulates blood glucose levels."
        },
        {
            q: "Which organelle is known as the 'powerhouse' of the cell?",
            options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi apparatus"],
            correct: 2,
            explanation: "Mitochondria generate most of the cell's energy through cellular respiration."
        }
    ],
    3: [ // After Senior → Team Lead
        {
            q: "What is a genome?",
            options: ["A single gene", "All genetic material in an organism", "A type of protein", "A cellular structure"],
            correct: 1,
            explanation: "A genome is the complete set of DNA, including all genes, in an organism."
        },
        {
            q: "Which technique is used to separate DNA fragments by size?",
            options: ["Chromatography", "Gel electrophoresis", "Centrifugation", "Spectroscopy"],
            correct: 1,
            explanation: "Gel electrophoresis uses an electric field to separate DNA fragments by size."
        },
        {
            q: "What is a vaccine made of?",
            options: ["Pure antibodies", "Weakened or inactive pathogens", "Antibiotics", "Vitamins"],
            correct: 1,
            explanation: "Vaccines contain weakened, killed, or pieces of pathogens to trigger immunity without disease."
        },
        {
            q: "What does mRNA do in a cell?",
            options: ["Stores genetic info", "Carries instructions for protein synthesis", "Destroys viruses", "Produces ATP"],
            correct: 1,
            explanation: "Messenger RNA carries genetic instructions from DNA to ribosomes for protein synthesis."
        },
        {
            q: "Stem cells are special because they can:",
            options: ["Move freely", "Live forever", "Differentiate into other cell types", "Photosynthesize"],
            correct: 2,
            explanation: "Stem cells can develop into many different specialized cell types, making them valuable for regenerative medicine."
        }
    ],
    4: [ // After Team Lead → Manager
        {
            q: "What is a recombinant DNA?",
            options: ["DNA from a single source", "DNA combined from different organisms", "Damaged DNA", "Synthetic DNA only"],
            correct: 1,
            explanation: "Recombinant DNA is created by combining DNA sequences from different organisms — the basis of genetic engineering."
        },
        {
            q: "What is the Human Genome Project?",
            options: ["A cloning experiment", "Mapping all human genes", "A drug development study", "A vaccine trial"],
            correct: 1,
            explanation: "Completed in 2003, the Human Genome Project mapped all ~20,000 human genes."
        },
        {
            q: "What does GMO stand for?",
            options: ["Generic Modified Organism", "Genetically Modified Organism", "Genome Mapping Operation", "Gene Modulating Output"],
            correct: 1,
            explanation: "GMO (Genetically Modified Organism) refers to organisms whose DNA has been altered using biotechnology."
        },
        {
            q: "What are antibodies?",
            options: ["Bacteria killers", "Proteins that fight specific antigens", "Types of DNA", "Energy molecules"],
            correct: 1,
            explanation: "Antibodies are Y-shaped proteins produced by the immune system to identify and neutralize foreign objects."
        },
        {
            q: "What is bioinformatics?",
            options: ["Studying animal behavior", "Using computers to analyze biological data", "Growing tissues in labs", "Creating new species"],
            correct: 1,
            explanation: "Bioinformatics applies computer science and statistics to analyze biological data like DNA sequences."
        }
    ],
    5: [ // After Manager → VP
        {
            q: "What is gene therapy?",
            options: ["Talking to your genes", "Treating disease by modifying genes", "A type of exercise", "Genetic counseling"],
            correct: 1,
            explanation: "Gene therapy treats diseases by inserting, altering, or removing genes within a patient's cells."
        },
        {
            q: "What is monoclonal antibody therapy used for?",
            options: ["Just cancer", "Just infections", "Cancer, autoimmune diseases, and viral infections", "Only allergies"],
            correct: 2,
            explanation: "Monoclonal antibodies are engineered proteins used to treat many conditions including cancer, COVID-19, and autoimmune diseases."
        },
        {
            q: "What is synthetic biology?",
            options: ["Making fake organisms", "Designing biological systems for new purposes", "Plastic surgery", "Robot engineering"],
            correct: 1,
            explanation: "Synthetic biology designs and constructs new biological parts, devices, and systems."
        },
        {
            q: "Which is NOT a common biotech application?",
            options: ["Disease diagnosis", "Crop improvement", "Building skyscrapers", "Biofuel production"],
            correct: 2,
            explanation: "Biotech is widely used in medicine, agriculture, and energy — but not construction!"
        },
        {
            q: "What is personalized medicine?",
            options: ["Same drugs for everyone", "Medicine tailored to individual genetics", "Home remedies", "Mental health therapy"],
            correct: 1,
            explanation: "Personalized medicine uses genetic information to customize treatments for individual patients."
        }
    ],
    6: [ // After VP → CEO
        {
            q: "What is mRNA vaccine technology famous for?",
            options: ["Treating cancer", "Fighting COVID-19", "Curing diabetes", "Anti-aging"],
            correct: 1,
            explanation: "mRNA vaccines (like Pfizer and Moderna) revolutionized vaccine development during the COVID-19 pandemic."
        },
        {
            q: "What is bioprinting?",
            options: ["Printing biology textbooks", "3D printing of living tissues", "DNA fingerprinting", "Photographing cells"],
            correct: 1,
            explanation: "Bioprinting uses 3D printers with bio-inks to create tissues and potentially organs for transplantation."
        },
        {
            q: "What does 'in vitro' mean?",
            options: ["In a living organism", "In glass / outside the body", "In nature", "In computers"],
            correct: 1,
            explanation: "'In vitro' is Latin for 'in glass' — experiments done in test tubes or petri dishes outside living organisms."
        },
        {
            q: "What is the gut microbiome?",
            options: ["A digestive organ", "Microorganisms living in your intestines", "A type of vitamin", "Stomach acid"],
            correct: 1,
            explanation: "The gut microbiome consists of trillions of microorganisms that play vital roles in digestion, immunity, and health."
        },
        {
            q: "What's the future potential of biotechnology?",
            options: ["Only making food", "Curing diseases, sustainability, and longevity", "Just lab experiments", "Replacing all jobs"],
            correct: 1,
            explanation: "Biotech holds promise for curing diseases, sustainable agriculture, climate solutions, and extending healthy human lifespan."
        }
    ]
};

let quizState = {
    questions: [],
    currentIndex: 0,
    score: 0,
    answered: false
};

function startQuiz() {
    const questions = BIOTECH_QUIZ[currentRank];
    if (!questions) {
        // No quiz for this rank, skip directly
        continueAfterPromotion();
        return;
    }

    quizState = {
        questions: questions,
        currentIndex: 0,
        score: 0,
        answered: false
    };

    hideAllScreens();
    document.getElementById("quiz-screen").classList.remove("hidden");
    document.getElementById("quiz-total").textContent = questions.length;
    document.getElementById("quiz-max").textContent = questions.length;
    renderQuizQuestion();
}

function renderQuizQuestion() {
    const q = quizState.questions[quizState.currentIndex];
    quizState.answered = false;

    document.getElementById("quiz-current").textContent = quizState.currentIndex + 1;
    document.getElementById("quiz-score").textContent = quizState.score;
    document.getElementById("quiz-question").textContent = q.q;

    const progress = ((quizState.currentIndex) / quizState.questions.length) * 100;
    document.getElementById("quiz-progress-fill").style.width = `${progress}%`;

    const optionsContainer = document.getElementById("quiz-options");
    optionsContainer.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D'];
    q.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option';
        btn.innerHTML = `<span class="quiz-option-letter">${letters[i]}</span><span>${opt}</span>`;
        btn.onclick = () => selectAnswer(i);
        optionsContainer.appendChild(btn);
    });

    document.getElementById("quiz-feedback").classList.add("hidden");
    document.getElementById("quiz-next-btn").classList.add("hidden");
}

function selectAnswer(selectedIndex) {
    if (quizState.answered) return;
    quizState.answered = true;

    const q = quizState.questions[quizState.currentIndex];
    const buttons = document.querySelectorAll('.quiz-option');

    buttons.forEach((btn, i) => {
        btn.disabled = true;
        if (i === q.correct) {
            btn.classList.add('correct');
        } else if (i === selectedIndex && i !== q.correct) {
            btn.classList.add('incorrect');
        }
    });

    if (selectedIndex === q.correct) {
        quizState.score++;
        document.getElementById("quiz-score").textContent = quizState.score;
    }

    // Show explanation
    const feedback = document.getElementById("quiz-feedback");
    feedback.classList.remove("hidden");
    const prefix = selectedIndex === q.correct ? "✓ Correct! " : "✗ Not quite. ";
    document.getElementById("quiz-feedback-text").textContent = prefix + q.explanation;

    // Show next button
    const nextBtn = document.getElementById("quiz-next-btn");
    nextBtn.classList.remove("hidden");
    const isLast = quizState.currentIndex === quizState.questions.length - 1;
    nextBtn.querySelector('.btn-text').textContent = isLast ? "See Results" : "Next Question";
}

function nextQuizQuestion() {
    quizState.currentIndex++;
    if (quizState.currentIndex >= quizState.questions.length) {
        showQuizResult();
    } else {
        renderQuizQuestion();
    }
}

function showQuizResult() {
    hideAllScreens();
    document.getElementById("quiz-result-screen").classList.remove("hidden");

    const total = quizState.questions.length;
    const percent = (quizState.score / total) * 100;
    const bonus = quizState.score * 100;
    score += bonus;

    document.getElementById("quiz-result-score").textContent = `${quizState.score} / ${total}`;
    document.getElementById("quiz-bonus").textContent = `+${bonus}`;

    let title, message, icon;
    if (percent === 100) {
        title = "Perfect Score!";
        message = "You're a biotech genius! Knowledge is power.";
        icon = "🏆";
    } else if (percent >= 80) {
        title = "Excellent!";
        message = "Great knowledge of biotechnology!";
        icon = "🎓";
    } else if (percent >= 60) {
        title = "Good Job!";
        message = "Solid effort — keep learning!";
        icon = "📚";
    } else if (percent >= 40) {
        title = "Nice Try!";
        message = "Every question is a learning opportunity.";
        icon = "💡";
    } else {
        title = "Keep Learning!";
        message = "Biotech is fascinating — review and try again next time!";
        icon = "🔬";
    }

    document.getElementById("quiz-result-title").textContent = title;
    document.getElementById("quiz-result-message").textContent = message;
    document.getElementById("quiz-result-icon").textContent = icon;
}

function continueAfterPromotion() {
    hideAllScreens();
    document.getElementById("game-screen").classList.remove("hidden");
    generateLevel();
    gameState = "playing";
    gameLoop();
}

// ==================== START ====================
window.onload = init;
