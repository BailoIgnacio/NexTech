const db = require('../db/database');

// GET /api/stats
// Calcula y devuelve métricas globales del catálogo de productos.
// No recibe parámetros — siempre lee el estado actual de la base de datos.
function getStats(req, res, next) {
  try {
    const products = db.get('products').value();

    // Conteos simples sobre toda la colección
    const total_productos = products.length;
    const productos_destacados = products.filter(p => p.destacado === true).length;
    const productos_sin_stock = products.filter(p => p.con_stock === false).length;
    const novedades = products.filter(p => p.novedad === true).length;

    // Conteo de productos agrupados por categoría
    const categorias = ['Laptops', 'Celulares', 'Auriculares', 'Accesorios'];
    const productos_por_categoria = {};
    categorias.forEach(cat => {
      productos_por_categoria[cat] = products.filter(p => p.categoria === cat).length;
    });

    res.json({
      total_productos,
      productos_destacados,
      productos_sin_stock,
      novedades,
      productos_por_categoria,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getStats };
