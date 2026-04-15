// This script generates proper PNG icons using canvas API or fallback to simple approach
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Try to use canvas if available, otherwise create minimal PNG
try {
  // Try using node-canvas (if installed)
  const { createCanvas } = require('canvas');
  console.log('Using node-canvas for icon generation...');
  
  sizes.forEach(size => {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = '#0f766e';
    ctx.fillRect(0, 0, size, size);
    
    // Text
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${size * 0.4}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('IB', size / 2, size / 2);
    
    const buffer = canvas.toBuffer('image/png');
    const pngPath = path.join(iconsDir, `icon-${size}x${size}.png`);
    fs.writeFileSync(pngPath, buffer);
    console.log(`✓ Created icon-${size}x${size}.png`);
  });
  
} catch (e) {
  console.log('node-canvas not available, using pre-generated icons...');
  console.log('For proper icons, install canvas: npm install canvas');
  console.log('Or manually create PNG icons and place them in public/icons/');
  
  // Create a minimal valid PNG file (1x1 pixel, will stretch)
  // This is a valid 1x1 transparent PNG
  const minimalPNG = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );
  
  sizes.forEach(size => {
    const pngPath = path.join(iconsDir, `icon-${size}x${size}.png`);
    fs.writeFileSync(pngPath, minimalPNG);
    console.log(`⚠ Created placeholder icon-${size}x${size}.png`);
  });
  
  console.log('\n⚠ Placeholder icons created. Replace with proper icons for production.');
  console.log('Options:');
  console.log('1. npm install canvas && node scripts/generate-png-icons.js');
  console.log('2. Use online generator: https://realfavicongenerator.net/');
  console.log('3. Export from Figma/Photoshop');
}
