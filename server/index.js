import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import filmsRouter from './routes/films.js';
import authRouter from './routes/auth.js';
import { authenticate } from './middleware/auth.js';

const app = express();

// To use __dirname with ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static folders
app.use('/uploads', express.static('uploads')); // legacy fallback
app.use('/posters', express.static(path.join(__dirname, 'public', 'posters')));

app.use(cors());
app.use(express.json());

app.use('/auth', authRouter);

// ✅ Protect film modification routes
app.use('/films', (req, res, next) => {
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    return authenticate(req, res, next);
  }
  next();
});
app.use('/films', filmsRouter);

app.listen(5000, () => console.log('API on http://localhost:5000'));
