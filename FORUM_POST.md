# ROM Collection Manager - Desktop Application

## 🎮 What is this?

A desktop tool for managing and tracking your ROM collections across multiple gaming systems. It reads DAT files (No-Intro, Redump, TOSEC, etc.) and compares them against your actual ROM collection to show you exactly what you have, what you're missing, and lets you track what you want to acquire.

## ❓ The Problem It Solves

If you collect ROMs for retro systems, you've probably run into these issues:

- **🤷 No idea what you actually have** - You have folders full of ROMs but no clear picture of your collection
- **📋 Duplicate tracking work** - Manually checking DAT files against your collection is tedious
- **🗂️ Multiple systems, multiple formats** - Different systems use different DAT formats and naming conventions
- **📝 No centralized want list** - You're tracking missing games in text files or spreadsheets
- **🔍 Can't filter effectively** - Want to see only USA releases? Only official games? Good luck doing that manually

This tool handles all of that automatically.

## ⚡ Key Features

**📂 DAT File Support**
- Reads XML DAT files from No-Intro, Redump, TOSEC, and other standard sources
- Handles multiple systems simultaneously
- Auto-detects system names from filenames

**🎯 ROM List Comparison**
- Compares your ROM filenames against the DAT database
- Smart matching handles naming variations and region tags
- Shows exactly what you have vs. what exists in the DAT

**🔧 Filtering & Organization**
- Filter by region (USA, Europe, Japan, etc.)
- Separate official releases from homebrew, prototypes, demos, betas
- Filter by have/missing status
- Search by game name
- View as compact list or detailed cards

**⭐ Want List Management**
- Add missing games to a trackable want list
- Organized by system with console icons
- Export your want list as a text file
- Persistent across sessions

**📊 Statistics Dashboard**
- Total games in DAT vs. your collection
- Completion percentage per system
- Regional breakdowns
- Clear visual stats with neon 80s arcade aesthetic

**💻 Desktop Application**
- Native directory/file selection (no browser upload limits)
- Persistent data storage
- All processing happens locally on your machine
- Custom window controls

## 📖 How To Use It

### 1️⃣ Get Your DAT Files
Download DAT files for your systems from sources like:
- No-Intro (cartridge-based systems)
- Redump (disc-based systems)
- TOSEC (comprehensive archives)

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
- Upload your DAT files (the app will auto-detect systems)
- Upload your ROM list text files
- Assign each ROM list to the correct system (usually auto-matched by filename)
- Click "Match New Systems" or "Re-Match All"

**🕹️ ROM Collection Tab:**
- View all games from your DATs with Have/Missing status
- Apply filters (regions, release types, search)
- Add missing games to your want list

**✅ Want List Tab:**
- Review games you want to acquire
- Organized by system
- Export as text file for reference

### 4️⃣ Update As You Go
**When you add new ROMs:**
- Generate a new ROM list for that system
- Upload it in Setup tab (it will replace the old one)
- Click "Match New Systems" to update just that system

**When you get new DAT releases:**
- Upload the new DAT file
- Click "Re-Match All" to refresh everything

## 🔧 Technical Details

- **Platform:** Electron desktop app (Windows/Mac/Linux)
- **Data Storage:** Local browser storage (localStorage)
- **Processing:** All client-side, nothing sent to servers
- **DAT Format:** XML (standard for No-Intro/Redump/TOSEC)
- **ROM List Format:** Plain text, one filename per line

## 🚫 What This Doesn't Do

- It doesn't download or share ROMs (legal reasons)
- It doesn't modify your ROM files
- It doesn't scrape or connect to online databases
- It's not a ROM manager like RomCenter or CLRMamePro (different use case)

## 👥 Who Is This For?

- ROM collectors who want to track completion across systems
- People managing large multi-system collections
- Anyone tired of manually cross-referencing DAT files
- Collectors who want filtered views (regions, release types)

## 🎨 Theme

Features a neon 80s arcade aesthetic (hot pink/cyan/purple, grid backgrounds, Orbitron font). If that's not your thing, there's a light/dark theme toggle.

---

**📥 Download:** [Link to releases]

**💾 Source Code:** [Link to repo if open source]

**✔️ Requirements:** Windows 10+, macOS 10.13+, or modern Linux

**📄 License:** [Your license here]

Let me know if you run into issues or have feature requests.
