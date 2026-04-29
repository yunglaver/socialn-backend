import { handleAuth } from './handlers/auth.handler.js';
import { handleMessage } from './handlers/message.handler.js';
import { handleJoinChat, handleLeaveChat } from './handlers/chat.handler.js';

export function routeMessage(wss, ws, raw) {
    let data;

    try {
        data = JSON.parse(raw.toString());
    } catch {
        ws.send(JSON.stringify({ type: 'error', error: 'Invalid JSON' }));
        return;
    }

    switch (data.type) {
        case 'auth':
            handleAuth(wss, ws, data);
            console.log('Auth received');
            break;

        case 'join_chat':
            handleJoinChat(wss, ws, data);
            break;

        case 'leave_chat':
            handleLeaveChat(wss, ws, data);
            break;

        case 'message':
            handleMessage(wss, ws, data);
            console.log(ws.userId, data);
            break;
        /*
        case 'typing':
            handleTyping(wss, ws, data);
            break;

        case 'read':
            handleRead(wss, ws, data);
            break;
*/
        default:
            ws.send(JSON.stringify({ type: 'error', error: 'Unknown type' }));
    }
}
