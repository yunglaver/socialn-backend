import express from 'express';
import { db } from '../db.js';
import {hash} from '../random.js'

const router = express.Router();

router.post('/', async (req, res) => {
    const { login, password } = req.body;

    const passwordHash = hash(password)

    try {
        db.prepare(`
            INSERT INTO users (login, password)
            VALUES (?, ?)
        `).run(login, passwordHash);

        res.json({
            success: hash(password),
            2: hash(password),
            3: hash(password)});

    } catch (error) {
        res.status(400).json({ error: 'User already exists' });
    }
});

export default router;