import express from 'express';
import { db } from '../db.js';
import { randomToken } from '../random.js'
import bcrypt from 'bcrypt';

const router = express.Router();

/* ===========================
   REGISTER
=========================== */
router.post('/', async (req, res) => {
    const { login, password } = req.body;


    /*

    const salt = randomToken(10)
    const pepper = '11998844'
    const passwordSaltPepper = password + salt + pepper
    const passwordHashed = await bcrypt.hash(passwordSaltPepper, 10);
    const passwordResult = passwordHashed + salt
    */
    try {
        db.prepare(`
            INSERT INTO users (login, password)
            VALUES (?, ?)
        `).run(login, password);

        res.json({ success: true });

    } catch (error) {
        // если login UNIQUE — сюда попадём при повторной регистрации
        res.status(400).json({ error: 'User already exists' });
    }
});

export default router;