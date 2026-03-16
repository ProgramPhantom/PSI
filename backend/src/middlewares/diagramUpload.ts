import multer from 'multer';
import path from 'path';
import fs from 'fs';

const STORAGE_DIR = path.join(process.cwd(), 'storage', 'diagrams');

// Ensure directory exists
if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

// Multer config
export const diagramUpload = multer({
    storage: multer.diskStorage({
        destination: STORAGE_DIR,
        filename: (req, file, cb) => {
            // Generate a temporary name. The controller will replace the file associated with the UUID
            // once ownership logic determines if this is a save or a copy.
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, `temp-${uniqueSuffix}.nmrd`);
        },
    }),
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});
