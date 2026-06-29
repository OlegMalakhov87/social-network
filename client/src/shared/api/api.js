import { apiAxios } from '..';

export const api = {
  get: apiAxios.get.bind(apiAxios),
  post: apiAxios.post.bind(apiAxios),
  put: apiAxios.put.bind(apiAxios),
  patch: apiAxios.patch.bind(apiAxios),
  delete: apiAxios.delete.bind(apiAxios),
};
