import {onlineUsers} from '../state/presence.js'


export function handleDisconnect(wws, ws) {

    console.log(`User ${ws.userId} disconnected`)
    onlineUsers.delete(ws.userId)

}


export function isUserOnline(userId) {
    return onlineUsers.has(userId);
}