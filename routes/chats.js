import express from 'express';
import { db } from '../db.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
const router = express.Router();

router.get('/', authMiddleware, (req, res) => {
    const userId = req.userId;
    const chats = db
        .prepare(`
            SELECT chats.*
            FROM chats
                     JOIN chat_members
                          ON chats.id = chat_members.chatId
            WHERE chat_members.userId = ?
        `)
        .all(userId);
    res.json(chats);
});

router.post('/', authMiddleware, (req, res) => {

    const currentUserId = req.userId;
    const { receiverUserId } = req.body;

    if (!receiverUserId) {
        return res.status(400).json({ error: 'Missing receiverUserId' });
    }

    // 1️⃣ нормализуем пару
    const [a, b] = [currentUserId, receiverUserId].sort((x, y) => x - y);
    const privateKey = `${a}_${b}`;

    // 2️⃣ проверяем — есть ли уже чат
    const existingChat = db.prepare(`
        SELECT * FROM chats WHERE privateKey = ?
    `).get(privateKey);

    if (existingChat) {
        return res.json(existingChat);
    }

    // 3️⃣ создаём новый
    const createdAt = new Date().toISOString();

    const result = db.prepare(`
        INSERT INTO chats (privateKey, createdAt)
        VALUES (?, ?)
    `).run(privateKey, createdAt);

    const chatId = result.lastInsertRowid;

    // 4️⃣ добавляем участников
    db.prepare(`
        INSERT INTO chat_members (chatId, userId)
        VALUES (?, ?)
    `).run(chatId, currentUserId);

    db.prepare(`
        INSERT INTO chat_members (chatId, userId)
        VALUES (?, ?)
    `).run(chatId, receiverUserId);

    res.json({
        id: chatId,
        createdAt
    });
});


export default router