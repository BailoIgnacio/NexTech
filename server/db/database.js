const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');
require('dotenv').config();

// Ruta al archivo JSON que actúa como base de datos.
// Se puede sobreescribir con la variable DB_FILE en el .env.
const dbFile = process.env.DB_FILE || './server/db/data.json';
const adapter = new FileSync(path.resolve(dbFile));
const db = low(adapter);

// Inicializa la estructura del archivo si está vacío o no existe.
// "products" es la única colección del sistema.
db.defaults({ products: [] }).write();

module.exports = db;
