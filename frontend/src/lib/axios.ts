import axios from 'axios';

const api = axios.create({
  baseURL:
    import.meta.env.MODE === 'development'
      ? 'http://localhost:5001/api'
      : '/api',
  withCredentials: true, //Without this, Cookie cannot send on server. User will logout regularly
});

export default api;
