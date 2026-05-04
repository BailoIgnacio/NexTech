import api from './api.js';
import { initCart, addItem } from './cart.js';
import { formatPrice, showToast, debounce } from './utils.js';

const state = {
  items: [],
  page: 1,
  totalPages: 1,
  total: 0,
  filters: {},
};

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
        <button class="btn-comprar" onclick="event.stopPropagation(); window.listAddToCart(${JSON.stringify(p).replace(/"/g, '&quot;')})">Agregar</button>
      </div>
    </div>`;
}

async function loadProducts() {
  try {
    const params = { ...state.filters, page: state.page, limit: 12 };
    const res = await api.products.getAll(params);
    state.items = res.data || [];
    state.totalPages = res.totalPages || 1;
    state.total = res.total || 0;
    renderGrid();
    renderPagination();
  } catch (e) {
    console.error(e);
    showToast('Error al cargar productos', 'error');
  }
}

function renderGrid() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;
  if (state.items.length === 0) {
    grid.innerHTML = '<p class="no-results" style="font-family:Jost;color:var(--text-muted);grid-column:1/-1;padding:3rem 0;text-align:center">No se encontraron productos.</p>';
    return;
  }
  grid.innerHTML = state.items.map(createProductCard).join('');
}

function renderPagination() {
  const pag = document.getElementById('pagination');
  if (!pag) return;
  if (state.totalPages <= 1) { pag.innerHTML = ''; return; }
  let html = '';
  for (let i = 1; i <= state.totalPages; i++) {
    html += `<button class="page-btn${i === state.page ? ' active' : ''}" onclick="window.goToPage(${i})">${i}</button>`;
  }
  pag.innerHTML = html;
}

function setupFilters() {
  const categoriaLinks = document.querySelectorAll('[data-filter-cat]');
  categoriaLinks.forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const val = el.dataset.filterCat;
      state.filters.categoria = val !== '' ? val : undefined;
      state.page = 1;
      categoriaLinks.forEach(l => l.classList.remove('active'));
      el.classList.add('active');
      loadProducts();
    });
  });

  const colorRadios = document.querySelectorAll('[data-filter-color]');
  colorRadios.forEach(el => {
    el.addEventListener('change', () => {
      state.filters.color = el.value !== '' ? el.value : undefined;
      state.page = 1;
      loadProducts();
    });
  });

  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(() => {
      state.filters.search = searchInput.value.trim() || undefined;
      state.page = 1;
      loadProducts();
    }, 400));
  }

  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      const [sort, order] = sortSelect.value.split('-');
      state.filters.sort = sort !== 'default' ? sort : undefined;
      state.filters.order = order || undefined;
      state.page = 1;
      loadProducts();
    });
  }

  const precioMin = document.getElementById('precio-min');
  const precioMax = document.getElementById('precio-max');
  const applyPrice = debounce(() => {
    state.filters.precio_min = precioMin?.value || undefined;
    state.filters.precio_max = precioMax?.value || undefined;
    state.page = 1;
    loadProducts();
  }, 600);
  if (precioMin) precioMin.addEventListener('input', applyPrice);
  if (precioMax) precioMax.addEventListener('input', applyPrice);

  const filterBtn = document.getElementById('btn-filtrar');
  const sidebar = document.querySelector('.filters-sidebar');
  const filterClose = document.getElementById('filter-close');
  if (filterBtn && sidebar) {
    filterBtn.addEventListener('click', () => sidebar.classList.add('open'));
  }
  if (filterClose && sidebar) {
    filterClose.addEventListener('click', () => sidebar.classList.remove('open'));
  }
}

window.goToPage = function(p) {
  state.page = p;
  loadProducts();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.listAddToCart = function(product) {
  addItem(product);
  showToast(`${product.nombre} agregado al carrito`);
};

document.addEventListener('DOMContentLoaded', () => {
  initCart();
  setupFilters();

  const params = new URLSearchParams(location.search);
  const catParam = params.get('categoria');
  if (catParam) {
    state.filters.categoria = catParam;
    const titleEl = document.querySelector('.page-title');
    if (titleEl) titleEl.textContent = catParam;
    const matchingLink = document.querySelector(`[data-filter-cat="${catParam}"]`);
    if (matchingLink) {
      document.querySelectorAll('[data-filter-cat]').forEach(l => l.classList.remove('active'));
      matchingLink.classList.add('active');
    }
  }

  const searchParam = params.get('search');
  if (searchParam) {
    state.filters.search = searchParam;
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = searchParam;
  }

  loadProducts();
});
