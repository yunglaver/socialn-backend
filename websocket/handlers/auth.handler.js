import jwt from 'jsonwebtoken';
import { onlineUsers } from '../state/presence.js';

export function handleAuth(wss, ws, data) {

    try {
        const decoded = jwt.verify(
            data.token,
            process.env.JWT_SECRET
        );

        ws.userId = decoded.userId;

        onlineUsers.set(ws.userId, ws);

        ws.send(JSON.stringify({ type: 'auth_success' }));

    } catch {
        ws.close();
    }
}