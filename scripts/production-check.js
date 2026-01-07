#!/usr/bin/env node

/**
 * Production Readiness Checklist
 * Run this before building your production release
 */

import { existsSync, readFileSync } from 'fs';

console.log('\n🎯 Production Readiness Checklist\n');
console.log('═'.repeat(60));

const checks = [
  {
    category: '📦 Build Files',
    items: [
      {
        name: 'Icon file exists',
        check: () => existsSync('build/icon.svg'),
        fix: 'Icon should be at build/icon.svg'
      },
      {
        name: 'Package.json configured',
        check: () => {
          const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
          return pkg.build && pkg.build.icon;
        },
        fix: 'Add build.icon to package.json'
      },
      {
        name: 'Main electron file exists',
        check: () => existsSync('electron/main.js'),
        fix: 'Missing electron/main.js'
      },
      {
        name: 'Preload script exists',
        check: () => existsSync('electron/preload.js'),
        fix: 'Missing electron/preload.js'
      }
    ]
  },
  {
    category: '⚙️ Configuration',
    items: [
      {
        name: 'App name set',
        check: () => {
          const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
          return pkg.productName && pkg.productName.length > 0;
        },
        fix: 'Set productName in package.json'
      },
      {
        name: 'App ID set',
        check: () => {
          const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
          return pkg.build && pkg.build.appId;
        },
        fix: 'Set build.appId in package.json'
      },
      {
        name: 'Version number set',
        check: () => {
          const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
          return pkg.version && pkg.version !== '0.0.0';
        },
        fix: 'Set version in package.json'
      }
    ]
  },
  {
    category: '🎨 UI Components',
    items: [
      {
        name: 'App.tsx exists',
        check: () => existsSync('src/app/App.tsx'),
        fix: 'Missing main App component'
      },
      {
        name: 'Styles configured',
        check: () => existsSync('src/styles/theme.css'),
        fix: 'Missing theme configuration'
      },
      {
        name: 'Components present',
        check: () => existsSync('src/app/components/GameComparison.tsx'),
        fix: 'Missing core components'
      }
    ]
  },
  {
    category: '🔧 Build Scripts',
    items: [
      {
        name: 'Build script exists',
        check: () => existsSync('scripts/build.js'),
        fix: 'Missing build script'
      },
      {
        name: 'Dist commands configured',
        check: () => {
          const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
          return pkg.scripts && pkg.scripts['dist:win'];
        },
        fix: 'Add dist scripts to package.json'
      }
    ]
  }
];

let totalPassed = 0;
let totalFailed = 0;

for (const section of checks) {
  console.log(`\n${section.category}`);
  console.log('─'.repeat(60));
  
  for (const item of section.items) {
    try {
      const passed = item.check();
      if (passed) {
        console.log(`✅ ${item.name}`);
        totalPassed++;
      } else {
        console.log(`❌ ${item.name}`);
        console.log(`   → ${item.fix}`);
        totalFailed++;
      }
    } catch (error) {
      console.log(`❌ ${item.name}`);
      console.log(`   → ${item.fix}`);
      totalFailed++;
    }
  }
}

console.log('\n═'.repeat(60));
console.log(`\n📊 Results: ${totalPassed} passed, ${totalFailed} failed\n`);

if (totalFailed === 0) {
  console.log('🎉 All checks passed! You\'re ready to build!\n');
  console.log('Build commands:');
  console.log('  npm run dist:win   - Windows (EXE + Installer)');
  console.log('  npm run dist:mac   - macOS (DMG)');
  console.log('  npm run dist:linux - Linux (AppImage + DEB)');
  console.log('  npm run dist       - All platforms\n');
  process.exit(0);
} else {
  console.log('⚠️  Please fix the issues above before building.\n');
  process.exit(1);
}
