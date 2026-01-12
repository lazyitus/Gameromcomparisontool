# 🎮 ROM Arcade Manager

A beautiful desktop application for managing your ROM collection with DAT file support. Features a neon 80s arcade aesthetic with hot pink/cyan/purple colors, perfect for arcade monitors and CRT displays.

## 🌟 Features

### Core Functionality
- **Direct Directory Access** - Point to folders containing DAT files and ROM lists
- **Multi-System Support** - Load multiple DAT files and ROM lists at once
- **Advanced Smart Matching** - Intelligent ROM-to-DAT matching with:
  - Strict region matching (50+ countries/regions supported)
  - One ROM = One Game enforcement (prevents duplicate assignments)
  - 85% length similarity rule to prevent false matches
  - Word-level matching for precision
- **Cross-Platform Game Detection** - Discover which games exist across multiple systems
- **DAT ↔ ROM Association Manager** - Visual system for managing which ROM lists match to which DAT files
- **Comprehensive Filtering** - Filter by region, release type (commercial, prototypes, demos, homebrew, clones/revisions)
- **Want List** - Track missing games with pixel art console icons
- **Persistent Storage** - All data saved locally with localStorage
- **80s Arcade Aesthetic** - Neon glow effects, grid backgrounds, Orbitron font, theme toggle

### Advanced Features
- **Arcade DAT Support** - Full support for MAME/arcade DATs with clone detection
- **Ultra-Compact Layout** - Optimized for 512x448 resolution (CRT/arcade monitors)
- **Smart Region Handling** - Understands regional hierarchies:
  - France, Germany, Spain → Europe
  - Canada → USA
  - Korea, China, Taiwan → Asia
  - World ROMs match any region
- **Persistent Filter Settings** - All filter preferences saved between sessions
- **Live Matching Progress** - Real-time progress tracking during ROM matching
- **Four-Tab Interface**:
  - 🎮 **ROM Collection** - Browse and filter your entire collection
  - 🌍 **Cross-Platform Games** - See games available on multiple systems
  - ✅ **Want List** - Track games you want to acquire
  - ⚙️ **Setup** - Manage DATs, ROM lists, and system associations

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
- Compatible with No-Intro, Redump, TOSEC, MAME, and other standard DAT formats
- System names auto-detected from filenames

### 2. Load ROM Lists

After loading DAT files:
- Click "Select ROM Lists Directory" to load all .txt files containing your ROM names
- The app will auto-match files to systems based on naming
- Manually assign any unmatched lists in the **DAT ↔ ROM Associations** section
- Each ROM list should be a text file with one ROM filename per line

### 3. Match Your Collection

- Click **"Match New Systems"** to match only newly added systems
- Click **"Re-Match All"** to rebuild the entire database from scratch
- Watch real-time progress with system-by-system updates
- All results saved automatically to localStorage

### 4. Analyze Your Collection

In the **ROM Collection** tab:
- View all games from your DAT files
- See which games you HAVE (green checkmark) and DON'T HAVE (red X)
- Filter by:
  - **Region** - USA, Europe, Japan, France, Germany, Spain, World, etc. (50+ regions)
  - **Category** - Commercial, Prototype, Demo, Homebrew, Pirate/Hack
  - **Status** - Owned, Missing, All
  - **Clones/Revisions** - Show or hide alternate versions
  - **Search** - Find games by name
- Compact grid view optimized for CRT displays

### 5. Discover Cross-Platform Games

In the **Cross-Platform Games** tab:
- See which games exist on multiple systems
- Filter by minimum platform count (2+, 3+, etc.)
- View owned vs. missing status per platform
- Perfect for collectors who want multi-system coverage

### 6. Build Your Want List

- Click "Add to Want List" on missing games
- View organized want list in the **Want List** tab
- Games automatically removed when found in updated collections
- Grouped by system with pixel art console icons
- See game regions and categories

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
│   │   │   ├── GameComparison.tsx        # Main collection view
│   │   │   ├── CrossPlatformGames.tsx    # Cross-platform detection
│   │   │   ├── WantList.tsx              # Want list management
│   │   │   ├── SystemAssociationManager.tsx  # DAT ↔ ROM mapping
│   │   │   └── ui/                       # Radix UI components
│   │   └── App.tsx      # Main app component with tab system
│   ├── styles/          # CSS and themes (arcade aesthetic)
│   └── electron.d.ts    # TypeScript definitions
├── scripts/
│   └── build.js         # Build orchestration
└── release/            # Built applications
```

## 🎨 Architecture

- **Frontend**: React + TypeScript + Tailwind CSS v4
- **Desktop**: Electron with secure IPC
- **Storage**: localStorage for persistence (all data client-side)
- **File Access**: Node.js fs APIs via Electron main process
- **Build**: Vite + electron-builder
- **Resolution**: Optimized for 512x448 arcade monitors (but responsive to any size)

## ⚡ Key Technologies

- **Electron** - Desktop app framework
- **React 18** - UI framework with hooks
- **TypeScript** - Type safety throughout
- **Tailwind CSS v4** - Utility-first styling
- **Radix UI** - Accessible, unstyled components
- **Lucide Icons** - Modern icon library
- **electron-builder** - App packaging for all platforms

## 🔒 Security

- Context isolation enabled
- No nodeIntegration in renderer
- Secure IPC via preload script
- All file access controlled by main process
- No network requests (100% offline)

## 🎯 Matching Algorithm

The app uses an advanced multi-pass matching algorithm:

1. **Region Extraction** - Detects 50+ region codes (USA, France, Germany, etc.)
2. **Region Normalization** - Maps countries to parent regions (France → Europe)
3. **Region Validation** - ROMs must match DAT regions (USA ≠ France)
4. **Name Normalization** - Strips regions, versions, special characters
5. **Length Check** - 85% similarity rule prevents "Final Fight" matching "Final Fight 2"
6. **Word Matching** - All significant words must match exactly
7. **Duplicate Prevention** - Each ROM can only match ONE game in the DAT

**Example:**
- ✅ `"Aladdin (USA).md"` matches `"Aladdin (USA)"` DAT entry
- ❌ `"Aladdin (USA).md"` does NOT match `"Aladdin (France)"` DAT entry
- ❌ `"Final Fight.zip"` does NOT match `"Final Fight 2"` DAT entry

## 📝 Notes

- DAT files must be in XML format (standard for No-Intro, Redump, TOSEC, MAME)
- ROM lists should be plain text files with one filename per line
- All processing happens locally - nothing uploaded to servers
- Settings, want list, and comparison results stored in localStorage
- Compatible with CRT monitors and arcade cabinets (512x448 optimized)
- Light/dark theme toggle available

## 🎯 Roadmap

- [x] Cross-platform game detection
- [x] Advanced region matching with country support
- [x] Clone/revision filtering for arcade DATs
- [x] DAT ↔ ROM association manager
- [x] One ROM = One Game matching enforcement
- [ ] Export want lists to CSV/text
- [ ] Import from ROM Manager formats
- [ ] Batch rename suggestions based on DAT names
- [ ] Missing ROMs report generation
- [ ] Cloud backup of want lists

## 📜 License

MIT License - feel free to use and modify!

---

Built with 💜 for ROM collectors everywhere
