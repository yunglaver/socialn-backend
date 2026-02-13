import express from 'express';
import { db } from '../db.js';
const router = express.Router();

router.get('/', (req, res) => {
    const { chatId } = req.query;
    const messages = db
        .prepare(`
            SELECT *
            FROM messages
            WHERE chatId = ?
            ORDER BY createdAt ASC;
        `)
        .all(chatId);
    res.json(messages);
});

router.post('/', (req, res) => {
    const { text, chatId, userId } = req.body;
    if (!text || !chatId || !userId) {
        return res.status(400).json({ error: 'Missing fields' });
    }

    const senderId = userId
    const createdAt = new Date().toISOString();

    const result = db.prepare(`
        INSERT INTO messages (chatId, text, senderId, createdAt)
        VALUES (?, ?, ?, ?)
    `).run(
        chatId,
        text,
        senderId,
        createdAt,
    );

    const message = {
        id: result.lastInsertRowid,
        chatId: chatId,
        text: text,
        senderId: senderId,
        createdAt: createdAt
    }

    res.json(message);
});


export default router;