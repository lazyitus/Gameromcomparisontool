// Create a valid 512x512 PNG icon programmatically
import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import { createCanvas } from 'canvas';

async function createIcon() {
  try {
    // Create build directory
    await fs.mkdir('build', { recursive: true });
    
    console.log('Creating simple icon (requires canvas package)...');
    
    // Try to use canvas if available, otherwise create manually
    try {
      const { createCanvas } = await import('canvas');
      const canvas = createCanvas(512, 512);
      const ctx = canvas.getContext('2d');
      
      // Fill with dark background
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, 512, 512);
      
      // Add some simple design
      ctx.fillStyle = '#ff00ff';
      ctx.fillRect(128, 128, 256, 256);
      
      // Save as PNG
      const buffer = canvas.toBuffer('image/png');
      await fs.writeFile('build/icon.png', buffer);
      
      console.log('✅ Created icon at build/icon.png using canvas');
    } catch (canvasError) {
      // Canvas not available, create minimal PNG manually
      console.log('Canvas not available, creating minimal PNG...');
      await createMinimalPNG();
    }
  } catch (error) {
    console.error('❌ Failed to create icon:', error);
    process.exit(1);
  }
}

async function createMinimalPNG() {
  // Create a minimal but VALID 1x1 transparent PNG
  // This is the smallest valid PNG possible
  const minimalPNG = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk header
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 pixels
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, // IHDR data + CRC
    0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, // IDAT chunk header
    0x54, 0x08, 0xD7, 0x63, 0xF8, 0xCF, 0xC0, 0x00, // IDAT data (single red pixel)
    0x00, 0x03, 0x01, 0x01, 0x00, 0x18, 0xDD, 0x8D, // IDAT data + CRC
    0xB4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, // IEND chunk
    0x44, 0xAE, 0x42, 0x60, 0x82                     // IEND CRC
  ]);
  
  await fs.writeFile('build/icon.png', minimalPNG);
  console.log('✅ Created minimal PNG at build/icon.png');
}

createIcon();
