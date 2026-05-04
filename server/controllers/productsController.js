const db = require('../db/database');
const { v4: uuidv4 } = require('uuid');

// GET /api/products
// Devuelve la lista de productos con soporte de filtros, búsqueda, orden y paginación.
function getAll(req, res, next) {
  try {
    // Extrae todos los parámetros de la query string con sus valores por defecto
    const {
      categoria,
      color,
      destacado,
      novedad,
      search,
      page = 1,
      limit = 12,
      sort,
      order = 'asc',
      precio_min,
      precio_max,
    } = req.query;

    // Carga todos los productos de la base de datos
    let products = db.get('products').value();

    // Filtro por categoría exacta (ej: "Laptops", "Celulares")
    if (categoria) {
      products = products.filter(p => p.categoria === categoria);
    }

    // Filtro por color exacto (ej: "Negro", "Blanco")
    if (color) {
      products = products.filter(p => p.color === color);
    }

    // Filtro por productos destacados (destacado=true o destacado=false)
    if (destacado !== undefined) {
      const val = destacado === 'true';
      products = products.filter(p => p.destacado === val);
    }

    // Filtro por novedades (novedad=true o novedad=false)
    if (novedad !== undefined) {
      const val = novedad === 'true';
      products = products.filter(p => p.novedad === val);
    }

    // Búsqueda de texto libre: busca en nombre, descripción y marca (insensible a mayúsculas)
    if (search) {
      const q = search.toLowerCase();
      products = products.filter(p =>
        (p.nombre && p.nombre.toLowerCase().includes(q)) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(q)) ||
        (p.marca && p.marca.toLowerCase().includes(q))
      );
    }

    // Filtro por precio mínimo
    if (precio_min !== undefined && precio_min !== '') {
      products = products.filter(p => p.precio >= parseFloat(precio_min));
    }

    // Filtro por precio máximo
    if (precio_max !== undefined && precio_max !== '') {
      products = products.filter(p => p.precio <= parseFloat(precio_max));
    }

    // Ordenamiento: soporta sort=precio, sort=nombre, sort=fecha con order=asc|desc
    if (sort) {
      products = [...products].sort((a, b) => {
        let valA = a[sort];
        let valB = b[sort];

        // Normaliza strings para comparación alfabética
        if (sort === 'nombre') {
          valA = (valA || '').toLowerCase();
          valB = (valB || '').toLowerCase();
        }

        // Convierte fecha ISO a timestamp numérico para comparación
        if (sort === 'fecha') {
          valA = new Date(a.fecha_creacion).getTime();
          valB = new Date(b.fecha_creacion).getTime();
        }

        if (valA < valB) return order === 'asc' ? -1 : 1;
        if (valA > valB) return order === 'asc' ? 1 : -1;
        return 0;
      });
    }

    // Paginación: calcula el slice correspondiente a la página solicitada
    const total = products.length;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 12;
    const totalPages = Math.ceil(total / limitNum);
    const start = (pageNum - 1) * limitNum;
    const data = products.slice(start, start + limitNum);

    // Responde con los datos paginados y metadatos de paginación
    res.json({ data, total, page: pageNum, totalPages, limit: limitNum });
  } catch (err) {
    next(err);
  }
}

// GET /api/products/:id
// Busca un producto por su ID único (UUID). Devuelve 404 si no existe.
function getById(req, res, next) {
  try {
    const product = db.get('products').find({ id: req.params.id }).value();
    if (!product) {
      const err = new Error('Producto no encontrado');
      err.status = 404;
      return next(err);
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
}

// POST /api/products
// Crea un nuevo producto. Campos obligatorios: nombre y precio (> 0).
function create(req, res, next) {
  try {
    const { nombre, precio } = req.body;

    // Validación: nombre obligatorio y no vacío
    if (!nombre || nombre.toString().trim() === '') {
      const err = new Error('El campo nombre es requerido');
      err.status = 400;
      return next(err);
    }

    // Validación: precio obligatorio, numérico y mayor a 0
    if (precio === undefined || precio === null || isNaN(parseFloat(precio)) || parseFloat(precio) <= 0) {
      const err = new Error('El campo precio es requerido y debe ser mayor a 0');
      err.status = 400;
      return next(err);
    }

    const now = new Date().toISOString();

    // Construye el objeto del producto con todos los campos, usando valores por defecto para los opcionales
    const newProduct = {
      id: uuidv4(),                                                    // ID único autogenerado
      nombre: req.body.nombre,
      descripcion: req.body.descripcion || '',
      precio: parseFloat(req.body.precio),
      stock: parseInt(req.body.stock) || 0,
      categoria: req.body.categoria || '',
      color: req.body.color || '',
      marca: req.body.marca || '',
      imagen_url: req.body.imagen_url || '',
      imagenes_extra: Array.isArray(req.body.imagenes_extra) ? req.body.imagenes_extra : [],
      destacado: req.body.destacado === true || req.body.destacado === 'true' ? true : false,
      novedad: req.body.novedad === true || req.body.novedad === 'true' ? true : false,
      con_stock: req.body.con_stock === false || req.body.con_stock === 'false' ? false : true,
      fecha_creacion: now,
      fecha_actualizacion: now,
    };

    // Persiste el nuevo producto en el archivo JSON
    db.get('products').push(newProduct).write();

    // Devuelve el producto creado con status 201 (Created)
    res.status(201).json(newProduct);
  } catch (err) {
    next(err);
  }
}

// PUT /api/products/:id
// Reemplaza completamente un producto. Requiere nombre y precio en el body.
// Los campos no enviados se resetean a sus valores por defecto.
function update(req, res, next) {
  try {
    // Verifica que el producto exista antes de reemplazarlo
    const existing = db.get('products').find({ id: req.params.id }).value();
    if (!existing) {
      const err = new Error('Producto no encontrado');
      err.status = 404;
      return next(err);
    }

    const { nombre, precio } = req.body;

    // Mismas validaciones que en create
    if (!nombre || nombre.toString().trim() === '') {
      const err = new Error('El campo nombre es requerido');
      err.status = 400;
      return next(err);
    }
    if (precio === undefined || precio === null || isNaN(parseFloat(precio)) || parseFloat(precio) <= 0) {
      const err = new Error('El campo precio es requerido y debe ser mayor a 0');
      err.status = 400;
      return next(err);
    }

    // Construye el objeto actualizado, preservando el ID y la fecha de creación originales
    const updated = {
      id: existing.id,
      nombre: req.body.nombre,
      descripcion: req.body.descripcion || '',
      precio: parseFloat(req.body.precio),
      stock: parseInt(req.body.stock) || 0,
      categoria: req.body.categoria || '',
      color: req.body.color || '',
      marca: req.body.marca || '',
      imagen_url: req.body.imagen_url || '',
      imagenes_extra: Array.isArray(req.body.imagenes_extra) ? req.body.imagenes_extra : [],
      destacado: req.body.destacado === true || req.body.destacado === 'true' ? true : false,
      novedad: req.body.novedad === true || req.body.novedad === 'true' ? true : false,
      con_stock: req.body.con_stock === false || req.body.con_stock === 'false' ? false : true,
      fecha_creacion: existing.fecha_creacion,        // Se conserva la fecha original
      fecha_actualizacion: new Date().toISOString(),  // Se actualiza la fecha de modificación
    };

    db.get('products').find({ id: req.params.id }).assign(updated).write();
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/products/:id
// Actualiza solo los campos presentes en el body. El resto permanece sin cambios.
// Útil para toggles rápidos como destacado/novedad/con_stock sin enviar el objeto completo.
function partialUpdate(req, res, next) {
  try {
    const existing = db.get('products').find({ id: req.params.id }).value();
    if (!existing) {
      const err = new Error('Producto no encontrado');
      err.status = 404;
      return next(err);
    }

    // Fusiona los cambios del body con la fecha de actualización automática
    const changes = { ...req.body, fecha_actualizacion: new Date().toISOString() };

    // Asegura tipos correctos si se envían precio o stock
    if (changes.precio !== undefined) {
      changes.precio = parseFloat(changes.precio);
    }
    if (changes.stock !== undefined) {
      changes.stock = parseInt(changes.stock);
    }

    db.get('products').find({ id: req.params.id }).assign(changes).write();

    // Devuelve el producto completo con los cambios aplicados
    const result = db.get('products').find({ id: req.params.id }).value();
    res.json(result);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/products/:id
// Elimina un producto de forma permanente. Devuelve 204 (No Content) si tiene éxito.
function remove(req, res, next) {
  try {
    const existing = db.get('products').find({ id: req.params.id }).value();
    if (!existing) {
      const err = new Error('Producto no encontrado');
      err.status = 404;
      return next(err);
    }
    db.get('products').remove({ id: req.params.id }).write();
    res.status(204).send(); // 204 = éxito sin cuerpo de respuesta
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, update, partialUpdate, remove };
