import { formatPrice, showToast } from './utils.js';

const STORAGE_KEY = 'nextech_cart';

function getItems() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveItems(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function getCount() {
  return getItems().reduce((sum, i) => sum + i.cantidad, 0);
}

function getTotal() {
  return getItems().reduce((sum, i) => sum + i.precio * i.cantidad, 0);
}

function addItem(product, variante = '', cantidad = 1) {
  const items = getItems();
  const key = product.id + (variante ? '_' + variante : '');
  const existing = items.find(i => i._key === key);
  if (existing) {
    existing.cantidad += cantidad;
  } else {
    items.push({
      _key: key,
      id: product.id,
      nombre: product.nombre,
      precio: product.precio,
      imagen_url: product.imagen_url,
      cantidad,
      variante,
      color: product.color || '',
    });
  }
  saveItems(items);
  updateBadge();
  renderCart();
}

function removeItem(key) {
  const items = getItems().filter(i => i._key !== key);
  saveItems(items);
  updateBadge();
  renderCart();
}

function updateQty(key, delta) {
  const items = getItems();
  const item = items.find(i => i._key === key);
  if (!item) return;
  item.cantidad = Math.max(1, item.cantidad + delta);
  saveItems(items);
  updateBadge();
  renderCart();
}

function clearCart() {
  saveItems([]);
  updateBadge();
  renderCart();
}

function updateBadge() {
  const badge = document.getElementById('cart-badge');
  if (!badge) return;
  const count = getCount();
  badge.textContent = count;
  badge.style.display = count > 0 ? 'flex' : 'none';
}

function renderCart() {
  const cartItems = document.getElementById('cart-items');
  const cartFooter = document.querySelector('.cart-footer');
  if (!cartItems) return;
  const items = getItems();
  if (items.length === 0) {
    cartItems.innerHTML = `
      <div class="cart-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 01-8 0"/>
        </svg>
        <p>Tu carrito está vacío</p>
      </div>`;
    if (cartFooter) cartFooter.style.display = 'none';
    return;
  }
  if (cartFooter) cartFooter.style.display = 'block';
  cartItems.innerHTML = items.map(item => `
    <div class="cart-item">
      <div class="cart-item-img-wrap">
        ${item.imagen_url
          ? `<img src="${item.imagen_url}" alt="${item.nombre}" class="cart-item-img">`
          : `<div class="cart-item-img" style="display:flex;align-items:center;justify-content:center;background:var(--bg-soft);font-family:'Cormorant Garamond',serif;font-size:1.5rem;color:var(--text-light)">${item.nombre.charAt(0)}</div>`
        }
      </div>
      <div>
        <div class="cart-item-name">${item.nombre}</div>
        <div class="cart-item-price">${formatPrice(item.precio)}</div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="window.cartUpdateQty('${item._key}', -1)">−</button>
          <span>${item.cantidad}</span>
          <button class="qty-btn" onclick="window.cartUpdateQty('${item._key}', 1)">+</button>
        </div>
      </div>
      <button class="cart-item-remove" onclick="window.cartRemove('${item._key}')" title="Eliminar">×</button>
    </div>
  `).join('');
  const totalEl = document.getElementById('cart-total');
  if (totalEl) totalEl.textContent = formatPrice(getTotal());
}

function openCart() {
  const sidebar = document.getElementById('cart-sidebar');
  const overlay = document.getElementById('cart-overlay');
  if (sidebar) sidebar.classList.add('open');
  if (overlay) overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  const sidebar = document.getElementById('cart-sidebar');
  const overlay = document.getElementById('cart-overlay');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('active');
  document.body.style.overflow = '';
}

function buildWhatsAppURL() {
  const number = window.WHATSAPP_CONFIG?.number || '5491112345678';
  const items = getItems();
  if (items.length === 0) return null;
  const lines = items.map(i => `• ${i.nombre}${i.variante ? ' (' + i.variante + ')' : ''} x ${i.cantidad} — ${formatPrice(i.precio)} c/u`).join('\n');
  const msg = `Hola! Me gustaría consultar sobre los siguientes productos:\n\n${lines}\n\nTotal estimado: ${formatPrice(getTotal())}\n\n¿Están disponibles?`;
  return `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;
}

function initCart() {
  updateBadge();
  renderCart();

  window.cartUpdateQty = updateQty;
  window.cartRemove = removeItem;

  const cartBtn = document.getElementById('cart-btn');
  if (cartBtn) cartBtn.addEventListener('click', openCart);

  const cartClose = document.getElementById('cart-close');
  if (cartClose) cartClose.addEventListener('click', closeCart);

  const overlay = document.getElementById('cart-overlay');
  if (overlay) overlay.addEventListener('click', closeCart);

  const waBtn = document.getElementById('whatsapp-btn');
  if (waBtn) {
    waBtn.addEventListener('click', () => {
      const url = buildWhatsAppURL();
      if (!url) { showToast('Tu carrito está vacío', 'error'); return; }
      window.open(url, '_blank');
    });
  }
}

export { initCart, addItem, removeItem, updateQty, clearCart, getTotal, getCount, getItems, openCart, closeCart };
