import globalAxios from '@/axios/index';
// @ts-ignore
import store from 'store';

const token = store.get('accessToken');

export async function getProducts(query?: any, params?: any, options?: any) {
  return await globalAxios.get(`/products`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    params: { ...params, ...query },
    skipErrorHandler: true,
    ...(options || {}),
  });
}

export async function addProduct(body: any, options: any) {
  return await globalAxios.post(`/products`, body, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    skipErrorHandler: true,
    ...(options || {}),
  });
}

export async function getProductById(id: number) {
  return await globalAxios.get(`/products/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function updateProduct(body: any, options: any) {
  return await globalAxios.put(`/products/${body?.id}`, body, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    skipErrorHandler: true,
    ...(options || {}),
  });
}

export async function deleteProduct(id: any, options: any) {
  return await globalAxios.delete(`/products/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    skipErrorHandler: true,
    ...(options || {}),
  });
}
