// server/scripts/migrate.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(__dirname, '../data/films.json');

async function migrate() {
  try {
    const content = await fs.readFile(dataPath, 'utf8');
    const films = JSON.parse(content);
    let successCount = 0;

    for (const film of films) {
      const {
        id, title, releaseYear, genre, director,
        summary, trailer, poster, cast
      } = film;

      try {
        await pool.query(
          `INSERT INTO films (id, title, release_year, genre, director, summary, trailer, poster, "cast")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (id) DO NOTHING`,
          [id, title, releaseYear, genre, director, summary, trailer, poster, cast]
        );
        console.log(`✅ Inserted: ${title}`);
        successCount++;
      } catch (err) {
        console.error(`❌ Failed to insert "${title || '[Untitled Film]'}"`);
        console.error('   ↳ Error:', err); // ⛳ log full error object
      }
    }

    console.log(`\nMigration complete: ${successCount} film(s) inserted.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration script failed:', err);
    process.exit(1);
  }
}

migrate();
