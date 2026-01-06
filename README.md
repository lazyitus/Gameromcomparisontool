# 🎮 ROM Arcade Manager

A beautiful desktop application for managing your ROM collection with DAT file support. Features a neon 80s arcade aesthetic with hot pink/cyan/purple colors.

## 🌟 Features

- **Direct Directory Access** - Point to folders containing DAT files and ROM lists
- **Multi-System Support** - Load multiple DAT files and ROM lists at once
- **Smart Matching** - Fuzzy matching to compare your ROMs against DAT databases
- **Comprehensive Filtering** - Filter by region, release type (commercial, prototypes, demos, homebrew)
- **Want List** - Track missing games with pixel art console icons
- **Persistent Storage** - All data saved locally in the app
- **80s Arcade Aesthetic** - Neon glow effects, grid backgrounds, Orbitron font

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

```bash
# Install dependencies
pnpm install

# Development mode (Electron app)
pnpm run electron:dev

# Build for production
pnpm run build
```

## 📁 How to Use

### 1. Load DAT Files

In the **Setup** tab:
- Click "Select DAT Directory" to load all .dat/.xml files from a folder
- OR click "Select Individual Files" to pick specific DAT files
- Compatible with No-Intro, Redump, TOSEC, and other standard DAT formats

### 2. Load ROM Lists

After loading DAT files:
- Click "Select ROM Lists Directory" to load all .txt files containing your ROM names
- The app will try to auto-match files to systems
- Manually assign any unmatched lists to the correct system
- Each ROM list should be a text file with one ROM filename per line

### 3. Analyze Your Collection

In the **ROM Collection** tab:
- View all games from your DAT files
- See which games you HAVE (green) and DON'T HAVE (red)
- Filter by:
  - Region (USA, Europe, Japan, World, etc.)
  - Category (Commercial, Prototype, Demo, Homebrew, Pirate/Hack)
  - Status (Owned, Missing, All)
  - Search by game name

### 4. Build Your Want List

- Click "Add to Want List" on missing games
- View organized want list in the **Want List** tab
- Games automatically removed when found in updated collections
- Grouped by system with pixel art console icons

## 🛠️ Building Executables

```bash
# Build for all platforms
pnpm run build

# Build for specific platform
pnpm run build -- --mac
pnpm run build -- --win
pnpm run build -- --linux

# Build without installer (faster)
pnpm run build:dir
```

Executables will be in the `/release` directory.

## 📂 Project Structure

```
rom-arcade-manager/
├── electron/           # Electron main & preload scripts
│   ├── main.js        # Main process (window, IPC handlers)
│   └── preload.js     # Secure bridge to renderer
├── src/
│   ├── app/
│   │   ├── components/  # React components
│   │   └── App.tsx      # Main app component
│   ├── styles/          # CSS and themes
│   └── electron.d.ts    # TypeScript definitions
├── scripts/
│   └── build.js         # Build orchestration
└── release/            # Built applications
```

## 🎨 Architecture

- **Frontend**: React + TypeScript + Tailwind CSS v4
- **Desktop**: Electron with secure IPC
- **Storage**: localStorage for persistence
- **File Access**: Node.js fs APIs via Electron main process
- **Build**: Vite + electron-builder

## ⚡ Key Technologies

- **Electron** - Desktop app framework
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **Radix UI** - Accessible components
- **Lucide Icons** - Icon library
- **electron-builder** - App packaging

## 🔒 Security

- Context isolation enabled
- No nodeIntegration in renderer
- Secure IPC via preload script
- All file access controlled by main process

## 📝 Notes

- DAT files must be in XML format (standard for No-Intro, Redump, TOSEC)
- ROM lists should be plain text files with one filename per line
- All processing happens locally - nothing uploaded to servers
- Settings and want list stored in localStorage

## 🎯 Roadmap

- [ ] Export want lists to CSV/text
- [ ] Import from ROM Manager formats
- [ ] Batch rename suggestions
- [ ] Missing ROMs report generation
- [ ] Cloud backup of want lists

## 📜 License

MIT License - feel free to use and modify!

---

Built with 💜 for ROM collectors everywhere
