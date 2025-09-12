
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin' | 'officer' | 'driver';
  avatar?: string;
  phone?: string;
  address?: string;
  dob?: string;
  gender?: string;
  city?: string;
  state?: string;
  zip?: string;
  photoUrl?: string;
  preferences: UserPreferences;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
  points: number;
  level: number;
  driverVerified?: boolean;
  twoFAEnabled?: boolean;
  /**
   * Whether the user is blocked (admin action).
   */
  blocked?: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: NotificationPreferences;
  accessibility: AccessibilityPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  busUpdates: boolean;
  rewards: boolean;
  lostFound: boolean;
}

export interface AccessibilityPreferences {
  highContrast: boolean;
  largeText: boolean;
  reduceMotion: boolean;
  screenReader: boolean;
}

// Bus and Route Types

export interface Route {
  id?: string;
  route_name: string;
  start_latitude: number;
  start_longitude: number;
  end_latitude: number;
  end_longitude: number;
  stops?: string[];
  total_distance_km?: number;
  speed_limit: number; // Required, for ETA fallback
}
export interface Bus {
  id: string;
  number: string;
  route: string;
  routeIds: string[]; // Multiple routes per bus
  speed: number;
  currentLocation: Location;
  capacity: number;
  currentOccupancy: number;
  status: 'active' | 'inactive' | 'maintenance' | 'delayed';
  driver: Driver;
  amenities: string[];
  lastUpdated: string;
  estimatedArrival: string[];
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  rating: number;
  experience: number;
}

export interface BusStop {
  id: string;
  name: string;
  location: Location;
  routes: string[];
  amenities: string[];
  estimatedArrivals: EstimatedArrival[];
}

export interface EstimatedArrival {
  busId: string;
  busNumber: string;
  route: string;
  estimatedTime: string;
  delay?: number;
}

// Feedback Types
export interface Feedback {
  id: string;
  userId: string;
  type: 'complaint' | 'suggestion' | 'compliment' | 'accessibility' | 'safety';
  subject: string;
  message: string;
  busId?: string;
  routeId?: string;
  stopId?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  attachments: string[];
  createdAt: string;
  updatedAt: string;
  adminNotes?: string;
  resolution?: string;
}

export interface ETAResponse {
  eta_minutes: number | null;
  distance_km: number | null;
  used_speed?: number; // Speed used for ETA calculation
}

// Lost & Found Types
export interface LostFoundItem {
  id: string;
  reporterId: string;
  type: 'lost' | 'found';
  category: string;
  itemName: string;
  description: string;
  color?: string;
  brand?: string;
  busId?: string;
  routeId?: string;
  stopId?: string;
  dateReported: string;
  dateFound?: string;
  location: string;
  status: 'open' | 'matched' | 'returned' | 'closed';
  images: string[];
  contactInfo: ContactInfo;
  matchedItemId?: string;
}

export interface ContactInfo {
  preferredMethod: 'email' | 'phone' | 'both';
  email?: string;
  phone?: string;
  anonymous: boolean;
}

// Rewards Types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  category: 'travel' | 'feedback' | 'community' | 'sustainability' | 'loyalty';
  requirements: AchievementRequirement[];
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface AchievementRequirement {
  type: string;
  value: number;
  description: string;
}

export interface UserAchievement {
  userId: string;
  achievementId: string;
  unlockedAt: string;
  progress: number;
  isCompleted: boolean;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  cost: number;
  category: 'discount' | 'free_ride' | 'merchandise' | 'priority' | 'exclusive';
  imageUrl?: string;
  validUntil?: string;
  isActive: boolean;
  stock?: number;
  termsAndConditions: string[];
}

export interface UserReward {
  id: string;
  userId: string;
  rewardId: string;
  redeemedAt: string;
  usedAt?: string;
  expiresAt?: string;
  status: 'active' | 'used' | 'expired';
  redemptionCode: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type:
    | 'info'
    | 'warning'
    | 'success'
    | 'error'
    | 'achievement'
    | 'reward'
    | 'sos'
    | 'incident'
    | 'admin-action'
    | 'system'
    | 'bus-update'
    | 'reminder';
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
  actions?: Array<{
    text: string;
    url?: string;
    onClickType?: 'markAsRead' | 'openUrl' | 'custom';
    payload?: any;
  }>;
  isRead: boolean;
  createdAt: string;
  expiresAt?: string;
  metadata?: Record<string, any>;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  icon?: string;
  senderType?: 'system' | 'admin' | 'user' | 'driver' | 'officer';
}

// Admin Types
export interface AdminAnalytics {
  totalUsers: number;
  activeUsers: number;
  totalBuses: number;
  activeBuses: number;
  totalFeedback: number;
  resolvedFeedback: number;
  totalLostFound: number;
  matchedItems: number;
  userGrowth: GrowthData[];
  feedbackTrends: TrendData[];
  busUtilization: UtilizationData[];
  popularRoutes: PopularRoute[];
}

export interface GrowthData {
  date: string;
  users: number;
  newUsers: number;
}

export interface TrendData {
  date: string;
  complaints: number;
  suggestions: number;
  compliments: number;
}

export interface UtilizationData {
  busId: string;
  busNumber: string;
  utilization: number;
  totalTrips: number;
}

export interface PopularRoute {
  routeId: string;
  routeName: string;
  ridership: number;
  growth: number;
}

// SOS and Incident Report Types
export interface SOSReport {
  id: string;
  user_id: string;
  message?: string;
  latitude?: number;
  longitude?: number;
  timestamp: string;
  status?: string;
}

export interface IncidentReport {
  id: string;
  user_id: string;
  type: string;
  description: string;
  latitude?: number;
  longitude?: number;
  timestamp: string;
  status?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  agreeToTerms: boolean;
}

export interface FeedbackForm {
  type: Feedback['type'];
  subject: string;
  message: string;
  busId?: string;
  routeId?: string;
  stopId?: string;
  priority: Feedback['priority'];
  attachments: File[];
}

export interface LostFoundForm {
  type: LostFoundItem['type'];
  category: string;
  itemName: string;
  description: string;
  color?: string;
  brand?: string;
  busId?: string;
  routeId?: string;
  stopId?: string;
  location: string;
  images: File[];
  contactInfo: ContactInfo;
}

// Filter and Search Types
export interface FilterOptions {
  dateRange?: DateRange;
  status?: string[];
  type?: string[];
  priority?: string[];
  route?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DateRange {
  start: string;
  end: string;
}

export interface SearchFilters {
  query?: string;
  filters: FilterOptions;
  pagination: {
    page: number;
    limit: number;
  };
}