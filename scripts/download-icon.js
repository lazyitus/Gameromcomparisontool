// Download a valid placeholder icon
import https from 'https';
import fs from 'fs/promises';
import { createWriteStream } from 'fs';

async function downloadIcon() {
  try {
    // Create build directory
    await fs.mkdir('build', { recursive: true });
    
    // Use a simple 512x512 transparent PNG from a reliable source
    const iconUrl = 'https://via.placeholder.com/512x512.png/000000/000000?text=';
    
    return new Promise((resolve, reject) => {
      const file = createWriteStream('build/icon.png');
      
      https.get(iconUrl, (response) => {
        response.pipe(file);
        
        file.on('finish', () => {
          file.close();
          console.log('✅ Downloaded placeholder icon to build/icon.png');
          console.log('   Replace with your custom icon later using ICON_SETUP.md');
          resolve();
        });
      }).on('error', (err) => {
        fs.unlink('build/icon.png').catch(() => {});
        reject(err);
      });
    });
  } catch (error) {
    console.error('❌ Failed to download icon:', error);
    process.exit(1);
  }
}

downloadIcon();
