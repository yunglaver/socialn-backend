import { WebSocketServer } from 'ws';
import { routeMessage } from './ws.router.js';
import {handleDisconnect} from './handlers/presence.handler.js'


export function initWebSocket(server) {

    const wss = new WebSocketServer({ server });

    wss.on('connection', (ws) => {
        console.log('NEW CONNECTION')
        ws.userId = null;
        ws.currentChatId = null;

        ws.on('message', (raw) => {
            routeMessage(wss, ws, raw);
        });

        ws.on('close', () => {
            handleDisconnect(wss, ws);
        });

    });

}