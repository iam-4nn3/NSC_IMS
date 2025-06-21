import dotenv from 'dotenv';
dotenv.config();

import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const router = Router();

// Hard‑coded admin user (replace later with DB lookup)
const adminUser = {
  id: 1,
  username: 'admin',
  // bcrypt hash for 'password123'
  passwordHash: bcrypt.hashSync('password123', 11),
};

// ─────────────────────────────
// Admin Login
// ─────────────────────────────
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  if (username !== adminUser.username) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  const valid = await bcrypt.compare(password, adminUser.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  const token = jwt.sign({ id: adminUser.id, role: 'admin' }, process.env.JWT_SECRET, {
    expiresIn: '2h',
  });

  res.json({ token });
});

// ─────────────────────────────
// Verify password (used for delete confirmation)
// ─────────────────────────────
router.post('/verify-password', (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ message: 'Password is required' });
  }

  const isValid = bcrypt.compareSync(password, adminUser.passwordHash);
  res.json({ verified: isValid });
});

export default router;
