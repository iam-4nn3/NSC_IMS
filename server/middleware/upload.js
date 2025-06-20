import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure the destination folder exists
const postersDir = path.join('public', 'posters');
if (!fs.existsSync(postersDir)) {
  fs.mkdirSync(postersDir, { recursive: true });
}

// Set up storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, postersDir),

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext)
      .replace(/\s+/g, '-')    // replace spaces with dashes
      .replace(/[^a-zA-Z0-9-_]/g, ''); // remove unsafe characters
    const uniqueSuffix = `${Date.now()}`;
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  }
});

// File filter: allow only images
const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed'), false);
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter });

export default upload;
