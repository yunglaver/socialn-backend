import express from 'express';
import { db } from '../db.js';
import bcrypt from 'bcrypt';

const router = express.Router();

/* ===========================
   LOGIN
=========================== */
router.post('/', async (req, res) => {
    const { login, password } = req.body;
    if (!login || !password)
        return res.status(400).json({ error: 'Login and password required' })

    try {
        const user = db
            .prepare('SELECT * FROM users WHERE login = ?')
            .get(login);
        /*
        const pepper = '11998844'
        const salt = user.password.slice(-10)
        const passwordHashed = await bcrypt.hash((password + salt + pepper), 10);


        if (!(user.password === passwordHashed)) {
            return res.status(401).json({ error: 'Invalid credentials' });
        } else console.log(user.login, ' is online')
        */



        // ВРЕМЕННО
        if (!(user.password === password)) {
            return res.status(401).json({ error: 'Invalid credentials' });
        } else console.log(user.login, ' is online')
        // ВРЕМЕННО



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

export default router;