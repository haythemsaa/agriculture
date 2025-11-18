import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileStackParamList } from './types';

// Screens
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import LoyaltyScreen from '../screens/profile/LoyaltyScreen';
import ReferralScreen from '../screens/profile/ReferralScreen';
import SubscriptionsScreen from '../screens/profile/SubscriptionsScreen';
import GamificationScreen from '../screens/profile/GamificationScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import VendorDashboardScreen from '../screens/profile/VendorDashboardScreen';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

const ProfileStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#ffffff',
        },
        headerTintColor: '#111827',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{ title: 'Mon profil' }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: 'Modifier le profil' }}
      />
      <Stack.Screen
        name="Loyalty"
        component={LoyaltyScreen}
        options={{ title: 'Programme de fidélité' }}
      />
      <Stack.Screen
        name="Referral"
        component={ReferralScreen}
        options={{ title: 'Parrainage' }}
      />
      <Stack.Screen
        name="Subscriptions"
        component={SubscriptionsScreen}
        options={{ title: 'Mes abonnements' }}
      />
      <Stack.Screen
        name="Gamification"
        component={GamificationScreen}
        options={{ title: 'Badges & Défis' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Paramètres' }}
      />
      <Stack.Screen
        name="VendorDashboard"
        component={VendorDashboardScreen}
        options={{ title: 'Tableau de bord vendeur' }}
      />
    </Stack.Navigator>
  );
};

export default ProfileStack;
