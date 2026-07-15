import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths relative to this script inside frontend/scripts/
const srcDir = path.resolve(__dirname, '../../docs/build');
const destDir = path.resolve(__dirname, '../dist/wiki');

try {
  console.log(`Copying built wiki from ${srcDir} to ${destDir}...`);

  if (!fs.existsSync(srcDir)) {
    console.error(`Error: Source directory ${srcDir} does not exist. Did you run the Docusaurus build?`);
    process.exit(1);
  }

  // Clean the destination wiki directory if it exists
  if (fs.existsSync(destDir)) {
    fs.rmSync(destDir, { recursive: true, force: true });
  }

  // Create the destination directory
  fs.mkdirSync(destDir, { recursive: true });

  // Copy build files
  fs.cpSync(srcDir, destDir, { recursive: true });

  console.log('Successfully integrated wiki build into frontend/dist/wiki!');
} catch (error) {
  console.error('Failed to copy wiki build:', error);
  process.exit(1);
}
