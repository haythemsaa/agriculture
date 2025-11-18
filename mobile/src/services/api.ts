import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * API Service - Centralized HTTP client
 *
 * Connects to Laravel backend API
 */

const API_BASE_URL = __DEV__
  ? 'http://localhost:8000/api'
  : 'https://api.agritech.tn/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, logout user
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user');
      // Navigate to login screen
      // This will be handled by navigation context
    }

    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  register: (data: any) =>
    api.post('/auth/register', data),

  logout: () =>
    api.post('/auth/logout'),

  me: () =>
    api.get('/auth/me'),
};

// Products endpoints
export const productsAPI = {
  getAll: (params?: any) =>
    api.get('/products', { params }),

  getById: (id: number) =>
    api.get(`/products/${id}`),

  search: (query: string, filters?: any) =>
    api.get('/products/search', { params: { q: query, ...filters } }),
};

// Cart endpoints
export const cartAPI = {
  get: () =>
    api.get('/cart'),

  add: (productId: number, quantity: number) =>
    api.post('/cart/add', { product_id: productId, quantity }),

  update: (itemId: number, quantity: number) =>
    api.put(`/cart/${itemId}`, { quantity }),

  remove: (itemId: number) =>
    api.delete(`/cart/${itemId}`),

  clear: () =>
    api.post('/cart/clear'),
};

// Orders endpoints
export const ordersAPI = {
  getAll: () =>
    api.get('/orders'),

  getById: (id: string) =>
    api.get(`/orders/${id}`),

  create: (data: any) =>
    api.post('/orders', data),

  track: (orderId: string) =>
    api.get(`/orders/${orderId}/track`),
};

// Reviews endpoints
export const reviewsAPI = {
  getForProduct: (productId: number, params?: any) =>
    api.get(`/products/${productId}/reviews`, { params }),

  submit: (productId: number, data: any) =>
    api.post(`/products/${productId}/reviews`, data),

  markHelpful: (reviewId: string, helpful: boolean) =>
    api.post(`/reviews/${reviewId}/helpful`, { helpful }),
};

// Gamification endpoints
export const gamificationAPI = {
  getBadges: () =>
    api.get('/gamification/badges'),

  getAchievements: () =>
    api.get('/gamification/achievements'),

  getChallenges: () =>
    api.get('/gamification/challenges'),

  getLeaderboard: (period: string) =>
    api.get('/gamification/leaderboard', { params: { period } }),

  getStats: () =>
    api.get('/gamification/stats'),

  claimChallenge: (challengeId: string) =>
    api.post(`/gamification/challenges/${challengeId}/claim`),
};

// Live Shopping endpoints
export const liveShoppingAPI = {
  getSessions: () =>
    api.get('/live-shopping/sessions'),

  joinSession: (sessionId: string) =>
    api.post(`/live-shopping/sessions/${sessionId}/join`),

  getAuctions: () =>
    api.get('/live-shopping/auctions'),

  placeBid: (auctionId: string, amount: number) =>
    api.post(`/live-shopping/auctions/${auctionId}/bid`, { amount }),

  buyoutAuction: (auctionId: string) =>
    api.post(`/live-shopping/auctions/${auctionId}/buyout`),

  getFlashDeals: () =>
    api.get('/live-shopping/flash-deals'),

  claimDeal: (dealId: string) =>
    api.post(`/live-shopping/flash-deals/${dealId}/claim`),

  sendMessage: (sessionId: string, message: string) =>
    api.post(`/live-shopping/sessions/${sessionId}/messages`, { message }),
};

// Blog endpoints
export const blogAPI = {
  getCategories: () =>
    api.get('/blog/categories'),

  getArticles: (params?: any) =>
    api.get('/blog/articles', { params }),

  getArticleBySlug: (slug: string) =>
    api.get(`/blog/articles/${slug}`),

  likeArticle: (articleId: string, like: boolean) =>
    api.post(`/blog/articles/${articleId}/like`, { like }),

  getComments: (articleId: string) =>
    api.get(`/blog/articles/${articleId}/comments`),

  createComment: (articleId: string, data: any) =>
    api.post(`/blog/articles/${articleId}/comments`, data),

  getStats: () =>
    api.get('/blog/stats'),
};

// Community Forum endpoints
export const forumAPI = {
  getCategories: () =>
    api.get('/forum/categories'),

  getPosts: (params?: any) =>
    api.get('/forum/posts', { params }),

  createPost: (data: any) =>
    api.post('/forum/posts', data),

  votePost: (postId: string, upvote: boolean) =>
    api.post(`/forum/posts/${postId}/vote`, { upvote }),

  getReplies: (postId: string) =>
    api.get(`/forum/posts/${postId}/replies`),

  createReply: (postId: string, data: any) =>
    api.post(`/forum/posts/${postId}/replies`, data),

  acceptAnswer: (replyId: string) =>
    api.post(`/forum/replies/${replyId}/accept`),

  getStats: () =>
    api.get('/forum/stats'),
};

// Coupons endpoints
export const couponsAPI = {
  getAvailable: () =>
    api.get('/coupons/available'),

  validate: (code: string, cartTotal: number, cartItems: any[]) =>
    api.post('/coupons/validate', {
      code: code.toUpperCase(),
      cart_total: cartTotal,
      cart_items: cartItems,
    }),

  getAutoApply: (cartTotal: number, cartItems: any[]) =>
    api.post('/coupons/auto-apply', {
      cart_total: cartTotal,
      cart_items: cartItems,
    }),
};

// Live Chat endpoints
export const chatAPI = {
  getConversations: () =>
    api.get('/chat/conversations'),

  createConversation: (type: 'seller' | 'support', participantId?: string, productId?: number) =>
    api.post('/chat/conversations', {
      type,
      participant_id: participantId,
      product_id: productId,
    }),

  getMessages: (conversationId: string) =>
    api.get(`/chat/conversations/${conversationId}/messages`),

  sendMessage: (data: any) =>
    api.post('/chat/messages', data),

  markAsRead: (conversationId: string) =>
    api.post(`/chat/conversations/${conversationId}/read`),

  closeConversation: (conversationId: string) =>
    api.post(`/chat/conversations/${conversationId}/close`),

  deleteConversation: (conversationId: string) =>
    api.delete(`/chat/conversations/${conversationId}`),
};

// Order Tracking endpoints (extending ordersAPI)
export const orderTrackingAPI = {
  getAll: (params?: any) =>
    api.get('/orders', { params }),

  getById: (orderId: string) =>
    api.get(`/orders/${orderId}`),

  trackByNumber: (trackingNumber: string) =>
    api.get(`/orders/track/${trackingNumber}`),

  getGPSLocation: (orderId: string) =>
    api.get(`/orders/${orderId}/gps`),

  cancel: (orderId: string, reason: string) =>
    api.post(`/orders/${orderId}/cancel`, { reason }),

  confirmDelivery: (orderId: string) =>
    api.post(`/orders/${orderId}/confirm-delivery`),

  getDeliveryPhoto: (orderId: string) =>
    api.get(`/orders/${orderId}/delivery-photo`),
};

// Loyalty Program endpoints
export const loyaltyAPI = {
  getAccount: () =>
    api.get('/loyalty/account'),

  getTransactions: (params?: any) =>
    api.get('/loyalty/transactions', { params }),

  getRewards: (params?: any) =>
    api.get('/loyalty/rewards', { params }),

  redeemReward: (rewardId: string) =>
    api.post(`/loyalty/rewards/${rewardId}/redeem`),
};

export default api;
