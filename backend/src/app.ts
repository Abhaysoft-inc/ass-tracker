import express from 'express';
import './routes'

const app = express();

app.use(express.json());

export default app;