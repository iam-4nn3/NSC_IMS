// server/routes/films.js
import { Router } from 'express';
import { pool } from '../db.js';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = Router();

// GET all
router.get('/', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM films ORDER BY release_year DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('GET all films error:', err);
    res.status(500).json({ message: 'Error fetching films' });
  }
});

// GET one
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM films WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('GET one film error:', err);
    res.status(500).json({ message: 'Error fetching film' });
  }
});

// POST
router.post('/', upload.single('poster'), async (req, res) => {
  const {
    title, releaseYear, genre, director,
    summary, trailer, cast, posterUrl
  } = req.body;

  const id = uuidv4();
  const genres = Array.isArray(genre) ? genre : JSON.parse(genre);
  const castArr = Array.isArray(cast) ? cast : JSON.parse(cast);
  const posterPath = req.file ? `/uploads/${req.file.filename}` : posterUrl || '';

  try {
    await pool.query(`
      INSERT INTO films (id, title, release_year, genre, director, summary, trailer, poster, "cast")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [id, title, releaseYear, genres, director, summary, trailer, posterPath, castArr]);

    res.status(201).json({ message: 'Film added', id });
  } catch (err) {
    console.error('POST film error:', err);
    res.status(500).json({ message: 'Error adding film' });
  }
});

// PUT
router.put('/:id', authenticate, upload.single('poster'), async (req, res) => {
  const { id } = req.params;
  const {
    title, releaseYear, genre, director,
    summary, trailer, cast, posterUrl
  } = req.body;

  const genres = Array.isArray(genre) ? genre : JSON.parse(genre);
  const castArr = Array.isArray(cast) ? cast : JSON.parse(cast);
  const posterPath = req.file ? `/uploads/${req.file.filename}` : posterUrl || '';

  try {
    const result = await pool.query(`
      UPDATE films SET
        title = $1, release_year = $2, genre = $3, director = $4,
        summary = $5, trailer = $6, poster = $7, "cast" = $8
      WHERE id = $9 RETURNING *
    `, [title, releaseYear, genres, director, summary, trailer, posterPath, castArr, id]);

    if (result.rowCount === 0) return res.status(404).json({ message: 'Not found' });

    res.json(result.rows[0]);
  } catch (err) {
    console.error('PUT film error:', err);
    res.status(500).json({ message: 'Error updating film' });
  }
});

// DELETE
router.delete('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM films WHERE id = $1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('DELETE film error:', err);
    res.status(500).json({ message: 'Error deleting film' });
  }
});

export default router;
