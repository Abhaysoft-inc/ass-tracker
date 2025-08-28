import express from 'express';
import './routes'
import cors from 'cors'

const app = express();
app.use(cors());

app.use(express.json());

export default app;