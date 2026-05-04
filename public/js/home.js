import api from './api.js';
import { initCart, addItem } from './cart.js';
import { formatPrice, showToast } from './utils.js';

let featuredItems = [];
let carouselIndex = 0;

function createProductCard(p) {
  const imgHtml = p.imagen_url
    ? `<img src="${p.imagen_url}" alt="${p.nombre}" loading="lazy">`
    : `<div class="img-placeholder">${p.nombre.charAt(0)}</div>`;
  return `
    <div class="product-card" onclick="location.href='product.html?id=${p.id}'">
      <div class="card-image-wrap">
        ${imgHtml}
        ${!p.con_stock ? '<span class="badge-sin-stock">Sin stock</span>' : ''}
        ${p.novedad ? '<span class="badge-nuevo">Nuevo</span>' : ''}
      </div>
      <div class="card-info">
        <p class="card-name">${p.nombre}</p>
        <p class="card-brand">${p.marca || ''}</p>
        <p class="card-price">${formatPrice(p.precio)}</p>
        <button class="btn-comprar" onclick="event.stopPropagation(); window.homeAddToCart(${JSON.stringify(p).replace(/"/g, '&quot;')})">Agregar</button>
      </div>
    </div>`;
}

async function loadFeatured() {
  try {
    const res = await api.products.getAll({ destacado: 'true', limit: 8 });
    featuredItems = res.data || [];
    renderFeatured();
  } catch (e) {
    console.error(e);
  }
}

function renderFeatured() {
  const grid = document.getElementById('featured-grid');
  if (!grid) return;
  const visible = featuredItems.slice(carouselIndex, carouselIndex + 4);
  grid.innerHTML = visible.map(createProductCard).join('');
}

async function loadNew() {
  try {
    const res = await api.products.getAll({ novedad: 'true', limit: 4 });
    const grid = document.getElementById('new-grid');
    if (grid) grid.innerHTML = (res.data || []).map(createProductCard).join('');
  } catch (e) {
    console.error(e);
  }
}

function initCarousel() {
  const prev = document.getElementById('carousel-prev');
  const next = document.getElementById('carousel-next');
  if (prev) prev.addEventListener('click', () => {
    carouselIndex = Math.max(0, carouselIndex - 4);
    renderFeatured();
  });
  if (next) next.addEventListener('click', () => {
    if (carouselIndex + 4 < featuredItems.length) {
      carouselIndex += 4;
      renderFeatured();
    }
  });
}

window.homeAddToCart = function(product) {
  addItem(product);
  showToast(`${product.nombre} agregado al carrito`);
};

document.addEventListener('DOMContentLoaded', () => {
  initCart();
  loadFeatured();
  loadNew();
  initCarousel();
});
