// routes/films.js
import { Router } from 'express';
import fs from 'fs-extra';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { fileURLToPath } from 'url';
import upload from '../middleware/upload.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const dataPath   = path.join(__dirname, '../data/films.json');
const uploadsDir = path.join(__dirname, '../uploads'); // where Multer stores files

const readData  = async () => JSON.parse(await fs.readFile(dataPath, 'utf-8'));
const writeData = async (d)   => fs.writeFile(dataPath, JSON.stringify(d, null, 2));

/* helper to normalise array fields (cast, genre) -------------------------- */
const parseArrayField = (val) => {
  if (!val) return [];
  // Already an array?
  if (Array.isArray(val)) return val;
  // Try JSON‑parse first (FormData often sends JSON strings)
  try {
    const parsed = JSON.parse(val);
    if (Array.isArray(parsed)) return parsed;
  } catch {/* ignore */}
  // Fallback: comma‑separated string → array
  return val.split(',')
            .map(v => v.trim())
            .filter(Boolean);
};

/* ─────────────────────────── ROUTES ─────────────────────────── */

/** GET /films – all films */
router.get('/', async (_req, res) => {
  res.json(await readData());
});

/** GET /films/:id – single film */
router.get('/:id', async (req, res) => {
  const film = (await readData()).find(f => f.id === req.params.id);
  if (!film) return res.status(404).json({ message: 'Not found' });
  res.json(film);
});

/** POST /films – add film (file OR url) */
router.post(
  '/',
  upload.single('poster'),            // field name must be "poster"
  async (req, res) => {
    const films = await readData();

    const newFilm = {
      id: uuid(),
      title:        req.body.title,
      releaseYear:  req.body.releaseYear,
      director:     req.body.director,
      summary:      req.body.summary,
      trailer:      req.body.trailer,
      genre:        parseArrayField(req.body.genre),
      cast:         parseArrayField(req.body.cast),
      poster:       req.file
                      ? `/uploads/${req.file.filename}`   // uploaded file
                      : (req.body.posterUrl || ''),       // external URL or empty
    };

    films.push(newFilm);
    await writeData(films);
    res.status(201).json(newFilm);
  }
);

/** PUT /films/:id – update film (auth + file OR url) */
router.put(
  '/:id',
  authenticate,
  upload.single('poster'),            // same field name
  async (req, res) => {
    const { id } = req.params;
    const films  = await readData();
    const idx    = films.findIndex(f => f.id === id);
    if (idx === -1) return res.status(404).json({ message: 'Film not found' });

    const existing = films[idx];

    const updated = {
      ...existing,
      title:        req.body.title        ?? existing.title,
      releaseYear:  req.body.releaseYear  ?? existing.releaseYear,
      director:     req.body.director     ?? existing.director,
      summary:      req.body.summary      ?? existing.summary,
      trailer:      req.body.trailer      ?? existing.trailer,
      genre:        req.body.genre ? parseArrayField(req.body.genre) : existing.genre,
      cast:         req.body.cast  ? parseArrayField(req.body.cast)  : existing.cast,
    };

    // poster logic
    if (req.file) {
      updated.poster = `/uploads/${req.file.filename}`;
    } else if (req.body.posterUrl) {
      updated.poster = req.body.posterUrl;
    }

    films[idx] = updated;
    await writeData(films);
    res.json(updated);
  }
);

/** DELETE /films/:id – secure delete */
router.delete('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const films  = await readData();
  if (!films.some(f => f.id === id))
    return res.status(404).json({ message: 'Not found' });

  await writeData(films.filter(f => f.id !== id));
  res.json({ message: 'Deleted' });
});

export default router;
