import express, { request } from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/music', express.static('music'));

app.listen(3000, () => {
    console.log('Backend running on http://localhost:3000');
});
