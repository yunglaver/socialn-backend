import express from 'express';
import { db } from '../db.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, '..', 'uploads', 'avatars');
fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files allowed'));
        }
    },
});

const SIZES = {
    sm: 64,
    md: 256,
    original: null,
};

router.get('/', authMiddleware, (req, res) => {
    const user = db
        .prepare(`SELECT id, login, userPic FROM users WHERE id = ?`)
        .get(req.userId);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    return res.json(user);
});

router.post('/', authMiddleware, upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const userId = req.userId;

        await Promise.all(
            Object.entries(SIZES).map(async ([key, size]) => {
                const fileName = `user_${userId}_${key}.webp`;
                const outputPath = path.join(uploadDir, fileName);

                let pipeline = sharp(req.file.buffer);

                if (size) {
                    pipeline = pipeline.resize(size, size, { fit: 'cover' });
                }

                await pipeline.webp({ quality: 80 }).toFile(outputPath);
            })
        );

        const basePath = `/uploads/avatars/user_${userId}`;

        db.prepare(
            `
                UPDATE users
                SET userPic = ?
                WHERE id = ?
            `
        ).run(basePath, userId);

        return res.json({
            success: true,
            userPic: basePath,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Upload failed' });
    }
});

export default router;
