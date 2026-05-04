const express = require('express');
const router = express.Router();

// Importa cada función del controlador de productos
const {
  getAll,
  getById,
  create,
  update,
  partialUpdate,
  remove,
} = require('../controllers/productsController');

// GET    /api/products        → Lista productos con filtros opcionales y paginación
router.get('/', getAll);

// GET    /api/products/:id    → Devuelve un único producto por su UUID
router.get('/:id', getById);

// POST   /api/products        → Crea un nuevo producto (requiere nombre y precio)
router.post('/', create);

// PUT    /api/products/:id    → Reemplaza todos los campos de un producto
router.put('/:id', update);

// PATCH  /api/products/:id    → Actualiza solo los campos enviados en el body
router.patch('/:id', partialUpdate);

// DELETE /api/products/:id    → Elimina permanentemente un producto
router.delete('/:id', remove);

module.exports = router;
