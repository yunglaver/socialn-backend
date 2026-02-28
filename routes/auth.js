import express from 'express';
import { db } from '../db.js';
import {hash} from "../random.js";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

router.post('/', async (req, res) => {
    const { login, password } = req.body;

    if (!login || !password)
        return res.status(400).json({ error: 'Login and password required' })

    try {
        const user = db
            .prepare('SELECT * FROM users WHERE login = ?')
            .get(login);

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const inputHashed = hash(password);

        if (inputHashed !== user.password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        const userId = user.id
        const userLogin = user.login
        const userPic = user.userPic
        db.prepare(`
            UPDATE users 
            SET lastOnline = ?
            WHERE id = ?
        `).run(new Date().toISOString(), user.id);

        console.log(user.login, ' is online')
        return res.json({ token, userId, userLogin });


    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});

export default router;