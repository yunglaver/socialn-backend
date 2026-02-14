import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.js';
import registerRoutes from "./routes/register.js";
import messageRoutes from './routes/messages.js';
import chatsRoutes from './routes/chats.js';

const app = express();

app.use(cors());
app.use(express.json());



app.use('/auth', authRoutes);
app.use('/register', registerRoutes);
app.use('/messages', messageRoutes);
app.use('/chats', chatsRoutes);


app.listen(3000, () => {
    console.log('🚀 Backend running on http://localhost:3000');
});