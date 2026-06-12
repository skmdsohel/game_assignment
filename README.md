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

## Features

- 6 selectable themes (Midnight, Cyberpunk, Forest, Ocean, Sunset, Monochrome)
- 7 ranks to climb: Intern → Junior Developer → Senior → Team Lead → Manager → VP → CEO
- Combo system with score multipliers
- Collectible powerups (☕ speed boost, ⭐ shield, 📎💡 points)
- Obstacles to avoid (📧 emails, 📅 meetings, 🧑‍💼 managers)
- Procedurally generated levels with increasing difficulty