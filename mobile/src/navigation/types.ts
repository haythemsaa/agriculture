/**
 * Navigation Types
 *
 * Définitions TypeScript pour la navigation
 */

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Categories: undefined;
  Cart: undefined;
  Orders: undefined;
  Profile: undefined;
};

export type HomeStackParamList = {
  HomeScreen: undefined;
  ProductDetails: { productId: number };
  Search: undefined;
  LiveShopping: undefined;
};

export type ProfileStackParamList = {
  ProfileScreen: undefined;
  EditProfile: undefined;
  Loyalty: undefined;
  Referral: undefined;
  Subscriptions: undefined;
  Gamification: undefined;
  Settings: undefined;
  VendorDashboard: undefined;
};

export type OrdersStackParamList = {
  OrdersList: undefined;
  OrderDetails: { orderId: string };
  OrderTracking: { orderId: string };
  BulkOrders: undefined;
  QuoteDetails: { quoteId: string };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
