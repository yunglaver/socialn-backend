import { db } from '../../db.js';
import { rooms } from '../state/rooms.js';
import { onlineUsers } from '../state/presence.js';

export function handleMessage(wss, ws, data) {
    if (!ws.userId) return;

    const createdAt = new Date().toISOString();

    const result = db
        .prepare(
            `
        INSERT INTO messages (chatId, text, senderId, createdAt)
        VALUES (?, ?, ?, ?)
    `
        )
        .run(data.chatId, data.text, ws.userId, createdAt);

    const members = db
        .prepare(
            `
    SELECT userId
    FROM chat_members
    WHERE chatId = ?
    `
        )
        .all(data.chatId);

    const newMessage = {
        id: result.lastInsertRowid,
        chatId: data.chatId,
        text: data.text,
        senderId: ws.userId,
        createdAt,
    };

    db.prepare(
        `
    update chats
    set lastMessageId = ?
    where chats.id = ?
    `
    ).run(result.lastInsertRowid, data.chatId);

    const room = rooms.get(data.chatId);
    console.log(rooms);

    if (room) {
        room.forEach((client) => {
            if (client.readyState === 1) {
                client.send(
                    JSON.stringify({
                        type: 'message',
                        payload: newMessage,
                    })
                );
            }
        });
    }

    members.forEach((user) => {
        const socket = onlineUsers.get(user.userId);
        if (!socket) return;

        const chat = db
            .prepare(
                `
        SELECT
            chats.id,
            messages.text AS lastMessageText,
            messages.createdAt AS lastMessageCreatedAt,
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
        LEFT JOIN messages
            ON chats.lastMessageId = messages.id
        WHERE chats.id = ?
    `
            )
            .get(user.userId, user.userId, data.chatId);

        socket.send(
            JSON.stringify({
                type: 'chat_updated',
                payload: chat,
            })
        );
    });
}
