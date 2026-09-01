import axios from 'axios';

// Cria uma instância centralizada do Axios
export const api = axios.create({
  baseURL: 'http://localhost:3333/api',
  timeout: 10000,
});