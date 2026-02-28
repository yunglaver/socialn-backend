import express from 'express';
import cors from 'cors';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';
import { initWebSocket } from './websocket/websocket.js';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import registerRoutes from './routes/register.js';
import messageRoutes from './routes/messages.js';
import chatsRoutes from './routes/chats.js';
import logoutRoutes from './routes/logout.js';
import avatarRoutes from './routes/avatar.js';

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/register', registerRoutes);
app.use('/users', usersRoutes);
app.use('/messages', messageRoutes);
app.use('/chats', chatsRoutes);
app.use('/logout', logoutRoutes);
app.use('/avatar', avatarRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const server = http.createServer(app);

initWebSocket(server);

app.use((err, req, res, next) => {

    if (err instanceof multer.MulterError) {

        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'File too large. Max size is 10MB'
            });
        }

        return res.status(400).json({ error: err.message });
    }

    if (err.message === 'Only image files allowed') {
        return res.status(400).json({ error: err.message });
    }

    next(err);
});

server.listen(3000, () => {
    console.log('Server running');
});
