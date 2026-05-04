const db = require('../db/database');

function getStats(req, res, next) {
  try {
    const products = db.get('products').value();

    const total_productos = products.length;
    const productos_destacados = products.filter(p => p.destacado === true).length;
    const productos_sin_stock = products.filter(p => p.con_stock === false).length;
    const novedades = products.filter(p => p.novedad === true).length;

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
