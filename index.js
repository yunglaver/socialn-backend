import express, {request} from 'express';
import cors from 'cors';
import multer from 'multer';
import { db } from './db.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/music', express.static('music'));


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