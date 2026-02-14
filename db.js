import Database from 'better-sqlite3';

export const db = new Database('app_data.db');

// USERS
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    login TEXT UNIQUE,
    password TEXT,
    isOnline INTEGER DEFAULT 0,
    lastOnline TEXT DEFAULT ""
  )
`).run();

// CHATS
db.prepare(`
  CREATE TABLE IF NOT EXISTS chats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lastMessage TEXT,
    lastMessageTime TEXT,
    createdAt TEXT
  )
`).run();

// CHAT PARTICIPANTS
db.prepare(`
  CREATE TABLE IF NOT EXISTS chat_participants (
    chatId INTEGER,
    userId INTEGER
  )
`).run();


// MESSAGES
db.prepare(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chatId INTEGER,
    text TEXT,
    senderId INTEGER,
    createdAt TEXT
  )
`).run();



/*  MUSIC
db.prepare(`
  CREATE TABLE IF NOT EXISTS music (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT,
    originalName TEXT,
    uploaderId INTEGER,
    createdAt TEXT
  )
`).run();*/