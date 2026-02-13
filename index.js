import express, {request} from 'express';
import cors from 'cors';
import multer from 'multer';
import { db } from './db.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/music', express.static('music'));

// REGISTRATION
app.post('/register', (req, res) => {
    const { login, password } = req.body;

    try {
        db.prepare(
            'INSERT INTO users (login, password) VALUES (?, ?)'
        ).run(login, password);

        res.json({ ok: true });
    } catch {
        res.status(400).json({ error: 'User already exists' });
    }
});

// AUTH
app.post('/auth', (req, res) => {
    const { login, password } = req.body;

    const user = db
        .prepare('SELECT * FROM users WHERE login=? AND password=?')
        .get(login, password);

    if (!user) {
        return res.status(401).json({ error: 'Wrong login or password' });
    }

    res.json({ userId: user.id });
});

// MESSAGES
app.get('/messages', (req, res) => {
    const senderId = request.query.senderId
    const receiverId = request.query.receiverId

    const messages = db
        .prepare(`
        SELECT *
        FROM messages
        WHERE (senderId = ? AND receiverId = ?)
            OR (senderId = ? AND receiverId = ?)
        ORDER BY createdAt ASC; 
        `)
        .all(senderId, receiverId, receiverId, senderId);
    res.json(messages);
});

app.post('/messages', (req, res) => {
    const { text, senderId } = req.body;

    const result = db.prepare(`
    INSERT INTO messages (text, senderId, receiverId, createdAt )
    VALUES (?, ?, ?, ?)
  `).run(text, senderId, new Date().toISOString());

    res.json({ id: result.lastInsertRowid });
});


/*  MUSIC UPLOAD (ещё не готово)
const storage = multer.diskStorage({
    destination: 'music/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

app.post('/music', upload.single('audio'), (req, res) => {
    const { userId } = req.body;

    db.prepare(`
    INSERT INTO music (filename, originalName, uploaderId, createdAt)
    VALUES (?, ?, ?, ?)
  `).run(
        req.file.filename,
        req.file.originalname,
        userId,
        new Date().toISOString()
    );

    res.json({ ok: true });
});

app.get('/music', (req, res) => {
    const tracks = db.prepare('SELECT * FROM music').all();
    res.json(tracks);
});
 */

app.listen(3000, () => {
    console.log('Backend running on http://localhost:3000');
});