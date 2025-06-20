import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const router = Router();

// Hard‑coded admin user (replace later with DB lookup)
const adminUser = {
  id: 1,
  username: 'admin',
  // bcrypt hash for 'password123'
  passwordHash: bcrypt.hashSync('password123', 10),
};

// ─────────────────────────────
// Admin Login
// ─────────────────────────────
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (username !== adminUser.username) return res.sendStatus(401);

  const valid = await bcrypt.compare(password, adminUser.passwordHash);
  if (!valid) return res.sendStatus(401);

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

  // Compare plain text password with stored bcrypt hash
  const isValid = bcrypt.compareSync(password, adminUser.passwordHash);

  // Respond with JSON indicating match result
  res.json({ verified: isValid });
});

export default router;
