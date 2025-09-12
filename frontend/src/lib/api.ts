// Timetable API
export const timetableAPI = {
  /**
   * Upload timetable PDF (admin only). Always uploads as bus_timetable.pdf.
   * @param file File object (PDF)
   */
  uploadTimetable: async (file: File): Promise<any> => {
    const formData = new FormData();
    // The backend expects the file field to be named 'file'
    formData.append('file', file, 'bus_timetable.pdf');
    const response = await api.post('/timetable/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Get timetable PDF download/view URL. Returns the backend endpoint URL for the PDF.
   * You can use this URL in an <a> or <iframe>.
   */
  getTimetableUrl: (): string => {
    // This returns the backend endpoint, which redirects to Firebase Storage
    return `${api.defaults.baseURL}/timetable/bus_timetable.pdf`;
  },
};
/**
 * Reverse Geocode API (calls backend proxy)
 */
export const reverseGeocodeAPI = {
  /**
   * Get address for given latitude and longitude.
   */
  getAddress: async (lat: number, lon: number) => {
    const res = await api.get(`/reverse-geocode?lat=${lat}&lon=${lon}`);
    return res.data;
  },
};

import axios from 'axios';
import { toast } from 'react-hot-toast';
import { User, Feedback, Notification, Reward, Achievement, AdminAnalytics, UserReward, UserAchievement } from '../types';
import { API_BASE_URL } from '../config';
import { MSG_SESSION_EXPIRED } from '../constants';
import { isTokenExpired, getCookie } from './utils';


// JWT utils moved to utils.ts


let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (isRefreshing && refreshPromise) return refreshPromise;
  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      // Read CSRF token from cookie
      const csrfToken = getCookie('csrf_token');
      const res = await axios.post(
        `${API_BASE_URL}/auth/refresh-token`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
          },
          withCredentials: true,
        }
      );
      const { access_token } = res.data;
      isRefreshing = false;
      refreshPromise = null;
      return access_token;
    } catch (err) {
      isRefreshing = false;
      refreshPromise = null;
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      const error = err as any;
      const msg = error.response?.data?.detail || error.response?.data?.message || error.message || MSG_SESSION_EXPIRED;
      toast.error(msg);
      return null;
    }
  })();
  return refreshPromise;
}


// API_BASE_URL moved to config.ts


// Axios instance with interceptors
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});



// Request interceptor: add token, refresh if expired
api.interceptors.request.use(async (config) => {
  let token = localStorage.getItem('access_token');
  if (token && isTokenExpired(token)) {
    token = await refreshAccessToken();
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});



// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const newToken = await refreshAccessToken();
      if (newToken) {
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return api(originalRequest);
      }
      // If refresh fails, handled in refreshAccessToken
    }
    return Promise.reject(error);
  }
);


export const userSettingsAPI = {
  sendDeleteAccountOtp: async (userId: string) => {
    const res = await api.post(`/users/${userId}/delete-account/send-otp`);
    return res.data;
  },
  saveSettings: async (userId: string, settings: any) => {
    const res = await api.post(`/users/${userId}/settings`, settings);
    return res.data;
  },
  loadSettings: async (userId: string) => {
    const res = await api.get(`/users/${userId}/settings`);
    return res.data;
  },
  saveProfile: async (userId: string, profile: { firstName: string; lastName: string; email: string; language: string }) => {
    const res = await api.patch(`/users/${userId}/profile`, profile);
    return res.data;
  },
  resetPassword: async (userId: string, currentPassword: string, newPassword: string) => {
    const res = await api.post(`/users/${userId}/reset-password`, { currentPassword, newPassword });
    return res.data;
  },
  // Toggle 2FA
  toggle2FA: async (userId: string, enabled: boolean) => {
    const res = await api.post(`/users/${userId}/2fa`, { enabled });
    return res.data;
  },
  // Update profile photo
  updateProfilePhoto: async (userId: string, photoUrl: string) => {
    const res = await api.patch(`/users/${userId}/profile-photo`, { photoUrl });
    return res.data;
  },
  // Update phone number
  updatePhone: async (userId: string, phone: string) => {
    const res = await api.patch(`/users/${userId}/phone`, { phone });
    return res.data;
  },
  // Update address/details
  updateDetails: async (userId: string, details: any) => {
    const res = await api.patch(`/users/${userId}/details`, details);
    return res.data;
  },
  // Update notification preferences
  updateNotificationPreferences: async (userId: string, prefs: any) => {
    const res = await api.patch(`/users/${userId}/notification-preferences`, prefs);
    return res.data;
  },
  // Get activity log
  getActivityLog: async (userId: string) => {
    const res = await api.get(`/users/${userId}/activity-log`);
    return res.data;
  },
  // Delete account (with OTPs)
  deleteAccount: async (userId: string, emailOtp: string, twofaOtp: string) => {
    const res = await api.post(`/users/${userId}/delete-account`, { emailOtp, twofaOtp });
    return res.data;
  },
};
// User SOS/Incident API
export const sosAPI = {
  sendSOS: async (data: { user_id: string; message?: string }) => {
    const res = await api.post('/sos', data);
    return res.data;
  },
  sendIncident: async (formData: FormData) => {
    const res = await api.post('/incident', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data;
  },
};
// User Dashboard Analytics API
export const userDashboardAnalyticsAPI = {
  getAnalytics: async () => {
    // Get user from localStorage (assumes user object is stored after login)
    const userStr = localStorage.getItem('user');
    if (!userStr) throw new Error('User not logged in');
    let user: any = null;
    try {
      user = JSON.parse(userStr);
    } catch {
      throw new Error('User not logged in');
    }
    const userId = user?.id;
    if (!userId) throw new Error('User not logged in');
    const res = await api.get(`/user-dashboard-analytics?user_id=${encodeURIComponent(userId)}`);
    return res.data;
  },
};
// Get all bus locations from realtime database
export const busLocationAPI = {
  getAllLocations: async () => {
    const res = await api.get('/bus-locations-realtime');
    return res.data;
  },
};


export const userAPI = {
  getDrivers: async (): Promise<User[]> => {
    const res = await api.get('/users');
    return (res.data || []).filter((u: any) => u.role === 'driver');
  },
};

export const routeAPI = {
  getRoutes: async (): Promise<any[]> => {
    const res = await api.get('/routes');
    return res.data;
  },
  addRoute: async (route: any): Promise<any> => {
    const res = await api.post('/routes', route);
    return res.data;
  },
  deleteRoute: async (routeId: string): Promise<any> => {
    const res = await api.delete(`/routes/${routeId}`);
    return res.data;
  },
  updateRoute: async (routeId: string, route: any): Promise<any> => {
    const res = await api.patch(`/routes/${routeId}`, route);
    return res.data;
  },
};


export const authAPI = {
  /**
   * Login user and return tokens and user info.
   */
  login: async (email: string, password: string): Promise<{ user: User; access_token: string; refresh_token: string }> => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error: any) {
      // Consistent error handling
      throw error;
    }
  },

  /**
   * Register a new user.
   */
  register: async (userData: any): Promise<{ user: User; access_token: string; refresh_token: string }> => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Send OTP for registration or password reset.
   */
  sendOtp: async (email: string, purpose: 'register' | 'forgot_password'): Promise<any> => {
    try {
      return await api.post('/auth/send-otp', { email, purpose });
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Verify OTP for registration or password reset.
   */
  verifyOtp: async (email: string, otp: string, purpose: 'register' | 'forgot_password'): Promise<any> => {
    try {
      return await api.post('/auth/verify-otp', { email, otp, purpose });
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Reset password using OTP.
   */
  resetPassword: async (email: string, otp: string, new_password: string): Promise<any> => {
    try {
      return await api.post('/auth/reset-password', { email, otp, new_password });
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Logout user and clear local storage.
   */
  logout: async (): Promise<void> => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  /**
   * Refresh JWT access token using refresh token cookie.
   */
  refreshToken: refreshAccessToken,
};

// Bus API
export const busAPI = {
  getBuses: async (): Promise<any[]> => {
    const res = await api.get('/buses');
    return res.data;
  },
  getBus: async (id: string): Promise<any> => {
    const res = await api.get(`/buses/${id}`);
    return res.data;
  },
  addBus: async (bus: any): Promise<any> => {
    const res = await api.post('/buses', bus);
    return res.data;
  },
  updateBus: async (id: string, bus: any): Promise<any> => {
    const res = await api.patch(`/buses/${id}`, bus);
    return res.data;
  },
  deleteBus: async (id: string): Promise<any> => {
    const res = await api.delete(`/buses/${id}`);
    return res.data;
  },
  assignDriver: async (busId: string, driverId: string): Promise<any> => {
    const res = await api.post(`/buses/${busId}/assign-driver`, null, { params: { driver_id: driverId } });
    return res.data;
  },
  assignRoute: async (busId: string, routeId: string): Promise<any> => {
    const res = await api.post(`/buses/${busId}/assign-route`, null, { params: { route_id: routeId } });
    return res.data;
  },
  assignRoutes: async (busId: string, routeIds: string[]): Promise<any> => {
    const res = await api.post(`/buses/${busId}/assign-routes`, { route_ids: routeIds });
    return res.data;
  },
  changeStatus: async (busId: string, status: string): Promise<any> => {
    const res = await api.post(`/buses/${busId}/change-status`, null, { params: { status } });
    return res.data;
  },
};

// Feedback API
import type { FeedbackForm } from '../types';

export const feedbackAPI = {
  submitFeedback: async (feedback: FeedbackForm) => {
    const response = await api.post('/feedback', feedback);
    return response.data;
  },

  getFeedback: async (userId?: string): Promise<Feedback[]> => {
    // If userId is provided, filter by user; else return all (admin)
    const response = await api.get('/feedback', userId ? { params: { user_id: userId } } : undefined);
    return response.data;
  },

  updateFeedbackStatus: async (id: string, status: string) => {
    const response = await api.patch(`/feedback/${id}/status`, { status });
    return response.data;
  },

  deleteFeedback: async (id: string) => {
    const response = await api.delete(`/feedback/${id}`);
    return response.data;
  },
};

// Lost & Found API
export const lostFoundAPI = {
  // Report a lost/found item (user)
  reportItem: async (item: Omit<import('../types').LostFoundItem, 'id' | 'dateReported'>): Promise<import('../types').LostFoundItem> => {
    const response = await api.post('/lostfound', item);
    return response.data;
  },

  // Get all lost/found items (admin)
  getItems: async (): Promise<import('../types').LostFoundItem[]> => {
    const response = await api.get('/lostfound');
    return response.data;
  },

  // Update item status (admin)
  updateItemStatus: async (id: string, status: 'open' | 'matched' | 'returned' | 'closed'): Promise<import('../types').LostFoundItem> => {
    const response = await api.patch(`/lostfound/${id}/status`, { status });
    return response.data;
  },

  // Delete item (admin)
  deleteItem: async (id: string): Promise<void> => {
    await api.delete(`/lostfound/${id}`);
  },
};

// Notifications API
export const notificationAPI = {
  // Fetch notifications from Firebase Realtime DB REST API (read-only, for fallback/testing)
  // For real-time, use useRealtimeNotifications hook
  getNotifications: async (userType: string, userId: string): Promise<Notification[]> => {
    // This is a fallback for SSR or admin tools; for UI, use the real-time hook
    const url = `${API_BASE_URL}/notifications/list`;
    const res = await api.post(url, { user_type: userType, user_id: userId });
    return res.data.notifications || [];
  },

  send: async (userType: string, userId: string, notification: Partial<Notification>) => {
    const url = `/notifications/send`;
    const res = await api.post(url, { user_type: userType, user_id: userId, notification });
    return res.data;
  },

  markAsRead: async (userType: string, userId: string, notificationId: string): Promise<void> => {
    const url = `/notifications/mark-read`;
    await api.post(url, { user_type: userType, user_id: userId, notification_id: notificationId });
  },

  markAllAsRead: async (userType: string, userId: string): Promise<void> => {
    const url = `/notifications/mark-all-read`;
    await api.post(url, { user_type: userType, user_id: userId });
  },

  // Delete a notification (new)
  deleteNotification: async (userType: string, userId: string, notificationId: string): Promise<void> => {
    // Adjust the endpoint as per your backend
    const url = `/notifications/delete`;
    await api.post(url, { user_type: userType, user_id: userId, notification_id: notificationId });
  },
};

// Rewards API
export const rewardsAPI = {
  getRewards: async (): Promise<Reward[]> => {
    const mockRewards: Reward[] = [
      {
        id: '1',
        name: 'Free Weekend Ride',
        description: 'Get one free ride on weekends',
        cost: 500,
        category: 'free_ride',
        imageUrl: 'https://images.pexels.com/photos/1036622/pexels-photo-1036622.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=2',
        validUntil: '2024-12-31T23:59:59Z',
        isActive: true,
        stock: 100,
        termsAndConditions: ['Valid for weekend rides only', 'Cannot be combined with other offers'],
      },
      {
        id: '2',
        name: '20% Discount Coupon',
        description: '20% off your next ride',
        cost: 200,
        category: 'discount',
        imageUrl: 'https://images.pexels.com/photos/3943725/pexels-photo-3943725.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=2',
        isActive: true,
        termsAndConditions: ['Valid for 30 days', 'One use per customer'],
      },
    ];

    await new Promise(resolve => setTimeout(resolve, 600));
    return mockRewards;
  },

  redeemReward: async (rewardId: string, userId: string): Promise<UserReward> => {
    const mockUserReward: UserReward = {
      id: Date.now().toString(),
      userId,
      rewardId,
      redeemedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      redemptionCode: 'REWARD' + Date.now().toString().slice(-6),
    };

    await new Promise(resolve => setTimeout(resolve, 1000));
    return mockUserReward;
  },

  getUserRewards: async (): Promise<UserReward[]> => {
    const mockUserRewards: UserReward[] = [];
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockUserRewards;
  },
};

// Achievements API
export const achievementsAPI = {
  getAchievements: async (): Promise<Achievement[]> => {
    const mockAchievements: Achievement[] = [
      {
        id: '1',
        name: 'Frequent Rider',
        description: 'Take 50 rides',
        icon: 'award',
        points: 100,
        category: 'travel',
        requirements: [{ type: 'rides', value: 50, description: 'Take 50 rides' }],
        rarity: 'common',
      },
      {
        id: '2',
        name: 'Feedback Champion',
        description: 'Submit 10 feedback reports',
        icon: 'message-circle',
        points: 200,
        category: 'feedback',
        requirements: [{ type: 'feedback', value: 10, description: 'Submit 10 feedback reports' }],
        rarity: 'rare',
      },
    ];

    await new Promise(resolve => setTimeout(resolve, 500));
    return mockAchievements;
  },

  getUserAchievements: async (userId: string): Promise<UserAchievement[]> => {
    const mockUserAchievements: UserAchievement[] = [
      {
        userId,
        achievementId: '1',
        unlockedAt: '2024-01-05T10:00:00Z',
        progress: 50,
        isCompleted: true,
      },
    ];

    await new Promise(resolve => setTimeout(resolve, 400));
    return mockUserAchievements;
  },
};

// Admin API
export const adminAPI = {
  getAnalytics: async (): Promise<AdminAnalytics> => {
    const response = await api.get('/analytics');
    return response.data;
  },

  getUsers: async (): Promise<User[]> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return [];
  },

  updateUserStatus: async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 600));
  },
};

// SOS and Incident Reports API
export const adminSOSAPI = {
  getSOSReports: async () => {
    const res = await api.get('/sos-reports');
    return res.data;
  },
  updateSOSReport: async (id: string, status: string) => {
    const res = await api.patch(`/sos-reports/${id}?status=${encodeURIComponent(status)}`);
    return res.data;
  },
  deleteSOSReport: async (id: string) => {
    const res = await api.delete(`/sos-reports/${id}`);
    return res.data;
  },
  getIncidentReports: async () => {
    const res = await api.get('/incident-reports');
    return res.data;
  },
  updateIncidentReport: async (id: string, status: string) => {
    const res = await api.patch(`/incident-reports/${id}?status=${encodeURIComponent(status)}`);
    return res.data;
  },
  deleteIncidentReport: async (id: string) => {
    const res = await api.delete(`/incident-reports/${id}`);
    return res.data;
  },
};

export default api;