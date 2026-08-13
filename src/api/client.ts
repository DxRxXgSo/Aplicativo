import axios from 'axios';

const API_URL = import.meta.env.VITE_CATALOG_API_URL || 'https://catalog-production-3284.up.railway.app';
const BASKET_API_URL = import.meta.env.VITE_BASKET_API_URL || 'https://basket-production-fd53.up.railway.app';
const ORDERS_API_URL = import.meta.env.VITE_ORDERS_API_URL || 'http://localhost:8083';

export const catalogClient = axios.create({ baseURL: `${API_URL}/api` });
export const basketClient = axios.create({ baseURL: `${BASKET_API_URL}/api` });
export const ordersClient = axios.create({ baseURL: `${ORDERS_API_URL}/api` });