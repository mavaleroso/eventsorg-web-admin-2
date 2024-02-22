import globalAxios from '@/axios/index';
// @ts-ignore
import store from 'store';

export async function getProducts(query?: any, params?: any, options?: any) {
  const token = store.get('accessToken');

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
