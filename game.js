// ==================== GAME CONSTANTS ====================
const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;
const GRAVITY = 0.5;
const JUMP_FORCE = -15;
const MOVE_SPEED = 5.5;

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
let lives = 3;
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
    lives = 3;
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
    const numPlatforms = 15 + difficulty * 3;

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
        const gap = 50 + Math.random() * 30;
        lastY -= gap;
        const width = 100 + Math.random() * 100 - difficulty * 5;
        // Keep platforms horizontally reachable from the previous one
        const maxHorizontalJump = 250;
        let x = lastX + (Math.random() - 0.5) * maxHorizontalJump;
        x = Math.max(0, Math.min(CANVAS_WIDTH - width, x));
        lastX = x + width / 2;

        platforms.push({
            x: x,
            y: lastY,
            width: Math.max(width, 50),
            height: 15,
            type: "normal",
            moving: difficulty > 1 && Math.random() < 0.2 ? { speed: 1 + Math.random(), dir: 1, range: 100, startX: x } : null
        });

        // Add obstacles on some platforms
        if (i > 2 && Math.random() < 0.3 + difficulty * 0.05) {
            const obsType = OBSTACLE_TYPES[Math.floor(Math.random() * Math.min(OBSTACLE_TYPES.length, 2 + difficulty))];
            obstacles.push({
                x: x + width / 2 - obsType.width / 2,
                y: lastY - obsType.height - 5,
                width: obsType.width,
                height: obsType.height,
                type: obsType,
                moving: difficulty > 2 && Math.random() < 0.3 ? { speed: 1.5, dir: 1, range: 60, startX: x + width / 2 - obsType.width / 2 } : null
            });
        }

        // Add collectibles
        if (Math.random() < 0.4) {
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

    // Elevator platform directly above last platform — very close
    const elevPlatY = lastY - 30;
    platforms.push({
        x: CANVAS_WIDTH / 2 - 100,
        y: elevPlatY,
        width: 200,
        height: 15,
        type: "elevator-platform"
    });

    // Place elevator sitting on the platform (player walks into it)
    elevator = {
        x: CANVAS_WIDTH / 2 - 35,
        y: elevPlatY - 48,
        width: 70,
        height: 50
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

    // Check elevator
    if (elevator && checkCollision(player, elevator)) {
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
    for (let i = 0; i < 3; i++) {
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

function continueAfterPromotion() {
    hideAllScreens();
    document.getElementById("game-screen").classList.remove("hidden");
    generateLevel();
    gameState = "playing";
    gameLoop();
}

// ==================== START ====================
window.onload = init;
