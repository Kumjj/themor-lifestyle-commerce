import { api } from './api';

const resource = path => ({
  getAll: () => api(path),
  getById: id => api(`${path}/${encodeURIComponent(id)}`),
  create: body => api(path, { method: 'POST', body }),
  update: (id, body) => api(`${path}/${encodeURIComponent(id)}`, { method: 'PATCH', body }),
  delete: id => api(`${path}/${encodeURIComponent(id)}`, { method: 'DELETE' }),
});

// Every catalogue/order/request write now goes through the MySQL-backed API.
export const productService = resource('/products');
export const bannerService = resource('/banners');
export const noticeService = resource('/notices');
export const orderService = resource('/orders');
export const requestService = {
  ...resource('/requests'),
  updateStatus: (id, status, adminNote = '') => api(`/requests/${encodeURIComponent(id)}`, { method: 'PATCH', body: { status, adminNote } }),
};
