import axios from 'axios';

const API_URL = 'http://localhost:3000/auth'; // Путь к вашему backend серверу

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  avatar?: File;
}

export const authLogin = async (data: LoginDto) => {
  return await axios.post(`${API_URL}/login`, data);
};

export const authRegister = (data: RegisterDto) => {
  const formData = new FormData();
  formData.append('email', data.email);
  formData.append('password', data.password);
  formData.append('firstName', data.firstName);
  formData.append('lastName', data.lastName);
  formData.append('phone', data.phone);
  if (data.avatar) {
    formData.append('avatar', data.avatar);
  }
  return axios.post(`${API_URL}/register`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
