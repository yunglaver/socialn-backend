import express from 'express';
import { db } from '../db.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
const router = express.Router();

router.get('/', authMiddleware, (req, res) => {
    const currentUserId = req.userId;

    const users = db.prepare(`
        SELECT id, login, isOnline, lastOnline, userPic
        FROM users
        WHERE id != ?
    `);
    const otherUsers = users.all(currentUserId);

    res.json(otherUsers);
});

export default router

