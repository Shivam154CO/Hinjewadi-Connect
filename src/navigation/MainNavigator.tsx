import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../types';
import { COLORS } from '../theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { HomeScreen } from '../screens/main/HomeScreen';
import { RoomsScreen } from '../screens/main/RoomsScreen';
import { JobsScreen } from '../screens/main/JobsScreen';
import { ServicesScreen } from '../screens/main/ServicesScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.textSecondary,
                tabBarIcon: ({ color, size }) => {
                    let iconName: keyof typeof MaterialCommunityIcons.glyphMap;
                    if (route.name === 'Home') iconName = 'home';
                    else if (route.name === 'Rooms') iconName = 'bed';
                    else if (route.name === 'Jobs') iconName = 'briefcase';
                    else if (route.name === 'Services') iconName = 'account-group';
                    else if (route.name === 'Profile') iconName = 'account';
                    else iconName = 'alert-circle';
                    return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
                },
                tabBarStyle: {
                    borderTopWidth: 1,
                    borderTopColor: COLORS.border,
                    height: 60,
                    paddingBottom: 10,
                }
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Rooms" component={RoomsScreen} />
            <Tab.Screen name="Services" component={ServicesScreen} />
            <Tab.Screen name="Jobs" component={JobsScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
};
