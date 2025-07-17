import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (username: string, email: string, password: string) =>
    api.post('/auth/register', { username, email, password }),
  me: (token: string) =>
    api.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } }),
};

export const recipeAPI = {
  getPublicRecipes: (page = 1, limit = 12) =>
    api.get(`/recipes/public?page=${page}&limit=${limit}`),
  getMyRecipes: () =>
    api.get('/recipes/my'),
  getRecipe: (id: string) =>
    api.get(`/recipes/${id}`),
  createRecipe: (recipeData: any) =>
    api.post('/recipes', recipeData),
  updateRecipe: (id: string, recipeData: any) =>
    api.put(`/recipes/${id}`, recipeData),
  deleteRecipe: (id: string) =>
    api.delete(`/recipes/${id}`),
  searchRecipes: (query: string, page = 1, limit = 12) =>
    api.get(`/recipes/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`),
  likeRecipe: (id: string) =>
    api.post(`/recipes/${id}/like`),
  addComment: (id: string, comment: string) =>
    api.post(`/recipes/${id}/comments`, { text: comment }),
};

export const userAPI = {
  getProfile: () =>
    api.get('/users/profile'),
  getUserById: (id: string) =>
    api.get(`/users/${id}`),
};

export default api;