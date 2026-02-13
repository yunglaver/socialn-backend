import express from 'express';
import { db } from '../db.js';
import { randomToken } from 'random.js'
import bcrypt from 'bcrypt';

const router = express.Router();

/* ===========================
   LOGIN
=========================== */
router.post('/login', async (req, res) => {
    const { login, password } = req.body;
    if (!login || !password) return {
        return res.status(400).json({ error: 'Login and password required' });
    }

    try {
        const user = db
            .prepare('SELECT * FROM users WHERE login = ?')
            .get(login);
        const pepper = '11998844'
        const salt = user.password.slice(-10)
        const passwordHashed = await bcrypt.hash((password + salt + pepper), 10);


        if (!(user.password === passwordHashed)) {
            return res.status(401).json({ error: 'Invalid credentials' });
        } else console.log(user.login, ' is online')

        db.prepare(`
            UPDATE users 
            SET isOnline = 1, lastOnline = ?
            WHERE id = ?
        `).run(new Date().toISOString(), user.id);

        res.json({ userId: user.id });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});


/* ===========================
   REGISTER
=========================== */
router.post('/register', async (req, res) => {
    const { login, password } = req.body;


    const salt = randomToken(10)
    const pepper = '11998844'
    const passwordSaltPepper = password + salt + pepper
    const passwordHashed = await bcrypt.hash(passwordSaltPepper, 10);
    const passwordResult = passwordHashed + salt

    try {
        db.prepare(`
            INSERT INTO users (login, password, isOnline, lastOnline)
            VALUES (?, ?, 0, "")
        `).run(login, passwordResult);

        res.json({ success: true });

    } catch (error) {
        // если login UNIQUE — сюда попадём при повторной регистрации
        res.status(400).json({ error: 'User already exists' });
    }
});


export default router;