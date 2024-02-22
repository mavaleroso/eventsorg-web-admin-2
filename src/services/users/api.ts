import globalAxios from '@/axios/index';
// @ts-ignore
import store from 'store';

const token = store.get('accessToken');

export async function getUsers(query?: any, params?: any, options?: any) {
  return await globalAxios.get(`/members`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    params: { ...params, ...query },
    skipErrorHandler: true,
    ...(options || {}),
  });
}

export async function getUserById(id: number) {
  return await globalAxios.get(`/users/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function addUser(body: any, options: any) {
  return await globalAxios.post(`/users`, body, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    skipErrorHandler: true,
    ...(options || {}),
  });
}

export async function updateUser(body: any, options: any) {
  return await globalAxios.put(`/users/${body?.id}`, body, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    skipErrorHandler: true,
    ...(options || {}),
  });
}

export async function deleteCustomer(id: any, options: any) {
  return await globalAxios.delete(`/users/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    skipErrorHandler: true,
    ...(options || {}),
  });
}
