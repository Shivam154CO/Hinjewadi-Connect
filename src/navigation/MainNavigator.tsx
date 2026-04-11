import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../types';
import { COLORS } from '../theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import HomeScreen from '../screens/main/HomeScreen';
import { RoomsScreen } from '../screens/main/RoomsScreen';
import { JobsScreen } from '../screens/main/JobsScreen';
import { ServicesScreen } from '../screens/main/ServicesScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { InboxScreen } from '../screens/main/InboxScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.textSecondary,
                tabBarIcon: ({ color, size }) => {
                    const icons = {
                        Home: 'home',
                        Rooms: 'home-outline',
                        Jobs: 'briefcase',
                        Services: 'account-group',
                        Inbox: 'chat-outline',
                        Profile: 'account'
                    };
                    const iconName = icons[route.name as keyof typeof icons] || 'alert-circle';
                    return <MaterialCommunityIcons name={iconName as any} size={size} color={color} />;
                },
                tabBarStyle: {
                    backgroundColor: '#FFFFFF',
                    borderTopWidth: 1,
                    borderTopColor: '#F3F4F6',
                    height: 64,
                    paddingBottom: 8,
                    paddingTop: 6,
                    elevation: 8,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                }
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
            <Tab.Screen name="Rooms" component={RoomsScreen} options={{ tabBarLabel: 'Rooms' }} />
            <Tab.Screen name="Services" component={ServicesScreen} options={{ tabBarLabel: 'Services' }} />
            <Tab.Screen name="Jobs" component={JobsScreen} options={{ tabBarLabel: 'Jobs' }} />
            <Tab.Screen name="Inbox" component={InboxScreen} options={{ tabBarLabel: 'Inbox' }} />
            <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
        </Tab.Navigator>
    );
};
