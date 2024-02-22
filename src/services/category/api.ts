import globalAxios from '@/axios/index';
// @ts-ignore
import store from 'store';

const token = store.get('accessToken');

export async function getCategories(query?: any, params?: any, options?: any) {
  return await globalAxios.get(`/categories`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    params: { ...params, ...query },
    skipErrorHandler: true,
    ...(options || {}),
  });
}

export async function addCategory(body: any, options: any) {
  return await globalAxios.post(`/categories`, body, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    skipErrorHandler: true,
    ...(options || {}),
  });
}

export async function getCategoryById(id: number) {
  return await globalAxios.get(`/categories/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function updateCategory(body: any, options: any) {
  return await globalAxios.put(`/categories/${body?.id}`, body, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    skipErrorHandler: true,
    ...(options || {}),
  });
}

export async function deleteCategory(id: any, options: any) {
  return await globalAxios.delete(`/categories/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    skipErrorHandler: true,
    ...(options || {}),
  });
}
