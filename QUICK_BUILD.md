# 🚀 Quick Build Guide

## For Windows Users

### Option 1: Create an Installer + Portable EXE
```bash
npm run dist:win
```

**Output:**
- `release/ROM Arcade Manager Setup 1.0.0.exe` ← **Installer for distribution**
- `release/ROM Arcade Manager 1.0.0.exe` ← **Portable version (no install needed)**

### Option 2: Just Build Everything
```bash
npm run dist
```

---

## 📦 What You Get

### Windows Installer (NSIS)
- Creates Start Menu shortcuts
- Desktop shortcut
- Proper uninstaller
- User can choose installation directory
- **Best for distribution to others**

### Windows Portable EXE
- Single executable
- No installation needed
- Run from anywhere (USB drive, downloads folder, etc.)
- **Best for personal use or testing**

---

## 🎨 The Icon

Your app will have a **neon 80s arcade cabinet icon** with:
- 🌈 Hot pink, cyan, and purple gradients
- 🎮 Retro arcade cabinet design
- ✨ Glowing neon effects
- 📺 Grid background

The icon automatically appears on:
- Desktop shortcuts
- Start Menu
- Taskbar
- Window title bar
- File explorer

---

## ⚡ Pre-Build Checklist

Run this before building:
```bash
npm run verify
```

This checks that all required files are present.

---

## 🐛 Troubleshooting

### "electron-builder not found"
```bash
npm install
```

### Build fails with icon error
The `build/icon.svg` file should exist. If missing, it was created during setup.

### "Cannot find module" errors
```bash
npm run build
```
This builds the renderer and electron code before packaging.

---

## 📂 Where Are My Files?

After building, check the `release/` folder:

```
release/
├── ROM Arcade Manager Setup 1.0.0.exe    ← Share this installer
├── ROM Arcade Manager 1.0.0.exe          ← Or this portable version
└── win-unpacked/                         ← Unpacked files (can delete)
```

---

## ✅ You're Ready!

1. ✅ Icon created (`build/icon.svg`)
2. ✅ Build scripts configured
3. ✅ Electron-builder set up
4. ✅ NSIS installer configured

**Now just run:**
```bash
npm run dist:win
```

**And distribute your EXE! 🎮✨**

---

## 💡 Pro Tips

- **For quick testing:** Use `npm run electron:dev` (no build needed)
- **Before distributing:** Always test the installer on a clean Windows machine
- **File size:** The EXE will be ~200-300MB (includes Electron + Chrome)
- **Antivirus:** Some antivirus may flag unsigned executables (normal for indie apps)
- **Code signing:** Consider getting a code signing certificate for professional distribution

---

**Need help?** Check `BUILD_INSTRUCTIONS.md` for more details.
