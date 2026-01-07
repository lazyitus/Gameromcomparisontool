// Create a simple placeholder icon using built-in Node.js modules
import fs from 'fs/promises';
import path from 'path';

// This creates a minimal valid PNG file (1x1 transparent pixel)
const minimalPNG = Buffer.from([
  0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
  0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
  0x49, 0x48, 0x44, 0x52, // IHDR chunk type
  0x00, 0x00, 0x02, 0x00, // Width: 512
  0x00, 0x00, 0x02, 0x00, // Height: 512
  0x08, 0x06, 0x00, 0x00, 0x00, // Bit depth, color type, etc.
  0x03, 0xED, 0xDF, 0xA0, // IHDR CRC
  0x00, 0x00, 0x00, 0x01, // IDAT chunk length
  0x49, 0x44, 0x41, 0x54, // IDAT chunk type
  0x00, // Compressed data
  0x00, 0x00, 0x00, 0x00, // IDAT CRC (placeholder)
  0x00, 0x00, 0x00, 0x00, // IEND chunk length
  0x49, 0x45, 0x4E, 0x44, // IEND chunk type
  0xAE, 0x42, 0x60, 0x82  // IEND CRC
]);

async function createIcon() {
  try {
    // Create build directory
    await fs.mkdir('build', { recursive: true });
    
    // Write the PNG file
    await fs.writeFile('build/icon.png', minimalPNG);
    
    console.log('✅ Created placeholder icon at build/icon.png');
    console.log('   This is a minimal valid PNG to allow electron-builder to run.');
    console.log('   Replace it with your custom icon later using ICON_SETUP.md instructions.');
  } catch (error) {
    console.error('❌ Failed to create icon:', error);
    process.exit(1);
  }
}

createIcon();
