# The Last Intern: Climb the Corporate Ladder

A platformer game where you climb from intern to CEO by jumping across platforms, collecting powerups, and avoiding corporate obstacles.

## How to Run

1. **Clone or download** this repository
2. **Open the game** — do one of the following:
   - Double-click `index.html` to open it directly in your browser
   - Or use a local server (recommended for best experience):
     ```bash
     # Using Python
     python -m http.server 8000

     # Using Node.js (npx)
     npx serve .

     # Using VS Code
     # Install "Live Server" extension, then right-click index.html → "Open with Live Server"
     ```
3. **Play** at `http://localhost:8000` (if using a local server)

## Controls

| Key | Action |
|-----|--------|
| ← → or A/D | Move left/right |
| SPACE or W/↑ | Jump |

## How to Play

1. Click **"Start Internship"** on the title screen
2. Jump across platforms to climb upward toward the **elevator (⬆)** at the top
3. Collect powerups along the way for points and abilities
4. Avoid obstacles — hitting one costs a life
5. Reach the elevator to get **promoted** to the next rank
6. Repeat through all floors until you become **CEO**

## Rules

- You start with **5 lives** (❤️❤️❤️❤️❤️)
- Hitting an obstacle (📧📅🧑‍💼📊💼) removes 1 life
- Falling off the bottom of the screen removes 1 life
- Losing all lives ends the game
- Collecting items quickly builds a **combo** (up to 5x score multiplier)
- The combo resets if you take damage or stop collecting for too long

### Powerups

| Item | Effect |
|------|--------|
| ☕ Coffee | Temporary speed boost |
| ⭐ Star Review | Temporary shield (blocks one hit) |
| 📎 Paperclip | +25 points (× combo) |
| 💡 Idea | +75 points (× combo) |

### Obstacles

| Item | Threat |
|------|--------|
| 📧 Email | Static hazard |
| 📅 Meeting | Static hazard |
| 🧑‍💼 Manager | Static hazard |
| 📊 Report | Static hazard |
| 💼 Extra Work | Static hazard |

> On higher floors, obstacles start **moving** and platforms may **shift**, increasing difficulty.

### Rank Progression

```
Intern → Junior Developer → Senior Developer → Team Lead → Manager → VP of Engineering → CEO
```

Each promotion takes you to a harder floor with more obstacles, moving platforms, and tighter jumps.

## Features

- 6 selectable themes (Midnight, Cyberpunk, Forest, Ocean, Sunset, Monochrome)
- 7 ranks to climb: Intern → Junior Developer → Senior → Team Lead → Manager → VP → CEO
- Combo system with score multipliers
- Collectible powerups (☕ speed boost, ⭐ shield, 📎💡 points)
- Obstacles to avoid (📧 emails, 📅 meetings, 🧑‍💼 managers)
- Procedurally generated levels with increasing difficulty