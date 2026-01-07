#!/usr/bin/env node

/**
 * Pre-build verification script
 * Checks that all required files and dependencies are in place before building
 */

import { existsSync } from 'fs';
import { join } from 'path';

const checks = [
  {
    name: 'Icon file',
    path: 'build/icon.svg',
    critical: true
  },
  {
    name: 'Main electron file',
    path: 'electron/main.js',
    critical: true
  },
  {
    name: 'Preload script',
    path: 'electron/preload.js',
    critical: true
  },
  {
    name: 'Vite config',
    path: 'vite.config.ts',
    critical: true
  },
  {
    name: 'Electron vite config',
    path: 'vite.electron.config.ts',
    critical: true
  },
  {
    name: 'App entry point',
    path: 'src/app/App.tsx',
    critical: true
  }
];

console.log('\n🔍 Pre-Build Verification\n');
console.log('━'.repeat(50));

let allPassed = true;

for (const check of checks) {
  const exists = existsSync(check.path);
  const status = exists ? '✅' : (check.critical ? '❌' : '⚠️');
  const label = exists ? 'FOUND' : (check.critical ? 'MISSING' : 'OPTIONAL');
  
  console.log(`${status} ${check.name.padEnd(25)} [${label}]`);
  
  if (!exists && check.critical) {
    allPassed = false;
  }
}

console.log('━'.repeat(50));

if (allPassed) {
  console.log('\n✅ All checks passed! Ready to build.\n');
  console.log('Build commands:');
  console.log('  npm run dist:win   - Windows (EXE + Installer)');
  console.log('  npm run dist:mac   - macOS (DMG)');
  console.log('  npm run dist:linux - Linux (AppImage + DEB)');
  console.log('  npm run dist       - All platforms\n');
} else {
  console.log('\n❌ Some critical files are missing!\n');
  process.exit(1);
}
