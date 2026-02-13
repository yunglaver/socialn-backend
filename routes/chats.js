import express from 'express';
import { db } from '../db.js';
const router = express.Router();

router.get('/', (req, res) => {
    const { userId } = req.query;
    const chats = db
        .prepare(`
            SELECT chats.*
            FROM chats
                     JOIN chat_participants
                          ON chats.id = chat_participants.chatId
            WHERE chat_participants.userId = ?
        `)
        .all(userId);
    res.json(chats);
});

router.post('/', (req, res) => {
    const {currentUserId, receiverUserId } = req.body;
    if ( !currentUserId || !receiverUserId) {
        return res.status(400).json({ error: 'Missing fields' });
    }

    const createdAt = new Date().toISOString();

    const createdChat = db.prepare(`
        INSERT INTO chats (createdAt)
        VALUES (?)
    `).run(createdAt);

    const chats = {
        id: createdChat.lastInsertRowid,
        createdAt: createdAt
    }
    const chatId = chats.id

    db.prepare(`
        INSERT INTO chat_participants (chatId, userId)
        VALUES (?, ?)
    `).run(chatId, currentUserId);

    db.prepare(`
        INSERT INTO chat_participants (chatId, userId)
        VALUES (?, ?)
    `).run(chatId, receiverUserId)

    res.json(chats);
});



export default router