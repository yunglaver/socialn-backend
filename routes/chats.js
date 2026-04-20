import express from 'express';
import { db } from '../db.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
const router = express.Router();

router.get('/', authMiddleware, (req, res) => {
    const userId = req.userId;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const chats = db
        .prepare(`
            SELECT
                chats.*,
                m.text AS lastMessageText,
                m.createdAt AS lastMessageCreatedAt,
                u.login AS chatName,
                u.userPic AS userPic
            FROM chats

                     JOIN chat_members AS m_current
                          ON chats.id = m_current.chatId
                              AND m_current.userId = ?

                     LEFT JOIN chat_members AS m_other
                               ON chats.id = m_other.chatId
                                   AND m_other.userId != ?

                     LEFT JOIN users AS u
                               ON u.id = m_other.userId

                     LEFT JOIN messages m
                               ON m.id = (
                                   SELECT id FROM messages
                                   WHERE chatId = chats.id
                                   ORDER BY createdAt DESC
                                   LIMIT 1
                               )

            ORDER BY
                m.createdAt IS NULL,
                m.createdAt DESC

            LIMIT ? OFFSET ?
        `)
        .all(userId, userId, limit, offset);

    res.json(chats);
});

router.post('/', authMiddleware, (req, res) => {
    const currentUserId = req.userId;
    const { receiverUserId } = req.body;

    if (!receiverUserId) {
        return res.status(400).json({ error: 'Missing receiverUserId' });
    }

    if (receiverUserId === currentUserId) {
        return res.status(400).json({ error: 'Cannot create chat with yourself' });
    }


    const existingChat = db.prepare(`
        SELECT c.id
        FROM chats c
        JOIN chat_members m1 
            ON m1.chatId = c.id AND m1.userId = ?
        JOIN chat_members m2 
            ON m2.chatId = c.id AND m2.userId = ?
        WHERE c.type = 'private'
        LIMIT 1
    `).get(currentUserId, receiverUserId);

    if (existingChat) {
        return res.json({ id: existingChat.id });
    }


    const createChat = db.transaction(() => {
        const chatInfo = db.prepare(`
        INSERT INTO chats (type)
        VALUES ('private')
        RETURNING id, createdAt
    `).get();

        const chatId = chatInfo.id;

        const insertMember = db.prepare(`
        INSERT INTO chat_members (chatId, userId)
        VALUES (?, ?)
    `);

        insertMember.run(chatId, currentUserId);
        insertMember.run(chatId, receiverUserId);

        return chatInfo;
    });

    const newChat = createChat();

    return res.json(newChat);
});


export default router