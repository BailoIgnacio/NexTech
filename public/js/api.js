const BASE_URL = '/api';

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(err.error || 'Error en la solicitud');
  }
  if (response.status === 204) return null;
  return response.json();
}

const api = {
  products: {
    getAll(params = {}) {
      const qs = new URLSearchParams(
        Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
      ).toString();
      return request(`${BASE_URL}/products${qs ? '?' + qs : ''}`);
    },
    getById(id) {
      return request(`${BASE_URL}/products/${id}`);
    },
    create(data) {
      return request(`${BASE_URL}/products`, { method: 'POST', body: JSON.stringify(data) });
    },
    update(id, data) {
      return request(`${BASE_URL}/products/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    },
    partialUpdate(id, data) {
      return request(`${BASE_URL}/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
    },
    delete(id) {
      return request(`${BASE_URL}/products/${id}`, { method: 'DELETE' });
    },
  },
  stats: {
    get() {
      return request(`${BASE_URL}/stats`);
    },
  },
};

export default api;
