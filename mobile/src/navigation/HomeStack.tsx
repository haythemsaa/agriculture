import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeStackParamList } from './types';

// Screens
import HomeScreen from '../screens/home/HomeScreen';
import ProductDetailsScreen from '../screens/home/ProductDetailsScreen';
import SearchScreen from '../screens/home/SearchScreen';
import LiveShoppingScreen from '../screens/home/LiveShoppingScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

const HomeStack = () => {
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
        name="HomeScreen"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProductDetails"
        component={ProductDetailsScreen}
        options={{ title: 'Détails du produit' }}
      />
      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={{ title: 'Rechercher' }}
      />
      <Stack.Screen
        name="LiveShopping"
        component={LiveShoppingScreen}
        options={{ title: 'Shopping Live' }}
      />
    </Stack.Navigator>
  );
};

export default HomeStack;
