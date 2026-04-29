import express from 'express';
import { db } from '../db.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', authMiddleware, (req, res) => {
    const currentUserId = req.userId;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    try {
        const users = db
            .prepare(`
                SELECT id, login, lastOnline, userPic
                FROM users
                WHERE id != ?
                ORDER BY id DESC
                LIMIT ? OFFSET ?
            `)
            .all(currentUserId, limit, offset);

        // 👉 чтобы фронт понимал есть ли ещё данные
        const total = db
            .prepare(`
                SELECT COUNT(*) as count
                FROM users
                WHERE id != ?
            `)
            .get(currentUserId).count;

        res.json({
            data: users,
            page,
            limit,
            hasMore: offset + users.length < total,
            total,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка при получении пользователей' });
    }
});

export default router;