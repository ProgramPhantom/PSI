import multer from 'multer';
import path from 'path';
import fs from 'fs';

const STORAGE_DIR = path.join(process.cwd(), 'storage', 'schemes');

// Ensure directory exists
if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

// Multer config
export const schemeUpload = multer({
    storage: multer.diskStorage({
        destination: STORAGE_DIR,
        filename: (req, file, cb) => {
            // The filename will be the schemeId so it's easy to look up.
            // E.g., for id '1234', saves as '1234.nmrs'
            const id = req.params.schemeId;
            if (!id) {
                return cb(new Error("Missing schemeId in params"), "");
            }
            cb(null, `${id}.nmrs`);
        },
    }),
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});
