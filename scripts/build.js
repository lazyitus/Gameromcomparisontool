import { build } from 'vite';
import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

async function buildApp() {
  try {
    console.log('🎮 Building ROM Arcade Manager...\n');

    // Build renderer (React app)
    console.log('📦 Building renderer process...');
    await build({
      configFile: 'vite.config.ts',
    });
    console.log('✅ Renderer built\n');

    // Build main process
    console.log('📦 Building main process...');
    await build({
      configFile: 'vite.electron.config.ts',
    });
    console.log('✅ Main process built\n');

    // Copy preload script
    console.log('📦 Copying preload script...');
    await fs.copyFile(
      path.join(process.cwd(), 'electron', 'preload.js'),
      path.join(process.cwd(), 'dist-electron', 'preload.js')
    );
    console.log('✅ Preload script copied\n');

    // Build with electron-builder
    console.log('📦 Packaging with electron-builder...');
    const builder = spawn('electron-builder', [], { 
      stdio: 'inherit',
      shell: true 
    });

    builder.on('close', (code) => {
      if (code === 0) {
        console.log('\n✨ Build complete! Check the /release directory');
      } else {
        console.error(`\n❌ electron-builder exited with code ${code}`);
        process.exit(code);
      }
    });

  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

buildApp();
