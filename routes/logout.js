import express from 'express';
import { db } from '../db.js';
import {authMiddleware} from "../middlewares/auth.middleware.js";

const router = express.Router();


router.post('/', authMiddleware, (req, res) => {

    const userId = req.userId; // ← из токена

    db.prepare(`
        UPDATE users
        SET isOnline = 0,
            lastOnline = ?
        WHERE id = ?
    `).run(new Date().toISOString(), userId);

    res.json({ success: true });
});

export default router;