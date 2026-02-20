import Database from 'better-sqlite3';

export const db = new Database('app_data.db');

// USERS
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    login TEXT UNIQUE,
    password TEXT,
    isOnline INTEGER DEFAULT 0,
    userPic text DEFAULT null,
    lastOnline TEXT DEFAULT ""
  )
`).run();

// CHATS
db.prepare(`
  CREATE TABLE IF NOT EXISTS chats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT,
    privateKey TEXT UNIQUE,
    lastMessageId INTEGER DEFAULT null,
    createdAt TEXT

  )
`).run();

// CHAT MEMBERS
db.prepare(`
  CREATE TABLE IF NOT EXISTS chat_members (
    chatId INTEGER,
    userId INTEGER
  )
`).run();


// MESSAGES
db.prepare(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chatId INTEGER,
    text TEXT DEFAULT null,
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