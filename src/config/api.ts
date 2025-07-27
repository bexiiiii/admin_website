export const BASE_URL = 'https://foodsave.kz/api';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
  },
  USERS: {
    BASE: '/users',
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/api/users/profile/update',
    CHANGE_PASSWORD: '/api/users/change-password',
    FORGOT_PASSWORD: '/api/users/forgot-password',
    RESET_PASSWORD: '/api/users/reset-password',
  },
  STORES: {
    BASE: '/stores',
    ACTIVE: '/stores/active',
    MY_STORE: '/api/stores/my-store',
    PRODUCTS: '/api/stores/products',
    ANALYTICS: '/api/stores/analytics',
  },
  PRODUCTS: {
    BASE: '/products',
    CATEGORIES: '/api/products/categories',
    FEATURED: '/api/products/featured',
    STORE_PRODUCTS: '/api/products/store',
    SEARCH: '/api/products/search',
  },
  ORDERS: {
    BASE: '/orders',
    MY_ORDERS: '/api/orders/my-orders',
    STORE_ORDERS: '/api/orders/store-orders',
    UPDATE_STATUS: '/api/orders',
  },
  CART: {
    BASE: '/cart',
    ADD_ITEM: '/cart/items',
    UPDATE_ITEM: '/cart/items',
    REMOVE_ITEM: '/cart/items',
    CLEAR: '/cart',
  },
  DISCOUNTS: {
    BASE: '/discounts',
    APPLY: '/api/discounts/apply',
    VALIDATE: '/api/discounts/validate',
  },
  REVIEWS: {
    BASE: '/api/reviews',
    PRODUCT_REVIEWS: '/api/reviews/product',
  },
  NOTIFICATIONS: {
    BASE: '/notifications',
    MARK_READ: '/notifications/mark-read',
    MARK_ALL_READ: '/notifications/mark-all-read',
    UNREAD_COUNT: '/api/notifications/unread-count',
  },
  ANALYTICS: {
    BASE: '/analytics',
    DASHBOARD: '/analytics/dashboard',
    STORE_SALES: '/api/analytics/store/sales',
    STORE_PRODUCTS: '/api/analytics/store/products',
    STORE_DISCOUNTS: '/api/analytics/store/discounts',
    STORE_USERS: '/api/analytics/store/users',
  },
  SEARCH: {
    BASE: '/api/search',
  },
  HEALTH: {
    BASE: '/api/health',
  },
};

export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

export const getAuthHeaders = (token: string) => ({
  ...DEFAULT_HEADERS,
  'Authorization': `Bearer ${token}`,
}); 