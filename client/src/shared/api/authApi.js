import { apiAxios } from './apiAxiosClient';

export const registerUser = async (formData) => {
  const response = await apiAxios.post('/auth/register', formData);
  return response.data; // { user, token }
};

export const loginUser = async (credentials) => {
  const response = await apiAxios.post('/auth/login', credentials);
  return response.data; // { user, token }
};
