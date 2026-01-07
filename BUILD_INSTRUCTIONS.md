# 🎮 ROM Arcade Manager

A desktop ROM collection manager with a stunning **neon 80s arcade aesthetic**. Parse DAT files from No-Intro, Redump, TOSEC, and more to manage your retro gaming collection with style!

![Version](https://img.shields.io/badge/version-1.0.0-ff0080)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-00d4ff)
![License](https://img.shields.io/badge/license-Private-7928ca)

## ✨ Features

- 🎯 **DAT File Support** - Parse XML DAT files from No-Intro, Redump, TOSEC, and other sources
- 📁 **Multi-System Management** - Manage ROMs across multiple gaming systems
- 🔍 **Smart Filtering** - Filter by region, category, release type, and revision status
- 🌍 **Region Detection** - Automatic region extraction with "(No Region)" support
- 🎨 **Neon Aesthetic** - Hot pink, cyan, and purple colors with glowing UI elements
- 🌓 **Light/Dark Themes** - Toggle between neon light and dark modes
- 📝 **Want List** - Track games you want to collect
- 🔄 **Clone Detection** - Identify bootlegs, clones, and alternate versions
- 💾 **Local Storage** - Settings and filter preferences persist across sessions
- 🖥️ **Native Desktop** - Built with Electron for native file system access

## 🚀 Quick Start

### Development

```bash
npm install
npm run electron:dev
```

### Production Build

#### Windows (EXE + Installer)
```bash
npm run dist:win
```

This creates:
- `release/ROM Arcade Manager Setup 1.0.0.exe` - NSIS Installer
- `release/ROM Arcade Manager 1.0.0.exe` - Portable executable

#### macOS (DMG)
```bash
npm run dist:mac
```

This creates:
- `release/ROM Arcade Manager-1.0.0.dmg` - macOS installer
- `release/ROM Arcade Manager-1.0.0-mac.zip` - Zipped app bundle

#### Linux (AppImage + DEB)
```bash
npm run dist:linux
```

This creates:
- `release/ROM Arcade Manager-1.0.0.AppImage` - Universal Linux app
- `release/rom-arcade-manager_1.0.0_amd64.deb` - Debian package

#### All Platforms
```bash
npm run dist
```

Builds for all platforms (requires appropriate build tools installed).

## 📦 Build Output

All distributables are created in the `release/` directory:

```
release/
├── ROM Arcade Manager Setup 1.0.0.exe    (Windows Installer)
├── ROM Arcade Manager 1.0.0.exe          (Windows Portable)
├── ROM Arcade Manager-1.0.0.dmg          (macOS)
├── ROM Arcade Manager-1.0.0-mac.zip      (macOS Zip)
├── ROM Arcade Manager-1.0.0.AppImage     (Linux)
└── rom-arcade-manager_1.0.0_amd64.deb    (Debian)
```

## 🎨 Icon

The app features a custom neon arcade cabinet icon with:
- Hot pink (#ff0080), cyan (#00d4ff), and purple (#7928ca) gradient
- Retro arcade cabinet silhouette
- Grid background effect
- Glowing neon "ROM" text
- Built-in sparkle effects

## 🛠️ Tech Stack

- **Electron** - Desktop framework
- **React** - UI framework
- **Vite** - Build tool
- **Tailwind CSS v4** - Styling
- **TypeScript** - Type safety
- **Electron Builder** - Packaging and distribution

## 📋 Requirements

- Node.js 18+ 
- npm or pnpm

### Platform-Specific Build Requirements

**Windows:**
- No additional requirements (builds on Windows, macOS, or Linux)

**macOS:**
- macOS 10.13+ required to build .dmg
- Xcode Command Line Tools

**Linux:**
- Standard build tools (`build-essential` on Debian/Ubuntu)

## 🎯 Usage

1. **Load DAT Files** - Click "Select DAT File(s)" in the Setup tab
2. **Load ROM Lists** - Click "Select ROM File(s)" to load your collection
3. **View Collection** - Switch to ROM Collection tab to see your games
4. **Filter & Search** - Use the comprehensive filters to find specific games
5. **Manage Want List** - Add games you want to collect to your Want List

## 🔧 Configuration

### Filter Settings (Auto-saved to localStorage)

- Selected System
- Region Filters (with Select All/None)
- Category Filter
- Release Type (Official/Unofficial)
- Revision Filter
- Want List Status

### Theme

Toggle between light and dark themes using the theme switcher in the title bar.

## 📝 License

Private - All Rights Reserved

## 🤝 Credits

Built with ❤️ and neon lights for retro gaming enthusiasts.

---

**Enjoy managing your ROM collection in style!** 🎮✨
