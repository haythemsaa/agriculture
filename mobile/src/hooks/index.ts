/**
 * AgriTech Tunisia Mobile - Hooks Index
 *
 * Export centralisé de tous les hooks React Native
 * 13 fonctionnalités professionnelles marketplace
 */

// v1.7.0 - Professional Marketplace Features
export { useReviews } from './useReviews';
export { useCoupons } from './useCoupons';
export { useLiveChat } from './useLiveChat';
export { useOrderTracking } from './useOrderTracking';
export { useLoyaltyProgram } from './useLoyaltyProgram';

// v1.8.0 - B2B & Retention Features
export { useReferralProgram } from './useReferralProgram';
export { useBulkOrdering } from './useBulkOrdering';
export { useSubscriptions } from './useSubscriptions';
export { useVendorDashboard } from './useVendorDashboard';

// v1.9.0 - Gamification & Community Features
export { useGamification } from './useGamification';
export { useLiveShopping } from './useLiveShopping';
export { useBlog } from './useBlog';
export { useCommunityForum } from './useCommunityForum';

// Types exports
export type {
  // Reviews
  Review,
  ReviewStats,
  ReviewSortBy,
  ReviewFilterBy,
  ReviewFormData
} from './useReviews';

export type {
  // Coupons
  Coupon,
  AppliedCoupon
} from './useCoupons';

export type {
  // Live Chat
  ChatMessage,
  Conversation
} from './useLiveChat';

export type {
  // Order Tracking
  Order,
  OrderStatus,
  DeliveryUpdate
} from './useOrderTracking';

export type {
  // Loyalty Program
  LoyaltyAccount,
  PointsTransaction,
  Reward,
  MemberTier,
  TierBenefits
} from './useLoyaltyProgram';

export type {
  // Referral Program
  ReferralCode,
  Referral,
  ReferralReward,
  ReferralStats,
  ReferralStatus,
  ReferralTier,
  ReferralTierConfig
} from './useReferralProgram';

export type {
  // Bulk Ordering
  QuoteRequest,
  BulkOrderItem,
  RecurringOrder,
  QuoteStatus,
  VolumeDiscount,
  BulkOrderStats
} from './useBulkOrdering';

export type {
  // Subscriptions
  Subscription,
  SubscriptionProduct,
  SubscriptionDelivery,
  SubscriptionStatus,
  SubscriptionFrequency,
  SubscriptionTier,
  SubscriptionPlan,
  SubscriptionStats
} from './useSubscriptions';

export type {
  // Vendor Dashboard
  VendorMetrics,
  SalesData,
  ProductPerformance,
  CustomerInsight,
  InventoryAlert,
  OrderAnalytics,
  RevenueBreakdown,
  GeographicData,
  TimePeriod,
  TrendDirection
} from './useVendorDashboard';

export type {
  // Gamification
  Badge,
  Achievement,
  Challenge,
  LeaderboardEntry,
  GamificationStats
} from './useGamification';

export type {
  // Live Shopping
  LiveSession,
  LiveProduct,
  Auction,
  FlashDeal,
  Bid,
  LiveChat
} from './useLiveShopping';

export type {
  // Blog
  BlogArticle,
  BlogCategory,
  BlogComment,
  BlogStats,
  ArticleType
} from './useBlog';

export type {
  // Community Forum
  ForumPost,
  ForumCategory,
  ForumReply,
  ForumStats,
  PostType,
  PostStatus
} from './useCommunityForum';
