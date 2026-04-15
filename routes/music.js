import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs'
import { parseFile } from 'music-metadata';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'audioFile') {
            cb(null, 'uploads/music/audio');
        } else if (file.fieldname === 'coverPic') {
            cb(null, 'uploads/music/covers');
        }
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, uuidv4() + ext);
    }
});

const upload = multer({ storage });

router.delete('/:id', authMiddleware, (req, res) => {
    const songId = req.params.id;
    const userId = req.userId;

    try {
        const track = db.prepare(`
            SELECT filename, coverPic, uploaderId
            FROM music
            WHERE id = ?
        `).get(songId);

        if (!track) {
            return res.status(404).json({ error: 'Трек не найден' });
        }

        if (track.uploaderId === userId) {

            const audioPath = path.join('uploads/music/audio', track.filename);
            if (fs.existsSync(audioPath)) {
                fs.unlinkSync(audioPath);
            }

            if (track.coverPic && track.coverPic !== "/uploads/music/covers/default") {
                const basePath = track.coverPic.replace('/uploads/music/covers/', '');

                const sizes = ['_sm.webp', '_md.webp', '_original.webp'];

                sizes.forEach(size => {
                    const filePath = path.join('uploads/music/covers', basePath + size);
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                });
            }

            db.prepare(`
                DELETE FROM music
                WHERE id = ?
            `).run(songId);

            return res.json({ success: true, type: 'owner-delete' });
        }

        db.prepare(`
            DELETE FROM user_music
            WHERE userId = ? AND songId = ?
        `).run(userId, songId);

        res.json({ success: true, type: 'unlike' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка при удалении' });
    }
});

router.post('/:id/like', authMiddleware, (req, res) => {
    const userId = req.userId;
    const songId = req.params.id;

    try {
        db.prepare(`
            INSERT OR IGNORE INTO user_music (userId, songId)
            VALUES (?, ?)
        `).run(userId, songId);

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка при добавлении лайка' });
    }
});

router.get('/my', authMiddleware, (req, res) => {
    const userId = req.userId;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    try {
        const music = db
            .prepare(`
                SELECT DISTINCT m.id,
                                m.coverPic,
                                m.songTitle,
                                m.artistName,
                                m.createdAt,
                                m.isPublic,
                                m.duration,
                                m.filename,
                                CASE
                                    WHEN um.userId IS NOT NULL OR m.uploaderId = ?
                                        THEN 1
                                    ELSE 0
                                    END as isLiked
                FROM music m
                         LEFT JOIN user_music um
                                   ON m.id = um.songId AND um.userId = ?
                WHERE um.userId = ? OR m.uploaderId = ?
                ORDER BY m.createdAt DESC
                LIMIT ? OFFSET ?
            `)
            .all(userId, userId, userId, userId, limit, offset);
        res.json(music);
        console.log('/my')
    } catch (err) {
        res.status(500).json({ error: 'Ошибка при получении треков' });
    }
});

router.get('/all', authMiddleware, (req, res) => {
    const userId = req.userId;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    try {
        const music = db
            .prepare(`
                SELECT m.id,
                       m.coverPic,
                       m.songTitle,
                       m.artistName,
                       m.createdAt,
                       m.isPublic,
                       m.duration,
                       m.filename,
                       CASE
                           WHEN um.userId IS NOT NULL OR m.uploaderId = ?
                               THEN 1
                           ELSE 0
                           END as isLiked
                FROM music m
                         LEFT JOIN user_music um
                                   ON m.id = um.songId AND um.userId = ?
                WHERE m.isPublic = true
                ORDER BY m.createdAt DESC
                LIMIT ? OFFSET ?
            `)
            .all(userId, userId, limit, offset);
        if (music.coverPic === null) music.coverPic = null
        res.json(music);
        console.log('/all')
    } catch (err) {
        res.status(500).json({ error: 'Ошибка при получении треков' });
    }
});



router.post('/', authMiddleware, upload.fields([
    { name: 'audioFile', maxCount: 1 },
    { name: 'coverPic', maxCount: 1 }
]), async (req, res) => {
    try{

        const userId = req.userId;
        const audioFile = req.files['audioFile'][0];
        const metadata = await parseFile(audioFile.path);
        let {artistName, songTitle, isPublic} = req.body;
        artistName = artistName || metadata.common?.artist || 'Неизвестен';
        songTitle = songTitle || metadata.common?.title || audioFile.originalname;


        const duration = metadata.format.duration;


        if (!audioFile) res.status(400).json({error: 'Файл не загружен'})

        let imageSource = null;

        if (req.files['coverPic']?.[0]) {
            imageSource = req.files['coverPic'][0].path;
        } else if (metadata.common.picture?.length) {
            imageSource = metadata.common.picture[0].data;
        }

        let coverPath = "/uploads/music/covers/default";


        if (imageSource) {
            const sizes = {
                sm: 64,
                md: 256,
                original: null
            };

            const baseName = `track_${uuidv4()}`;

            await Promise.all(
                Object.entries(sizes).map(async ([key, size]) => {

                    const fileName = `${baseName}_${key}.webp`;
                    const outputPath = path.join('uploads/music/covers', fileName);

                    let pipeline = sharp(imageSource);

                    if (size) {
                        pipeline = pipeline.resize(size, size, { fit: 'cover' });
                    }

                    await pipeline.webp({ quality: 80 }).toFile(outputPath);
                })
            );
            coverPath = `/uploads/music/covers/${baseName}`;
        }

        db.prepare(`
        INSERT INTO music (filename,
                           originalName,
                           artistName,
                           songTitle,
                           coverPic,
                           uploaderId,
                           isPublic,
                           duration)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
            audioFile.filename,
            audioFile.originalname,
            artistName,
            songTitle,
            coverPath ? coverPath : null,
            userId,
            isPublic,
            duration
        );
        console.log("загружен новый трек")
        res.json({success: true});
    } catch (err) {
                console.error(err);
                res.status(500).json({ error: 'Ошибка загрузки' });
    }
});

export default router