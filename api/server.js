// server.js
import express from 'express';
import evaluateHandler from './api/evaluate.js';

const app = express();
const port = 3000;

app.get('/api/evaluate', evaluateHandler);

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
