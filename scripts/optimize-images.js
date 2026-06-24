import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, '../public');

const TARGETS = [
  // root public images
  { name: 'logo.png', maxWidth: 512 },
  { name: 'london_bg.png', maxWidth: 1920 },
  { name: 'scenario_coffee.png', maxWidth: 1920 },
  { name: 'scenario_classroom.png', maxWidth: 1920 },
  { name: 'scenario_detective.png', maxWidth: 1920 },
  { name: 'scenario_boardroom.png', maxWidth: 1920 },
  { name: 'scenario_interview.png', maxWidth: 1920 },
  { name: 'scenario_undercity.png', maxWidth: 1920 },
  { name: 'start_menu_skyline.png', maxWidth: 1920 },

  // barista npc images
  { name: 'npc/barista/angry.png', maxWidth: 512 },
  { name: 'npc/barista/happy.png', maxWidth: 512 },
  { name: 'npc/barista/normal.png', maxWidth: 512 },
  { name: 'npc/barista/suspect.png', maxWidth: 512 }
];

async function optimizeImages() {
  console.log('Starting image optimization...');
  let totalSaved = 0;

  for (const target of TARGETS) {
    const inputPath = path.join(PUBLIC_DIR, target.name);
    const relativeWebpName = target.name.replace(/\.png$/, '.webp');
    const outputPath = path.join(PUBLIC_DIR, relativeWebpName);

    if (!fs.existsSync(inputPath)) {
      console.warn(`File not found: ${inputPath}, skipping...`);
      continue;
    }

    try {
      const stats = fs.statSync(inputPath);
      const originalSizeKB = (stats.size / 1024).toFixed(2);

      // Perform conversion and resizing using sharp
      const sharpInstance = sharp(inputPath);
      
      // Convert to webp with quality 80 and resize
      await sharpInstance
        .resize({ width: target.maxWidth, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(outputPath);

      const optimizedStats = fs.statSync(outputPath);
      const optimizedSizeKB = (optimizedStats.size / 1024).toFixed(2);
      const savedKB = (stats.size - optimizedStats.size) / 1024;
      totalSaved += savedKB;

      console.log(`Optimized ${target.name} -> ${relativeWebpName}:`);
      console.log(`  Original: ${originalSizeKB} KB`);
      console.log(`  WebP:     ${optimizedSizeKB} KB`);
      console.log(`  Saved:    ${savedKB.toFixed(2)} KB (${((savedKB / (stats.size / 1024)) * 100).toFixed(1)}%)`);

      // Delete original png
      fs.unlinkSync(inputPath);
      console.log(`  Deleted original file: ${target.name}`);
    } catch (error) {
      console.error(`Error processing ${target.name}:`, error);
    }
  }

  console.log(`\nImage optimization complete. Total savings: ${(totalSaved / 1024).toFixed(2)} MB`);
}

optimizeImages();
