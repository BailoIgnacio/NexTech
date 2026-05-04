const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { v4: uuidv4 } = require('uuid');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const dbFile = process.env.DB_FILE || './server/db/data.json';
const adapter = new FileSync(path.resolve(dbFile));
const db = low(adapter);

db.defaults({ products: [] }).write();

const products = [
  // LAPTOPS
  {
    id: uuidv4(),
    nombre: 'MacBook Air M2',
    descripcion: 'La laptop más delgada y liviana de Apple, impulsada por el chip M2. Pantalla Liquid Retina de 13.6 pulgadas, hasta 18 horas de batería y cuerpo de aluminio reciclado. Ideal para trabajo profesional y creatividad.',
    precio: 720000,
    stock: 8,
    categoria: 'Laptops',
    color: 'Plateado',
    marca: 'Apple',
    imagen_url: 'https://picsum.photos/seed/macbook-air-m2/600/600',
    imagenes_extra: [
      'https://picsum.photos/seed/macbook-air-m2-b/600/600',
      'https://picsum.photos/seed/macbook-air-m2-c/600/600'
    ],
    destacado: true,
    novedad: true,
    con_stock: true,
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString()
  },
  {
    id: uuidv4(),
    nombre: 'Dell XPS 15',
    descripcion: 'La Dell XPS 15 combina rendimiento excepcional con un diseño premium. Pantalla OLED InfinityEdge de 15.6 pulgadas, procesador Intel Core i7 de última generación y gráficos NVIDIA dedicados. La elección perfecta para profesionales creativos.',
    precio: 680000,
    stock: 5,
    categoria: 'Laptops',
    color: 'Negro',
    marca: 'Dell',
    imagen_url: 'https://picsum.photos/seed/dell-xps-15/600/600',
    imagenes_extra: [
      'https://picsum.photos/seed/dell-xps-15-b/600/600',
      'https://picsum.photos/seed/dell-xps-15-c/600/600'
    ],
    destacado: false,
    novedad: false,
    con_stock: true,
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString()
  },
  {
    id: uuidv4(),
    nombre: 'Lenovo ThinkPad X1 Carbon',
    descripcion: 'Diseñada para profesionales exigentes. Ultraliviana con apenas 1.12 kg, pantalla IPS de 14 pulgadas, teclado certificado MIL-SPEC y batería de larga duración. La confiabilidad empresarial en su máxima expresión.',
    precio: 590000,
    stock: 0,
    categoria: 'Laptops',
    color: 'Negro',
    marca: 'Lenovo',
    imagen_url: 'https://picsum.photos/seed/lenovo-thinkpad-x1/600/600',
    imagenes_extra: [
      'https://picsum.photos/seed/lenovo-thinkpad-x1-b/600/600',
      'https://picsum.photos/seed/lenovo-thinkpad-x1-c/600/600'
    ],
    destacado: false,
    novedad: false,
    con_stock: false,
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString()
  },
  {
    id: uuidv4(),
    nombre: 'Samsung Galaxy Book3 Pro',
    descripcion: 'Elegancia y rendimiento en perfecta armonía. Pantalla Dynamic AMOLED 2X de 16 pulgadas, procesador Intel Core i7, integración nativa con Galaxy y batería de 76Wh. El ecosistema Samsung en tu escritorio.',
    precio: 550000,
    stock: 6,
    categoria: 'Laptops',
    color: 'Gris',
    marca: 'Samsung',
    imagen_url: 'https://picsum.photos/seed/samsung-galaxy-book3/600/600',
    imagenes_extra: [
      'https://picsum.photos/seed/samsung-galaxy-book3-b/600/600',
      'https://picsum.photos/seed/samsung-galaxy-book3-c/600/600'
    ],
    destacado: false,
    novedad: true,
    con_stock: true,
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString()
  },

  // CELULARES
  {
    id: uuidv4(),
    nombre: 'iPhone 15 Pro',
    descripcion: 'El iPhone más avanzado hasta la fecha. Chip A17 Pro de titanio, sistema de cámara Pro con zoom óptico 5x, Dynamic Island y USB-C. Diseño en titanio grado aeroespacial para máxima resistencia y elegancia.',
    precio: 800000,
    stock: 10,
    categoria: 'Celulares',
    color: 'Plateado',
    marca: 'Apple',
    imagen_url: 'https://picsum.photos/seed/iphone-15-pro/600/600',
    imagenes_extra: [
      'https://picsum.photos/seed/iphone-15-pro-b/600/600',
      'https://picsum.photos/seed/iphone-15-pro-c/600/600'
    ],
    destacado: true,
    novedad: true,
    con_stock: true,
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString()
  },
  {
    id: uuidv4(),
    nombre: 'Samsung Galaxy S24',
    descripcion: 'Galaxy AI llega al S24. Inteligencia artificial integrada para traducción en tiempo real, edición de fotos avanzada y asistente inteligente. Pantalla Dynamic AMOLED 2X de 6.2 pulgadas y procesador Snapdragon 8 Gen 3.',
    precio: 620000,
    stock: 12,
    categoria: 'Celulares',
    color: 'Negro',
    marca: 'Samsung',
    imagen_url: 'https://picsum.photos/seed/samsung-galaxy-s24/600/600',
    imagenes_extra: [
      'https://picsum.photos/seed/samsung-galaxy-s24-b/600/600',
      'https://picsum.photos/seed/samsung-galaxy-s24-c/600/600'
    ],
    destacado: false,
    novedad: true,
    con_stock: true,
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString()
  },
  {
    id: uuidv4(),
    nombre: 'Xiaomi 14 Pro',
    descripcion: 'Co-diseñado con Leica, el Xiaomi 14 Pro lleva la fotografía móvil a otro nivel. Sensor Sony IMX989 de 1 pulgada, zoom flotante de focal variable y carga hiperrápida de 120W. Rendimiento flagship sin concesiones.',
    precio: 480000,
    stock: 7,
    categoria: 'Celulares',
    color: 'Blanco',
    marca: 'Xiaomi',
    imagen_url: 'https://picsum.photos/seed/xiaomi-14-pro/600/600',
    imagenes_extra: [
      'https://picsum.photos/seed/xiaomi-14-pro-b/600/600',
      'https://picsum.photos/seed/xiaomi-14-pro-c/600/600'
    ],
    destacado: false,
    novedad: false,
    con_stock: true,
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString()
  },
  {
    id: uuidv4(),
    nombre: 'Google Pixel 8',
    descripcion: 'El poder de Google en tus manos. Chip Google Tensor G3, cámara de 50MP con Magic Eraser y Best Take, 7 años de actualizaciones garantizados. El smartphone que piensa como vos.',
    precio: 420000,
    stock: 0,
    categoria: 'Celulares',
    color: 'Gris',
    marca: 'Xiaomi',
    imagen_url: 'https://picsum.photos/seed/google-pixel-8/600/600',
    imagenes_extra: [
      'https://picsum.photos/seed/google-pixel-8-b/600/600',
      'https://picsum.photos/seed/google-pixel-8-c/600/600'
    ],
    destacado: false,
    novedad: false,
    con_stock: false,
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString()
  },

  // AURICULARES
  {
    id: uuidv4(),
    nombre: 'Sony WH-1000XM5',
    descripcion: 'El estándar de oro en cancelación de ruido. Con 8 micrófonos y procesador QN1 HD, bloquea el mundo exterior para que te concentres en tu música. 30 horas de batería, audio LDAC de alta resolución y carga rápida.',
    precio: 280000,
    stock: 15,
    categoria: 'Auriculares',
    color: 'Negro',
    marca: 'Sony',
    imagen_url: 'https://picsum.photos/seed/sony-wh1000xm5/600/600',
    imagenes_extra: [
      'https://picsum.photos/seed/sony-wh1000xm5-b/600/600',
      'https://picsum.photos/seed/sony-wh1000xm5-c/600/600'
    ],
    destacado: true,
    novedad: false,
    con_stock: true,
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString()
  },
  {
    id: uuidv4(),
    nombre: 'AirPods Pro 2da Gen',
    descripcion: 'Cancelación de ruido adaptativa H2 que elimina hasta 2x más ruido de fondo. Audio espacial personalizado con seguimiento de cabeza, hasta 30 horas de batería con el estuche y resistencia al agua IPX4.',
    precio: 320000,
    stock: 20,
    categoria: 'Auriculares',
    color: 'Blanco',
    marca: 'Apple',
    imagen_url: 'https://picsum.photos/seed/airpods-pro-2/600/600',
    imagenes_extra: [
      'https://picsum.photos/seed/airpods-pro-2-b/600/600',
      'https://picsum.photos/seed/airpods-pro-2-c/600/600'
    ],
    destacado: false,
    novedad: false,
    con_stock: true,
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString()
  },
  {
    id: uuidv4(),
    nombre: 'JBL Tune 770NC',
    descripcion: 'Cancelación de ruido adaptativa con sonido JBL Pure Bass. Hasta 70 horas de reproducción, plegable para mayor portabilidad, carga rápida (5 min = 3 horas) y asistente de voz integrado.',
    precio: 150000,
    stock: 18,
    categoria: 'Auriculares',
    color: 'Gris',
    marca: 'JBL',
    imagen_url: 'https://picsum.photos/seed/jbl-tune-770nc/600/600',
    imagenes_extra: [
      'https://picsum.photos/seed/jbl-tune-770nc-b/600/600',
      'https://picsum.photos/seed/jbl-tune-770nc-c/600/600'
    ],
    destacado: false,
    novedad: true,
    con_stock: true,
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString()
  },
  {
    id: uuidv4(),
    nombre: 'Samsung Galaxy Buds2 Pro',
    descripcion: 'True Wireless con cancelación de ruido inteligente y audio Hi-Fi de 24 bits. Diseño ergonómico con ajuste perfecto, integración Galaxy exclusiva para cambio automático de dispositivo y resistencia al agua IPX7.',
    precio: 210000,
    stock: 9,
    categoria: 'Auriculares',
    color: 'Gris',
    marca: 'Samsung',
    imagen_url: 'https://picsum.photos/seed/samsung-buds2-pro/600/600',
    imagenes_extra: [
      'https://picsum.photos/seed/samsung-buds2-pro-b/600/600',
      'https://picsum.photos/seed/samsung-buds2-pro-c/600/600'
    ],
    destacado: false,
    novedad: false,
    con_stock: true,
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString()
  },

  // ACCESORIOS
  {
    id: uuidv4(),
    nombre: 'Apple Watch Series 9',
    descripcion: 'El smartwatch más avanzado de Apple. Chip S9, pantalla Always-On 2000 nits, doble toque para interactuar sin tocar la pantalla, Siri on-device y monitoreo de salud avanzado. Carbon neutral.',
    precio: 380000,
    stock: 11,
    categoria: 'Accesorios',
    color: 'Plateado',
    marca: 'Apple',
    imagen_url: 'https://picsum.photos/seed/apple-watch-series9/600/600',
    imagenes_extra: [
      'https://picsum.photos/seed/apple-watch-series9-b/600/600',
      'https://picsum.photos/seed/apple-watch-series9-c/600/600'
    ],
    destacado: true,
    novedad: false,
    con_stock: true,
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString()
  },
  {
    id: uuidv4(),
    nombre: 'Samsung Galaxy Watch6',
    descripcion: 'Salud avanzada en tu muñeca. Composición corporal, seguimiento del sueño con IA, ECG y presión arterial. Pantalla Sapphire Crystal resistente, GPS integrado y hasta 40 horas de batería.',
    precio: 290000,
    stock: 14,
    categoria: 'Accesorios',
    color: 'Negro',
    marca: 'Samsung',
    imagen_url: 'https://picsum.photos/seed/samsung-galaxy-watch6/600/600',
    imagenes_extra: [
      'https://picsum.photos/seed/samsung-galaxy-watch6-b/600/600',
      'https://picsum.photos/seed/samsung-galaxy-watch6-c/600/600'
    ],
    destacado: false,
    novedad: true,
    con_stock: true,
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString()
  },
  {
    id: uuidv4(),
    nombre: 'iPad Pro M2',
    descripcion: 'El iPad más potente jamás creado. Chip M2 con hasta 16GB de RAM, pantalla Liquid Retina XDR de 12.9 pulgadas con ProMotion 120Hz, compatibilidad con Apple Pencil 2 y Magic Keyboard. Reemplaza tu laptop.',
    precio: 750000,
    stock: 4,
    categoria: 'Accesorios',
    color: 'Gris',
    marca: 'Apple',
    imagen_url: 'https://picsum.photos/seed/ipad-pro-m2/600/600',
    imagenes_extra: [
      'https://picsum.photos/seed/ipad-pro-m2-b/600/600',
      'https://picsum.photos/seed/ipad-pro-m2-c/600/600'
    ],
    destacado: false,
    novedad: false,
    con_stock: true,
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString()
  },
  {
    id: uuidv4(),
    nombre: 'Samsung Galaxy Tab S9',
    descripcion: 'La tablet Android más potente del mercado. Pantalla Dynamic AMOLED 2X de 11 pulgadas, procesador Snapdragon 8 Gen 2, resistencia IP68 al agua y polvo, S Pen incluido y DeX para modo escritorio.',
    precio: 520000,
    stock: 6,
    categoria: 'Accesorios',
    color: 'Blanco',
    marca: 'Samsung',
    imagen_url: 'https://picsum.photos/seed/samsung-galaxy-tab-s9/600/600',
    imagenes_extra: [
      'https://picsum.photos/seed/samsung-galaxy-tab-s9-b/600/600',
      'https://picsum.photos/seed/samsung-galaxy-tab-s9-c/600/600'
    ],
    destacado: false,
    novedad: false,
    con_stock: true,
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString()
  }
];

db.set('products', products).write();

console.log(`✅ Seed: ${products.length} productos insertados`);
