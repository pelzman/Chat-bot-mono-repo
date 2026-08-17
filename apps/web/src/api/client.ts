import axios from 'axios';

export const apiClient = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export const loginUser = async (data: any) => {
  const response = await apiClient.post('/auth/login', data);
  return response.data;
};

export const registerUser = async (data: any) => {
  const response = await apiClient.post('/auth/register', data);
  return response.data;
};

export const logoutUser = async () => {
  const response = await apiClient.post('/auth/logout');
  return response.data;
};

export const getMe = async () => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};

export const sendMessage = async (data: {userId:string, content:string, conversationId?:string}) => {
  const response = await apiClient.post('/chat/sendMessage', data);
  return response.data;
};
