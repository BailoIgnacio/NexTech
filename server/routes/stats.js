const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/statsController');

// GET /api/stats → Devuelve métricas globales del catálogo (totales, por categoría, etc.)
router.get('/', getStats);

module.exports = router;
