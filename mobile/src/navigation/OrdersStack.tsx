import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OrdersStackParamList } from './types';

// Screens
import OrdersListScreen from '../screens/orders/OrdersListScreen';
import OrderDetailsScreen from '../screens/orders/OrderDetailsScreen';
import OrderTrackingScreen from '../screens/orders/OrderTrackingScreen';
import BulkOrdersScreen from '../screens/orders/BulkOrdersScreen';
import QuoteDetailsScreen from '../screens/orders/QuoteDetailsScreen';

const Stack = createNativeStackNavigator<OrdersStackParamList>();

const OrdersStack = () => {
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
        name="OrdersList"
        component={OrdersListScreen}
        options={{ title: 'Mes commandes' }}
      />
      <Stack.Screen
        name="OrderDetails"
        component={OrderDetailsScreen}
        options={{ title: 'Détails commande' }}
      />
      <Stack.Screen
        name="OrderTracking"
        component={OrderTrackingScreen}
        options={{ title: 'Suivi de livraison' }}
      />
      <Stack.Screen
        name="BulkOrders"
        component={BulkOrdersScreen}
        options={{ title: 'Commandes B2B' }}
      />
      <Stack.Screen
        name="QuoteDetails"
        component={QuoteDetailsScreen}
        options={{ title: 'Détails du devis' }}
      />
    </Stack.Navigator>
  );
};

export default OrdersStack;
