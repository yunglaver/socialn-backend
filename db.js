import Database from 'better-sqlite3';

export const db = new Database('app_data.db');

// USERS
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    login TEXT UNIQUE,
    password TEXT,
    userPic text DEFAULT null,
    lastOnline TEXT DEFAULT ""
  )
`).run();

// CHATS
db.prepare(`
  CREATE TABLE IF NOT EXISTS chats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK(type IN ('private','group')),
    chatPic text DEFAULT null,
    title text DEFAULT null,
    privateKey TEXT UNIQUE,
    lastMessageId INTEGER DEFAULT null,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP

  )
`).run();

// CHAT MEMBERS
db.prepare(`CREATE TABLE IF NOT EXISTS chat_members (
    chatId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    role TEXT DEFAULT 'member',
    PRIMARY KEY (chatId, userId),
    FOREIGN KEY (chatId) REFERENCES chats(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
`).run();

// MESSAGES
db.prepare(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chatId INTEGER,
    text TEXT DEFAULT null,
    senderId INTEGER,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`).run();

// MUSIC
db.prepare(`
  CREATE TABLE IF NOT EXISTS music (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    isPublic INTEGER DEFAULT 0,
    filename TEXT,
    artistName TEXT,
    songTitle TEXT,
    originalName TEXT,
    duration REAL,
    uploaderId INTEGER,
    coverPic text DEFAULT null,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`).run();

// ADDED MUSIC
db.prepare(`
  CREATE TABLE IF NOT EXISTS user_music (
  userId INTEGER NOT NULL,
  songId INTEGER NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (userId, songId),
  FOREIGN KEY (songId) REFERENCES music(id) ON DELETE CASCADE
  )
`).run();