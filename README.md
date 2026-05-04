# NexTech — E-commerce de Tecnología

Tienda online de productos tecnológicos con panel de administración CRUD, carrito persistente y consulta por WhatsApp.

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Servidor | Node.js + Express |
| Base de datos | lowdb 1.0.0 (JSON en disco) |
| Frontend | HTML5 + CSS3 + JavaScript ES Modules (Vanilla) |
| Persistencia del carrito | localStorage |
| ID únicos | uuid v9 |
| Hot reload (dev) | nodemon |

---

## Instalación y uso

### 1. Instalar dependencias

```bash
npm install
```

### 2. Popular la base de datos

```bash
npm run seed
```

Esto inserta 16 productos (4 por categoría: Laptops, Celulares, Auriculares, Accesorios).

### 3. Iniciar el servidor

```bash
# Desarrollo (con hot reload)
npm run dev

# Producción
npm start
```

El servidor corre en **http://localhost:3000**

---

## Acceso al panel de administración

```
http://localhost:3000/admin/
```

Desde el panel podés:
- Ver estadísticas (total productos, destacados, novedades, sin stock)
- Buscar productos por nombre o marca
- Crear, editar y eliminar productos
- Marcar/desmarcar destacados con un clic

---

## Cómo cambiar el número de WhatsApp

El número se configura en dos lugares:

**1. En `.env`:**
```
WHATSAPP_NUMBER=5491112345678
```

**2. En cada HTML público** (index.html, products.html, product.html):
```html
<script>window.WHATSAPP_CONFIG = { number: "5491112345678" };</script>
```

El formato es código de país + número sin espacios ni guiones. Para Argentina: `549` + número sin el 0 inicial ni el 15.

---

## Estructura de carpetas

```
nextech/
├── server/
│   ├── index.js                    # Punto de entrada del servidor
│   ├── routes/
│   │   ├── products.js             # Router de productos
│   │   └── stats.js                # Router de estadísticas
│   ├── controllers/
│   │   ├── productsController.js   # Lógica CRUD de productos
│   │   └── statsController.js      # Lógica de estadísticas
│   ├── middleware/
│   │   └── errorHandler.js         # Manejador global de errores
│   └── db/
│       ├── database.js             # Instancia de lowdb
│       ├── seed.js                 # Script para poblar la BD
│       └── data.json               # Archivo de base de datos (git-ignored)
├── public/
│   ├── index.html                  # Home
│   ├── products.html               # Listado de productos con filtros
│   ├── product.html                # Detalle de producto
│   ├── admin/
│   │   └── index.html              # Panel de administración
│   ├── css/
│   │   └── styles.css              # Estilos globales
│   └── js/
│       ├── api.js                  # Cliente HTTP hacia la API
│       ├── cart.js                 # Lógica del carrito (localStorage)
│       ├── utils.js                # Utilidades (toast, formatPrice, etc.)
│       ├── home.js                 # Lógica de la página home
│       ├── products-list.js        # Lógica del listado
│       ├── product-detail.js       # Lógica del detalle
│       └── admin.js                # Lógica del panel admin
├── .env                            # Variables de entorno (git-ignored)
├── .gitignore
├── package.json
└── README.md
```

---

## API — Endpoints

Base URL: `http://localhost:3000/api`

### Productos

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/products` | Listar con filtros y paginación |
| GET | `/api/products/:id` | Obtener un producto |
| POST | `/api/products` | Crear producto |
| PUT | `/api/products/:id` | Reemplazar producto |
| PATCH | `/api/products/:id` | Actualización parcial |
| DELETE | `/api/products/:id` | Eliminar producto |

### Estadísticas

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/stats` | Estadísticas generales |

---

### Query params de GET /api/products

| Param | Tipo | Descripción |
|-------|------|-------------|
| `categoria` | string | Filtrar por categoría |
| `color` | string | Filtrar por color |
| `destacado` | `true`/`false` | Filtrar destacados |
| `novedad` | `true`/`false` | Filtrar novedades |
| `search` | string | Buscar en nombre, descripción y marca |
| `precio_min` | number | Precio mínimo |
| `precio_max` | number | Precio máximo |
| `page` | number | Página (default: 1) |
| `limit` | number | Resultados por página (default: 12) |
| `sort` | `nombre`/`precio`/`fecha` | Campo de ordenamiento |
| `order` | `asc`/`desc` | Dirección del ordenamiento |

---

### Ejemplos de curl

```bash
# Listar todos los productos
curl http://localhost:3000/api/products

# Filtrar laptops ordenadas por precio
curl "http://localhost:3000/api/products?categoria=Laptops&sort=precio&order=asc"

# Buscar por nombre
curl "http://localhost:3000/api/products?search=iphone"

# Productos destacados
curl "http://localhost:3000/api/products?destacado=true"

# Crear un producto
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Sony WH-1000XM4",
    "precio": 240000,
    "categoria": "Auriculares",
    "marca": "Sony",
    "color": "Negro",
    "con_stock": true
  }'

# Actualizar parcialmente (marcar como destacado)
curl -X PATCH http://localhost:3000/api/products/ID_DEL_PRODUCTO \
  -H "Content-Type: application/json" \
  -d '{"destacado": true}'

# Eliminar un producto
curl -X DELETE http://localhost:3000/api/products/ID_DEL_PRODUCTO

# Estadísticas
curl http://localhost:3000/api/stats
```

---

## Categorías y marcas

**Categorías:** Laptops · Celulares · Auriculares · Accesorios

**Marcas:** Apple · Samsung · Sony · Xiaomi · JBL · Lenovo · Dell

**Colores:** Negro · Blanco · Gris · Plateado

**Rango de precios:** $150.000 — $800.000 ARS

---

## Notas de desarrollo

- La base de datos es un archivo JSON (`server/db/data.json`) ignorado por git. Cada vez que inicies el proyecto en un entorno nuevo, ejecutá `npm run seed`.
- El frontend usa ES Modules nativos del navegador (`type="module"`), por lo que necesita servirse desde un servidor HTTP (no abrir directamente como archivo).
- El carrito se persiste en `localStorage` con la clave `nextech_cart`.
- Las imágenes usan [picsum.photos](https://picsum.photos) como placeholder.
