// ==================== GAME CONSTANTS ====================
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const GRAVITY = 0.6;
const JUMP_FORCE = -13;
const MOVE_SPEED = 5;
const HUD_HEIGHT = 40;

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
let elevator = null;
let keys = {};
let speedBoostTimer = 0;
let shieldTimer = 0;
let cameraY = 0;
let levelComplete = false;
let animationId = null;

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
}

function startGame() {
    score = 0;
    lives = 3;
    currentRank = 0;
    currentFloor = 1;
    speedBoostTimer = 0;
    shieldTimer = 0;

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
    levelComplete = false;

    const difficulty = currentRank;
    const numPlatforms = 15 + difficulty * 3;
    const levelHeight = numPlatforms * 80;

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
        facing: 1
    };

    cameraY = 0;

    // Generate platforms going upward
    let lastY = CANVAS_HEIGHT - 120;
    for (let i = 0; i < numPlatforms; i++) {
        const gap = 60 + Math.random() * 40;
        lastY -= gap;
        const width = 80 + Math.random() * 100 - difficulty * 5;
        const x = Math.random() * (CANVAS_WIDTH - width);

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

    // Place elevator at top
    elevator = {
        x: CANVAS_WIDTH / 2 - 30,
        y: lastY - 100,
        width: 60,
        height: 70
    };

    // Platform near elevator
    platforms.push({
        x: CANVAS_WIDTH / 2 - 60,
        y: lastY - 30,
        width: 120,
        height: 15,
        type: "elevator-platform"
    });

    updateHUD();
}

// ==================== GAME LOOP ====================
function gameLoop() {
    if (gameState !== "playing") return;

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
        spawnParticles(player.x + player.width / 2, player.y + player.height, "#10b981", 5);
    }

    // Apply gravity
    player.vy += GRAVITY;
    player.x += player.vx;
    player.y += player.vy;

    // Screen wrap horizontally
    if (player.x + player.width < 0) player.x = CANVAS_WIDTH;
    if (player.x > CANVAS_WIDTH) player.x = -player.width;

    // Platform collision
    player.onGround = false;
    for (let plat of platforms) {
        // Update moving platforms
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
            player.vy = 0;
            player.onGround = true;

            // Move with platform
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
                spawnParticles(obs.x + obs.width / 2, obs.y + obs.height / 2, "#fbbf24", 10);
                obs.x = -1000; // Remove
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
            score += col.type.points;
            spawnParticles(col.x + col.width / 2, col.y + col.height / 2, "#10b981", 8);

            if (col.type.effect === "speed") speedBoostTimer = 180;
            if (col.type.effect === "shield") shieldTimer = 300;
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

    // Camera follow
    const targetCameraY = -(player.y - CANVAS_HEIGHT * 0.6);
    if (targetCameraY > cameraY) {
        cameraY += (targetCameraY - cameraY) * 0.1;
    }
    // Only scroll up
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
        p.vy += 0.2;
        p.life--;
        return p.life > 0;
    });
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
    spawnParticles(player.x + player.width / 2, player.y + player.height / 2, "#ef4444", 15);
    updateHUD();

    if (lives <= 0) {
        gameState = "gameover";
        showGameOverScreen();
    } else {
        resetPlayerPosition();
    }
}

function resetPlayerPosition() {
    // Find nearest platform below or at current camera position
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
function spawnParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            color: color,
            life: 20 + Math.random() * 20,
            size: 3 + Math.random() * 4
        });
    }
}

// ==================== RENDERING ====================
function render() {
    // Background gradient based on rank
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, "#0f172a");
    gradient.addColorStop(1, "#1e293b");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw background office elements
    drawBackground();

    ctx.save();
    ctx.translate(0, cameraY);

    // Draw platforms
    for (let plat of platforms) {
        if (plat.type === "ground") {
            ctx.fillStyle = "#374151";
            ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
            ctx.fillStyle = "#4b5563";
            ctx.fillRect(plat.x, plat.y, plat.width, 3);
        } else if (plat.type === "elevator-platform") {
            ctx.fillStyle = "#10b981";
            ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
            ctx.fillStyle = "#34d399";
            ctx.fillRect(plat.x, plat.y, plat.width, 3);
        } else {
            ctx.fillStyle = "#475569";
            ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
            ctx.fillStyle = "#64748b";
            ctx.fillRect(plat.x, plat.y, plat.width, 3);

            if (plat.moving) {
                ctx.fillStyle = "#fbbf24";
                ctx.fillRect(plat.x, plat.y, plat.width, 3);
            }
        }
    }

    // Draw elevator
    if (elevator) {
        ctx.fillStyle = "#1f2937";
        ctx.fillRect(elevator.x, elevator.y, elevator.width, elevator.height);
        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 2;
        ctx.strokeRect(elevator.x, elevator.y, elevator.width, elevator.height);

        // Elevator doors
        ctx.fillStyle = "#374151";
        ctx.fillRect(elevator.x + 5, elevator.y + 10, elevator.width / 2 - 7, elevator.height - 15);
        ctx.fillRect(elevator.x + elevator.width / 2 + 2, elevator.y + 10, elevator.width / 2 - 7, elevator.height - 15);

        // Arrow up
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.fillStyle = "#10b981";
        ctx.fillText("⬆️", elevator.x + elevator.width / 2, elevator.y - 5);
    }

    // Draw obstacles
    for (let obs of obstacles) {
        ctx.font = `${obs.height}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(obs.type.emoji, obs.x + obs.width / 2, obs.y + obs.height / 2);
    }

    // Draw collectibles
    for (let col of collectibles) {
        if (col.collected) continue;
        const bobY = Math.sin(col.bobOffset) * 5;
        ctx.font = "22px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(col.type.emoji, col.x + col.width / 2, col.y + col.height / 2 + bobY);
    }

    // Draw player
    drawPlayer();

    // Draw particles
    for (let p of particles) {
        ctx.globalAlpha = p.life / 40;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;

    ctx.restore();

    // Draw speed boost indicator
    if (speedBoostTimer > 0) {
        ctx.fillStyle = "rgba(251, 191, 36, 0.3)";
        ctx.fillRect(0, CANVAS_HEIGHT - 5, (speedBoostTimer / 180) * CANVAS_WIDTH, 5);
    }

    // Draw shield indicator
    if (shieldTimer > 0) {
        ctx.fillStyle = "rgba(16, 185, 129, 0.3)";
        ctx.fillRect(0, CANVAS_HEIGHT - 10, (shieldTimer / 300) * CANVAS_WIDTH, 5);
    }
}

function drawBackground() {
    // Office building windows in background
    ctx.globalAlpha = 0.1;
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 12; j++) {
            ctx.fillStyle = (i + j) % 3 === 0 ? "#fbbf24" : "#64748b";
            ctx.fillRect(50 + i * 95, 30 + j * 50 + (cameraY * 0.1) % 50, 40, 30);
        }
    }
    ctx.globalAlpha = 1;
}

function drawPlayer() {
    const px = player.x;
    const py = player.y;
    const pw = player.width;
    const ph = player.height;

    // Shield glow
    if (shieldTimer > 0) {
        ctx.strokeStyle = "rgba(16, 185, 129, 0.5)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(px + pw / 2, py + ph / 2, 25, 0, Math.PI * 2);
        ctx.stroke();
    }

    // Speed trail
    if (speedBoostTimer > 0) {
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = "#fbbf24";
        ctx.fillRect(px - player.facing * 5, py + 10, 5, ph - 20);
        ctx.globalAlpha = 1;
    }

    // Body (suit)
    ctx.fillStyle = RANKS[currentRank].color;
    ctx.fillRect(px + 5, py + 15, pw - 10, ph - 20);

    // Head
    ctx.fillStyle = "#fcd34d";
    ctx.beginPath();
    ctx.arc(px + pw / 2, py + 10, 10, 0, Math.PI * 2);
    ctx.fill();

    // Tie
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.moveTo(px + pw / 2, py + 18);
    ctx.lineTo(px + pw / 2 - 3, py + 30);
    ctx.lineTo(px + pw / 2 + 3, py + 30);
    ctx.closePath();
    ctx.fill();

    // Eyes
    ctx.fillStyle = "#1a1a2e";
    const eyeOffsetX = player.facing * 2;
    ctx.fillRect(px + pw / 2 - 4 + eyeOffsetX, py + 7, 3, 3);
    ctx.fillRect(px + pw / 2 + 2 + eyeOffsetX, py + 7, 3, 3);

    // Legs
    ctx.fillStyle = "#374151";
    ctx.fillRect(px + 8, py + ph - 8, 5, 8);
    ctx.fillRect(px + pw - 13, py + ph - 8, 5, 8);
}

// ==================== UI UPDATES ====================
function updateHUD() {
    document.getElementById("level-display").textContent = `Rank: ${RANKS[currentRank].title}`;
    document.getElementById("floor-display").textContent = `Floor ${currentFloor}`;
    document.getElementById("score-display").textContent = `Score: ${score}`;
    document.getElementById("lives-display").textContent = "❤️".repeat(lives) + "🖤".repeat(3 - lives);
}

// ==================== SCREEN TRANSITIONS ====================
function showGameOverScreen() {
    hideAllScreens();
    document.getElementById("gameover-screen").classList.remove("hidden");
    document.getElementById("final-score").textContent = `Final Score: ${score}`;
    document.getElementById("final-rank").textContent = `Highest Rank: ${RANKS[currentRank].title}`;

    const messages = [
        "Your badge has been deactivated...",
        "HR would like a word with you...",
        "Your desk has been cleared...",
        "Your parking spot has been reassigned...",
        "The vending machine rejected your card..."
    ];
    document.getElementById("gameover-message").textContent = messages[Math.floor(Math.random() * messages.length)];
}

function showPromotionScreen() {
    hideAllScreens();
    document.getElementById("promotion-screen").classList.remove("hidden");
    document.getElementById("promotion-text").textContent = `You are now a ${RANKS[currentRank].title}!`;

    const arts = ["📈", "🏆", "💰", "🎯", "🚀", "👑"];
    document.getElementById("promotion-art").textContent = arts[Math.min(currentRank - 1, arts.length - 1)];
}

function showWinScreen() {
    hideAllScreens();
    document.getElementById("win-screen").classList.remove("hidden");
    document.getElementById("win-score").textContent = `Final Score: ${score}`;
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
