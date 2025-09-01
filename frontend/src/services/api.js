import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Token ${token}`
  }
  return config
})

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  register: (userData) => api.post('/auth/register/', userData),
  logout: () => api.post('/auth/logout/'),
  getProfile: () => api.get('/auth/profile/'),
  changePassword: (data) => api.post('/auth/change-password/', data),
  updateProfile: (data) => api.put('/auth/profile/update/', data),
}

// Startups API
export const startupsAPI = {
  list: (params) => api.get('/startups/', { params }),
  detail: (id) => api.get(`/startups/${id}/`),
  create: (data) => api.post('/startups/create/', data),
  update: (id, data) => api.put(`/startups/${id}/update/`, data),
  delete: (id) => api.delete(`/startups/${id}/delete/`),
  userStartups: () => api.get('/startups/my/'),
  createReview: (startupId, data) => api.post(`/startups/${startupId}/reviews/`, data),
  stats: () => api.get('/startups/stats/'),
}

// Investors API
export const investorsAPI = {
  list: (params) => api.get('/investors/', { params }),
  detail: (id) => api.get(`/investors/${id}/`),
  create: (data) => api.post('/investors/create/', data),
  update: (id, data) => api.put(`/investors/${id}/update/`, data),
  delete: (id) => api.delete(`/investors/${id}/delete/`),
  userInvestors: () => api.get('/investors/my/'),
  createReview: (investorId, data) => api.post(`/investors/${investorId}/reviews/`, data),
  stats: () => api.get('/investors/stats/'),
}

// Messaging API
export const messagingAPI = {
  conversations: () => api.get('/messaging/conversations/'),
  conversationDetail: (id) => api.get(`/messaging/conversations/${id}/`),
  createConversation: (data) => api.post('/messaging/conversations/create/', data),
  messages: (conversationId) => api.get(`/messaging/conversations/${conversationId}/messages/`),
  sendMessage: (conversationId, data) => api.post(`/messaging/conversations/${conversationId}/send/`, data),
  unreadCount: () => api.get('/messaging/unread-count/'),
  deleteConversation: (id) => api.post(`/messaging/conversations/${id}/delete/`),
}

// Payments API
export const paymentsAPI = {
  plans: (params) => api.get('/payments/plans/', { params }),
  createPayment: (data) => api.post('/payments/create/', data),
  history: () => api.get('/payments/history/'),
  subscription: () => api.get('/payments/subscription/'),
  cancelSubscription: () => api.post('/payments/subscription/cancel/'),
  checkFeatures: () => api.get('/payments/subscription/features/'),
}

// Moderation API
export const moderationAPI = {
  createReport: (data) => api.post('/moderation/reports/create/', data),
  reports: () => api.get('/moderation/reports/'),
  resolveReport: (id, data) => api.post(`/moderation/reports/${id}/resolve/`, data),
  createVerification: (data) => api.post('/moderation/verifications/create/', data),
  verifications: () => api.get('/moderation/verifications/'),
  processVerification: (id, data) => api.post(`/moderation/verifications/${id}/process/`, data),
  bans: () => api.get('/moderation/bans/'),
  unbanUser: (id) => api.post(`/moderation/bans/${id}/unban/`),
  stats: () => api.get('/moderation/stats/'),
}

// Industries API
export const industriesAPI = {
  list: () => api.get('/industries/'),
}

// Utility API
export const utilityAPI = {
  onlineCount: () => api.get('/auth/online-count/'),
  onlineStatus: (userId) => api.get(`/auth/online-status/?user_id=${userId}`),
}

export default api