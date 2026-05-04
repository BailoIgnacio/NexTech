// Carga las variables de entorno desde el archivo .env (PORT, DB_FILE, etc.)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Routers de la API REST
const productsRouter = require('./routes/products');
const statsRouter = require('./routes/stats');

// Middleware global que captura cualquier error y lo convierte en JSON
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Si no hay PORT en .env, el servidor escucha en 3000
const PORT = process.env.PORT || 3000;

// Permite peticiones desde cualquier origen (útil en desarrollo con frontend separado)
app.use(cors());

// Permite recibir JSON en el body de las peticiones (POST, PUT, PATCH)
app.use(express.json());

// Sirve los archivos estáticos del frontend (HTML, CSS, JS) desde /public
app.use(express.static(path.join(__dirname, '../public')));

// Rutas de la API — cada router maneja su prefijo completo
app.use('/api/products', productsRouter);
app.use('/api/stats', statsRouter);

// El errorHandler siempre va al final para capturar errores de todos los routers
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`💻 NexTech corriendo en http://localhost:${PORT}`);
});
