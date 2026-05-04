import api from '../js/api.js';
import { formatPrice, formatDate, showToast } from '../js/utils.js';

let allProducts = [];
let filteredProducts = [];
let editingId = null;

async function loadStats() {
  try {
    const s = await api.stats.get();
    document.getElementById('stat-total').textContent = s.total_productos;
    document.getElementById('stat-sin-stock').textContent = s.productos_sin_stock;
    document.getElementById('stat-destacados').textContent = s.productos_destacados;
    document.getElementById('stat-novedades').textContent = s.novedades;
  } catch (e) {
    console.error(e);
  }
}

async function loadProducts() {
  try {
    const res = await api.products.getAll({ limit: 999 });
    allProducts = res.data || [];
    filteredProducts = [...allProducts];
    renderTable();
  } catch (e) {
    showToast('Error al cargar productos', 'error');
  }
}

function renderTable() {
  const tbody = document.getElementById('products-tbody');
  if (!tbody) return;
  tbody.innerHTML = filteredProducts.map(p => `
    <tr>
      <td>
        ${p.imagen_url
          ? `<img src="${p.imagen_url}" alt="${p.nombre}" class="table-img">`
          : `<div class="table-img-placeholder">${p.nombre.charAt(0)}</div>`
        }
      </td>
      <td><strong>${p.nombre}</strong><br><small style="color:var(--text-muted)">${p.marca || ''}</small></td>
      <td>${p.categoria}</td>
      <td>${formatPrice(p.precio)}</td>
      <td>${p.stock ?? 0}</td>
      <td>
        <span class="badge-destacado ${p.destacado ? 'badge-si' : 'badge-no'}"
              onclick="window.toggleDestacado('${p.id}', ${p.destacado})"
              title="${p.destacado ? 'Quitar destacado' : 'Marcar como destacado'}">
          ${p.destacado ? '★ Sí' : '☆ No'}
        </span>
      </td>
      <td style="white-space:nowrap">
        <button class="btn-edit" onclick="window.openProductModal('${p.id}')">Editar</button>
        <button class="btn-delete" onclick="window.deleteProduct('${p.id}')">Eliminar</button>
      </td>
    </tr>
  `).join('');
}

window.openProductModal = async function(id = null) {
  editingId = id;
  const modal = document.getElementById('product-modal');
  const form = document.getElementById('product-form');
  const title = document.getElementById('modal-title');
  if (!modal || !form) return;
  form.reset();
  if (id) {
    title.textContent = 'Editar Producto';
    try {
      const p = await api.products.getById(id);
      form.nombre.value = p.nombre || '';
      form.descripcion.value = p.descripcion || '';
      form.precio.value = p.precio || '';
      form.stock.value = p.stock ?? 0;
      form.categoria.value = p.categoria || '';
      form.color.value = p.color || '';
      form.marca.value = p.marca || '';
      form.imagen_url.value = p.imagen_url || '';
      form.imagenes_extra.value = (p.imagenes_extra || []).join(', ');
      form.destacado.checked = !!p.destacado;
      form.novedad.checked = !!p.novedad;
      form.con_stock.checked = p.con_stock !== false;
    } catch (e) {
      showToast('Error al cargar producto', 'error');
      return;
    }
  } else {
    title.textContent = 'Nuevo Producto';
    form.con_stock.checked = true;
  }
  modal.classList.add('open');
};

window.closeProductModal = function() {
  document.getElementById('product-modal')?.classList.remove('open');
  editingId = null;
};

window.saveProduct = async function(e) {
  e.preventDefault();
  const form = e.target;
  const data = {
    nombre: form.nombre.value.trim(),
    descripcion: form.descripcion.value.trim(),
    precio: parseFloat(form.precio.value),
    stock: parseInt(form.stock.value) || 0,
    categoria: form.categoria.value,
    color: form.color.value.trim(),
    marca: form.marca.value.trim(),
    imagen_url: form.imagen_url.value.trim(),
    imagenes_extra: form.imagenes_extra.value.split(',').map(s => s.trim()).filter(Boolean),
    destacado: form.destacado.checked,
    novedad: form.novedad.checked,
    con_stock: form.con_stock.checked,
  };
  try {
    if (editingId) {
      await api.products.update(editingId, data);
      showToast('Producto actualizado');
    } else {
      await api.products.create(data);
      showToast('Producto creado');
    }
    window.closeProductModal();
    await loadProducts();
    await loadStats();
  } catch (e) {
    showToast(e.message || 'Error al guardar', 'error');
  }
};

window.deleteProduct = async function(id) {
  if (!confirm('¿Eliminar este producto? Esta acción no se puede deshacer.')) return;
  try {
    await api.products.delete(id);
    showToast('Producto eliminado');
    await loadProducts();
    await loadStats();
  } catch (e) {
    showToast(e.message || 'Error al eliminar', 'error');
  }
};

window.toggleDestacado = async function(id, current) {
  try {
    await api.products.partialUpdate(id, { destacado: !current });
    await loadProducts();
    await loadStats();
  } catch (e) {
    showToast('Error al actualizar', 'error');
  }
};

function setupSearch() {
  const input = document.getElementById('admin-search');
  if (!input) return;
  input.addEventListener('input', () => {
    const q = input.value.toLowerCase();
    filteredProducts = allProducts.filter(p =>
      p.nombre.toLowerCase().includes(q) ||
      (p.marca || '').toLowerCase().includes(q) ||
      (p.categoria || '').toLowerCase().includes(q)
    );
    renderTable();
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadStats();
  await loadProducts();
  setupSearch();
  document.getElementById('product-form')?.addEventListener('submit', window.saveProduct);
});
