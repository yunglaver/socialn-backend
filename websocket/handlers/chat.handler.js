import { rooms } from '../state/rooms.js';


export function handleJoinChat(wss, ws, data) {

    const chatId = data.chatId;
    ws.currentChatId = chatId;

    if (!rooms.has(chatId)) {
        rooms.set(chatId, new Set());
    }

    rooms.get(chatId).add(ws);

}

export function handleLeaveChat(wss, ws, data) {

    const chatId = data.chatId;

    if (rooms.has(chatId)) {
        rooms.get(chatId).delete(ws);
    }

    ws.currentChatId = null;
}

