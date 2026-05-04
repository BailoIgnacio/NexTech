import api from './api.js';
import { initCart, addItem } from './cart.js';
import { formatPrice, showToast } from './utils.js';

let currentProduct = null;
let selectedVariante = '';
let qty = 1;

function renderGallery(p) {
  const mainImg = document.getElementById('gallery-main-img');
  const thumbsEl = document.getElementById('gallery-thumbs');
  const allImages = [p.imagen_url, ...(p.imagenes_extra || [])].filter(Boolean);

  if (mainImg && allImages.length > 0) mainImg.src = allImages[0];

  if (thumbsEl && allImages.length > 1) {
    thumbsEl.innerHTML = allImages.map((url, i) =>
      `<img src="${url}" alt="Imagen ${i + 1}" class="gallery-thumb${i === 0 ? ' active' : ''}" onclick="window.changeMainImg('${url}', this)">`
    ).join('');
  }
}

window.changeMainImg = function(url, thumb) {
  const main = document.getElementById('gallery-main-img');
  if (main) main.src = url;
  document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
  if (thumb) thumb.classList.add('active');
};

function renderVariantes(p) {
  const container = document.getElementById('variantes-chips');
  if (!container) return;
  const variantes = ['128GB', '256GB', '512GB'];
  container.innerHTML = variantes.map((v, i) =>
    `<button class="chip${i === 0 ? ' active' : ''}" onclick="window.selectVariante('${v}', this)">${v}</button>`
  ).join('');
  selectedVariante = variantes[0];
}

window.selectVariante = function(v, el) {
  selectedVariante = v;
  document.querySelectorAll('.variantes-chips .chip').forEach(c => c.classList.remove('active'));
  if (el) el.classList.add('active');
};

function renderInfo(p) {
  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setEl('product-name', p.nombre);
  setEl('product-brand', p.marca || '');
  setEl('product-category', p.categoria || '');
  setEl('product-price-big', formatPrice(p.precio));
  setEl('product-description-text', p.descripcion || '');
  setEl('product-cuotas', `12 cuotas de ${formatPrice(Math.round(p.precio / 12))} sin interés`);
  document.title = `${p.nombre} — NexTech`;

  const addBtn = document.getElementById('btn-add-cart');
  if (addBtn && !p.con_stock) {
    addBtn.textContent = 'Sin stock';
    addBtn.disabled = true;
    addBtn.style.opacity = '0.5';
    addBtn.style.cursor = 'not-allowed';
  }
}

function setupQty() {
  const display = document.getElementById('qty-display');
  if (!display) return;
  display.textContent = qty;
  const btnMinus = document.getElementById('qty-minus');
  const btnPlus = document.getElementById('qty-plus');
  if (btnMinus) btnMinus.addEventListener('click', () => {
    qty = Math.max(1, qty - 1);
    display.textContent = qty;
  });
  if (btnPlus) btnPlus.addEventListener('click', () => {
    qty += 1;
    display.textContent = qty;
  });
}

function setupAddToCart() {
  const btn = document.getElementById('btn-add-cart');
  if (!btn) return;
  btn.addEventListener('click', () => {
    if (!currentProduct) return;
    if (!currentProduct.con_stock) {
      showToast('Este producto no tiene stock', 'error');
      return;
    }
    addItem(currentProduct, selectedVariante, qty);
    showToast(`${currentProduct.nombre} agregado al carrito`);
  });
}

async function loadSimilar(categoria, currentId) {
  try {
    const res = await api.products.getAll({ categoria, limit: 5 });
    const similar = (res.data || []).filter(p => p.id !== currentId).slice(0, 4);
    const grid = document.getElementById('similar-grid');
    if (!grid) return;
    grid.innerHTML = similar.map(p => {
      const imgHtml = p.imagen_url
        ? `<img src="${p.imagen_url}" alt="${p.nombre}" loading="lazy">`
        : `<div class="img-placeholder">${p.nombre.charAt(0)}</div>`;
      return `
        <div class="product-card" onclick="location.href='product.html?id=${p.id}'">
          <div class="card-image-wrap">${imgHtml}</div>
          <div class="card-info">
            <p class="card-name">${p.nombre}</p>
            <p class="card-price">${formatPrice(p.precio)}</p>
          </div>
        </div>`;
    }).join('');
  } catch (e) {
    console.error(e);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  initCart();
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  if (!id) { location.href = 'products.html'; return; }
  try {
    currentProduct = await api.products.getById(id);
    renderGallery(currentProduct);
    renderInfo(currentProduct);
    renderVariantes(currentProduct);
    setupQty();
    setupAddToCart();
    await loadSimilar(currentProduct.categoria, currentProduct.id);
  } catch (e) {
    showToast('Producto no encontrado', 'error');
    setTimeout(() => location.href = 'products.html', 2000);
  }
});
