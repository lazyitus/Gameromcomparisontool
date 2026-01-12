# ROM Collection Manager - Desktop Application

## 🎮 What is this?

A desktop tool for managing and tracking your ROM collections across multiple gaming systems. It reads DAT files (No-Intro, Redump, TOSEC, MAME, etc.) and compares them against your actual ROM collection to show you exactly what you have, what you're missing, and lets you track what you want to acquire.

**NEW:** Now with advanced region matching, cross-platform game detection, arcade DAT support, and ultra-compact layouts perfect for CRT arcade monitors!

## ❓ The Problem It Solves

If you collect ROMs for retro systems, you've probably run into these issues:

- **🤷 No idea what you actually have** - You have folders full of ROMs but no clear picture of your collection
- **🌍 Region confusion** - Your USA ROM is matching European DAT entries (wrong!)
- **🎮 Cross-platform blindness** - You don't know which games exist on multiple systems you own
- **📋 Duplicate tracking work** - Manually checking DAT files against your collection is tedious
- **🗂️ Multiple systems, multiple formats** - Different systems use different DAT formats and naming conventions
- **📝 No centralized want list** - You're tracking missing games in text files or spreadsheets
- **🔍 Can't filter effectively** - Want to see only USA releases? Only official games? Good luck doing that manually
- **🕹️ Arcade DATs are a mess** - MAME DATs have thousands of clones and you can't see what's what

This tool handles all of that automatically.

## ⚡ Key Features

### 📂 Advanced DAT File Support
- Reads XML DAT files from No-Intro, Redump, TOSEC, MAME, and other standard sources
- Handles multiple systems simultaneously (load 10+ DATs at once)
- Auto-detects system names from filenames
- **NEW:** Full arcade DAT support with clone/parent detection
- **NEW:** DAT ↔ ROM Association Manager for visual system mapping

### 🎯 Intelligent ROM Matching
- **Region-Aware Matching** - Supports 50+ countries and regions:
  - Generic: USA, Europe, Japan, World, Asia
  - Country-Specific: France, Germany, Spain, Italy, UK, Netherlands, Sweden, Denmark, Norway, Finland
  - Asian Regions: Korea, China, Taiwan, Hong Kong
  - Others: Australia, Brazil, Canada
- **Smart Region Mapping** - France/Germany/Spain → Europe, Canada → USA
- **Strict Matching Rules**:
  - ✅ `Aladdin (USA).md` matches `Aladdin (USA)` DAT entry
  - ❌ `Aladdin (USA).md` does NOT match `Aladdin (France)` DAT entry
  - ❌ `Final Fight.zip` does NOT match `Final Fight 2` DAT entry
- **One ROM = One Game** - Prevents duplicate ROM assignments across multiple DAT entries
- **85% Length Rule** - Ensures similar-length names only (prevents false positives)
- **Word-Level Matching** - All significant words must match exactly

### 🌍 Cross-Platform Game Discovery (NEW!)
- **See which games exist across multiple systems you own**
- Filter by minimum platform count (2+, 3+, etc.)
- Shows owned vs. missing status for each platform
- Perfect for collecting the same game on different systems
- Example: See if you have Street Fighter II on SNES, Genesis, Arcade, etc.

### 🔧 Filtering & Organization
- **Region Filter** - USA, Europe, Japan, World, France, Germany, and 40+ more
- **Category Filter**:
  - Commercial releases (official games)
  - Prototypes/Betas
  - Demos/Samples
  - Homebrew/Aftermarket
  - Pirates/Hacks
- **Clone/Revision Filter** - Hide alternate versions and revisions (essential for arcade DATs)
- **Status Filter** - Owned, Missing, or All
- **Search** - Find games by name instantly
- **View Modes** - Compact grid or detailed cards
- **Filter Persistence** - All settings saved between sessions

### ⭐ Want List Management
- Add missing games to a trackable want list
- Organized by system with pixel art console icons
- Shows region and category for each wanted game
- Persistent across sessions (saved to localStorage)
- Games automatically removed when you acquire them

### 📊 System Association Manager (NEW!)
- Visual table showing which ROM lists are assigned to which DAT files
- Color-coded status (Matched, Needs Assignment, No DAT File)
- One-click reassignment with dropdown selectors
- See ROM counts per system at a glance
- Essential for managing large multi-system collections

### 💻 Desktop Application Features
- Native directory/file selection (no browser upload limits)
- Persistent data storage (localStorage)
- All processing happens locally on your machine (100% offline)
- Custom window controls (minimize, maximize, close)
- **Resolution Optimized** - Works on 512x448 arcade monitors AND modern displays
- Light/Dark theme toggle
- Neon 80s arcade aesthetic (hot pink/cyan/purple)

## 📖 How To Use It

### 1️⃣ Get Your DAT Files
Download DAT files for your systems from sources like:
- **No-Intro** - Cartridge-based systems (NES, SNES, Genesis, Game Boy, etc.)
- **Redump** - Disc-based systems (PlayStation, Saturn, Dreamcast, etc.)
- **TOSEC** - Comprehensive archives (computers, consoles, handhelds)
- **MAME** - Arcade systems (full clone/parent support)

### 2️⃣ Generate ROM Lists
Create a simple text file listing your ROMs (one filename per line). You can do this from command line:

**Windows:**
```
dir /b > romlist.txt
```

**Mac/Linux:**
```
ls > romlist.txt
```

Do this for each system folder you want to track.

### 3️⃣ Load Into The App

**⚙️ Setup Tab:**
- Click "Select DAT Directory" to load all your .dat/.xml files at once
- Click "Select ROM Lists Directory" to load all your ROM list .txt files
- The app auto-matches lists to systems based on filenames
- Use the **DAT ↔ ROM Associations** table to manually assign any mismatches
- Click **"Match New Systems"** to match only new additions
- Click **"Re-Match All"** to rebuild from scratch (after big updates)

**🕹️ ROM Collection Tab:**
- View all games from your DATs with Have (✓) / Missing (✗) status
- Apply filters:
  - **Region** - Choose from 50+ regions/countries
  - **Category** - Commercial, Prototype, Demo, Homebrew, Pirate
  - **Status** - Owned, Missing, All
  - **Clones** - Hide arcade clones and revisions
  - **Search** - Find specific games
- Add missing games to your want list with one click

**🌍 Cross-Platform Games Tab (NEW!):**
- Discover games that exist on multiple systems
- Filter by minimum platforms (show only games on 2+ systems, 3+ systems, etc.)
- See which platforms you own vs. missing
- Expandable rows show all regional variants per platform
- Example: Find all games you have on both SNES and Genesis

**✅ Want List Tab:**
- Review all games you want to acquire
- Organized by system with console icons
- Shows region and category for each game
- Remove games when acquired (or manually)

### 4️⃣ Update As You Go

**When you add new ROMs:**
- Generate a new ROM list for that system
- Upload it in Setup tab (it will replace the old one)
- Click **"Match New Systems"** to update just changed systems (fast!)

**When you get new DAT releases:**
- Upload the new DAT file
- It will replace the old version automatically
- Click **"Re-Match All"** to refresh everything with new data

**When you acquire wanted games:**
- Update your ROM list for that system
- Re-match in Setup tab
- Game automatically disappears from Want List (it's now owned!)

## 🎯 Advanced Matching Algorithm

The app uses a sophisticated multi-pass algorithm:

1. **Region Extraction** - Detects region codes in parentheses: (USA), (France), (Japan), etc.
2. **Region Normalization** - Maps specific countries to parent regions:
   - France, Germany, Spain, Italy → Europe
   - Canada → USA  
   - Korea, China, Taiwan → Asia
3. **Region Validation** - ROMs MUST match DAT regions:
   - ✅ USA ROM matches USA DAT entry
   - ❌ USA ROM does NOT match France DAT entry
   - ✅ World ROM matches ANY region
4. **Name Normalization** - Removes regions, versions, brackets, special characters
5. **Length Similarity** - 85% rule prevents "Mario" from matching "Mario Kart"
6. **Word Matching** - All significant words must be present in both names
7. **Duplicate Prevention** - Uses a Set to ensure each ROM only matches ONE game

**This eliminates false matches and ensures accuracy!**

## 🔧 Technical Details

- **Platform:** Electron desktop app (Windows/Mac/Linux)
- **Data Storage:** Local browser storage (localStorage) - all data stays on your machine
- **Processing:** 100% client-side, nothing sent to servers
- **DAT Format:** XML (standard for No-Intro/Redump/TOSEC/MAME)
- **ROM List Format:** Plain text, one filename per line
- **Resolution:** Optimized for 512x448 (arcade monitors) but responsive to any screen size
- **Dependencies:** React 18, TypeScript, Tailwind CSS v4, Radix UI, Lucide Icons

## 🚫 What This Doesn't Do

- It doesn't download or share ROMs (legal reasons)
- It doesn't modify your ROM files
- It doesn't scrape or connect to online databases
- It doesn't verify ROM checksums (use CLRMamePro for that)
- It's not a ROM manager like RomCenter or CLRMamePro (different use case - this is for tracking/want lists)

## 👥 Who Is This For?

- ROM collectors who want to track completion across systems
- People managing large multi-system collections (5+ systems)
- Anyone tired of manually cross-referencing DAT files
- Collectors who want filtered views (regions, release types, clones)
- Arcade collectors dealing with massive MAME DATs
- Multi-platform gamers who want to know which games they own on multiple systems
- CRT arcade cabinet owners (optimized for 512x448 resolution)

## 🎨 Arcade Aesthetic

Features a **neon 80s arcade theme** with:
- Hot pink, cyan, and purple color scheme
- Grid backgrounds (like Tron)
- Glowing UI elements
- Orbitron font (retro-futuristic)
- Pixel art console icons

**Not your style?** There's a light/dark theme toggle to switch to a more standard look.

## 🆕 Recent Updates

### v2.0 (Latest)
- ✅ **Cross-Platform Game Detection** - See games across multiple systems
- ✅ **Advanced Region Matching** - 50+ countries/regions with smart mapping
- ✅ **One ROM = One Game** - Prevents duplicate assignments
- ✅ **DAT ↔ ROM Association Manager** - Visual system mapping interface
- ✅ **Clone/Revision Filtering** - Essential for arcade DATs
- ✅ **85% Length Rule** - Prevents "Final Fight" from matching "Final Fight 2"
- ✅ **Word-Level Matching** - More precise game matching
- ✅ **Filter Persistence** - All filter settings saved between sessions
- ✅ **Live Progress Tracking** - See real-time matching progress

### v1.0
- Initial release with basic DAT/ROM comparison
- Want list functionality
- Multi-system support
- Basic filtering

## 🛠️ Installation

### Option 1: Download Pre-Built Binaries
1. Go to [Releases] (link to your releases page)
2. Download for your platform:
   - Windows: `.exe` installer
   - macOS: `.dmg` disk image
   - Linux: `.AppImage` or `.deb`
3. Install and run

### Option 2: Build From Source
```bash
# Clone the repository
git clone [your-repo-url]
cd rom-arcade-manager

# Install dependencies
pnpm install

# Run in development mode
pnpm run electron:dev

# Build for production
pnpm run build
```

## ✔️ System Requirements

- **Windows:** 10 or newer
- **macOS:** 10.13 (High Sierra) or newer
- **Linux:** Any modern distribution with GTK 3+
- **RAM:** 4GB recommended (handles large DAT files)
- **Disk:** 100MB for app + storage for your data

## 📄 License

MIT License - free to use, modify, and distribute!

---

## 🎮 Example Use Cases

**Scenario 1: New Collector**
> "I just downloaded the No-Intro NES set. I want to see what I have and build a want list of USA-only commercial releases."

1. Load NES DAT file
2. Generate ROM list from your collection
3. Filter: Region = USA, Category = Commercial
4. Add missing games to Want List
5. Done! You now have a curated want list.

**Scenario 2: Multi-System Collector**
> "I collect for SNES, Genesis, and Game Boy. I want to see which games I own on multiple platforms."

1. Load DAT files for all three systems
2. Load ROM lists for all three
3. Go to **Cross-Platform Games** tab
4. Filter: Minimum Platforms = 2
5. See all games you have (or could have) on multiple systems!

**Scenario 3: Arcade Collector**
> "I have a MAME collection but the DAT has 10,000 clones. I only want to see parent ROMs and USA releases."

1. Load MAME DAT file
2. Load MAME ROM list
3. Filter: Hide Clones/Revisions = ON, Region = USA
4. See only unique games in your preferred region!

**Scenario 4: Region Variant Collector**
> "I specifically collect French releases. I don't want USA ROMs matching my French DAT entries."

1. Load your DAT file (with French entries)
2. Load your ROM list
3. The app automatically prevents USA ROMs from matching France DAT entries
4. Only see accurate matches!

---

**📥 Download:** [Link to releases]

**💾 Source Code:** [Link to GitHub repo]

**🐛 Bug Reports:** [Link to issue tracker]

**💬 Discussion:** [Link to forum thread or Discord]

Let me know if you run into issues or have feature requests. I built this because I needed it myself, and I hope it helps other collectors too!

🎮 Happy collecting! 🕹️
