// server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();

// Configuración básica de middlewares
app.use(cors());
app.use(express.json());

// Inicialización de Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Ruta de prueba 
app.get('/', (req, res) => {
  res.json({ mensaje: 'API de WorkGuard funcionando correctamente' });
});

// Ruta de ejemplo (GET) para listar los elementos de una tabla (por ejemplo, 'talleres')
app.get('/api/talleres', async (req, res) => {
  const { data, error } = await supabase
    .from('talleres')
    .select('*');

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  
  res.json(data);
});

// Puerto de escucha del servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});