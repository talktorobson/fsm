/**
 * Yellow Grid Mobile - Main Navigator
 * Bottom tab navigation with Home, Orders, Agenda, Profile
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

// Screens
import HomeScreen from '../screens/home/HomeScreen';
import OrdersListScreen from '../screens/orders/OrdersListScreen';
import ServiceOrderDetailScreen from '../screens/orders/ServiceOrderDetailScreen';
import AgendaScreen from '../screens/agenda/AgendaScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import ChatScreen from '../screens/chat/ChatScreen';

// Types
export type OrdersStackParamList = {
  OrdersList: undefined;
  ServiceOrderDetail: { orderId: string };
  Chat: { orderId: string; orderNumber?: string };
  CheckIn: { orderId: string };
  CheckOut: { orderId: string };
  WCF: { orderId: string };
  Checklist: { orderId: string; checklistId: string };
};

export type MainTabParamList = {
  Home: undefined;
  Orders: undefined;
  Agenda: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const OrdersStack = createNativeStackNavigator<OrdersStackParamList>();

// Orders Stack Navigator
const OrdersNavigator = () => {
  return (
    <OrdersStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <OrdersStack.Screen name="OrdersList" component={OrdersListScreen} />
      <OrdersStack.Screen name="ServiceOrderDetail" component={ServiceOrderDetailScreen} />
      <OrdersStack.Screen name="Chat" component={ChatScreen} />
    </OrdersStack.Navigator>
  );
};

export const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Orders') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Agenda') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary[600],
        tabBarInactiveTintColor: colors.gray[400],
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.gray[100],
          paddingTop: 4,
          height: 88,
          paddingBottom: 28,
        },
        tabBarLabelStyle: {
          fontSize: typography.fontSize.xs,
          fontWeight: typography.fontWeight.medium as '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersNavigator}
        options={{ title: 'My Orders' }}
      />
      <Tab.Screen
        name="Agenda"
        component={AgendaScreen}
        options={{ title: 'Agenda' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};
