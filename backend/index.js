// backend/index.js
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.get('/api/saludo', (req, res) => {
  res.json({ mensaje: 'Hola desde el backend de Node.js!' });
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
