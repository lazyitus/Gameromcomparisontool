import { spawn } from 'child_process';
import { createServer } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

async function startDev() {
  console.log('🚀 Starting ROM Arcade Manager in development mode...\n');

  // Step 1: Build Electron main process
  console.log('📦 Building Electron main process...');
  const buildElectron = spawn('vite', ['build', '--config', 'vite.electron.config.ts'], {
    cwd: rootDir,
    shell: true,
    stdio: 'inherit'
  });

  await new Promise((resolve, reject) => {
    buildElectron.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Electron build failed with code ${code}`));
      } else {
        console.log('✅ Electron main process built\n');
        resolve();
      }
    });
  });

  // Step 2: Start Vite dev server
  console.log('🌐 Starting Vite dev server...');
  const server = await createServer({
    configFile: resolve(rootDir, 'vite.config.ts'),
    server: {
      port: 5173
    }
  });

  await server.listen();
  const devServerUrl = `http://localhost:${server.config.server.port}`;
  console.log(`✅ Vite dev server running at ${devServerUrl}\n`);

  // Step 3: Launch Electron with dev server URL
  console.log('⚡ Launching Electron...\n');
  const electronProcess = spawn('electron', ['.'], {
    cwd: rootDir,
    shell: true,
    stdio: 'inherit',
    env: {
      ...process.env,
      VITE_DEV_SERVER_URL: devServerUrl
    }
  });

  // Handle Electron exit
  electronProcess.on('close', () => {
    console.log('\n👋 Electron closed. Shutting down dev server...');
    server.close();
    process.exit(0);
  });

  // Handle Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n\n⏹️  Shutting down...');
    electronProcess.kill();
    server.close();
    process.exit(0);
  });
}

startDev().catch((err) => {
  console.error('❌ Development server failed:', err);
  process.exit(1);
});
