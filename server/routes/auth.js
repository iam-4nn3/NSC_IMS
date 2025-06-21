import dotenv from 'dotenv';
dotenv.config();
import { Router } from 'express';
import  jwt  from 'jsonwebtoken';
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
  if (username !== adminUser.username) return res.sendStatus(401);

  const valid = await bcrypt.compare(password, adminUser.passwordHash);
  if (!valid) return res.sendStatus(401);
  
  //const jwt = require('jsonwebtoken');
  console.log('JWT_SECRET:', process.env.JWT_SECRET);  // 👈 add this
  if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET is missing from .env');
  return res.status(500).json({ error: 'JWT secret is not set' });
}
  const token = jwt.sign({ id: adminUser.id, role: 'admin' }, process.env.JWT_SECRET, {
    expiresIn: '2h',
  });
  jwt.verify(token, process.env.JWT_SECRET);
  
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
