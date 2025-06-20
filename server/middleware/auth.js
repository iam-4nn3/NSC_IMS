// server/middleware/authenticate.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  console.log('🔐 Incoming Authorization Header:', req.headers.authorization);

  if (!authHeader) return res.status(403).json({ message: 'Missing Authorization header' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(403).json({ message: 'Token missing' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Invalid token:', err.message);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
}
