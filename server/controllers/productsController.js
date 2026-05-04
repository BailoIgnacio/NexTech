const db = require('../db/database');
const { v4: uuidv4 } = require('uuid');

function getAll(req, res, next) {
  try {
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

    let products = db.get('products').value();

    if (categoria) {
      products = products.filter(p => p.categoria === categoria);
    }

    if (color) {
      products = products.filter(p => p.color === color);
    }

    if (destacado !== undefined) {
      const val = destacado === 'true';
      products = products.filter(p => p.destacado === val);
    }

    if (novedad !== undefined) {
      const val = novedad === 'true';
      products = products.filter(p => p.novedad === val);
    }

    if (search) {
      const q = search.toLowerCase();
      products = products.filter(p =>
        (p.nombre && p.nombre.toLowerCase().includes(q)) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(q)) ||
        (p.marca && p.marca.toLowerCase().includes(q))
      );
    }

    if (precio_min !== undefined && precio_min !== '') {
      products = products.filter(p => p.precio >= parseFloat(precio_min));
    }

    if (precio_max !== undefined && precio_max !== '') {
      products = products.filter(p => p.precio <= parseFloat(precio_max));
    }

    if (sort) {
      products = [...products].sort((a, b) => {
        let valA = a[sort];
        let valB = b[sort];
        if (sort === 'nombre') {
          valA = (valA || '').toLowerCase();
          valB = (valB || '').toLowerCase();
        }
        if (sort === 'fecha') {
          valA = new Date(a.fecha_creacion).getTime();
          valB = new Date(b.fecha_creacion).getTime();
        }
        if (valA < valB) return order === 'asc' ? -1 : 1;
        if (valA > valB) return order === 'asc' ? 1 : -1;
        return 0;
      });
    }

    const total = products.length;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 12;
    const totalPages = Math.ceil(total / limitNum);
    const start = (pageNum - 1) * limitNum;
    const data = products.slice(start, start + limitNum);

    res.json({ data, total, page: pageNum, totalPages, limit: limitNum });
  } catch (err) {
    next(err);
  }
}

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

function create(req, res, next) {
  try {
    const { nombre, precio } = req.body;
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

    const now = new Date().toISOString();
    const newProduct = {
      id: uuidv4(),
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

    db.get('products').push(newProduct).write();
    res.status(201).json(newProduct);
  } catch (err) {
    next(err);
  }
}

function update(req, res, next) {
  try {
    const existing = db.get('products').find({ id: req.params.id }).value();
    if (!existing) {
      const err = new Error('Producto no encontrado');
      err.status = 404;
      return next(err);
    }

    const { nombre, precio } = req.body;
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
      fecha_creacion: existing.fecha_creacion,
      fecha_actualizacion: new Date().toISOString(),
    };

    db.get('products').find({ id: req.params.id }).assign(updated).write();
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

function partialUpdate(req, res, next) {
  try {
    const existing = db.get('products').find({ id: req.params.id }).value();
    if (!existing) {
      const err = new Error('Producto no encontrado');
      err.status = 404;
      return next(err);
    }

    const changes = { ...req.body, fecha_actualizacion: new Date().toISOString() };
    if (changes.precio !== undefined) {
      changes.precio = parseFloat(changes.precio);
    }
    if (changes.stock !== undefined) {
      changes.stock = parseInt(changes.stock);
    }

    db.get('products').find({ id: req.params.id }).assign(changes).write();
    const result = db.get('products').find({ id: req.params.id }).value();
    res.json(result);
  } catch (err) {
    next(err);
  }
}

function remove(req, res, next) {
  try {
    const existing = db.get('products').find({ id: req.params.id }).value();
    if (!existing) {
      const err = new Error('Producto no encontrado');
      err.status = 404;
      return next(err);
    }
    db.get('products').remove({ id: req.params.id }).write();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, update, partialUpdate, remove };
