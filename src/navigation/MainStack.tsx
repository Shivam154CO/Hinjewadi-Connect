import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainStackParamList } from '../types';
import { MainNavigator } from './MainNavigator';
import { RoomDetailScreen } from '../screens/main/RoomDetailScreen';
import { PostListingScreen } from '../screens/main/PostListingScreen';
import { ServiceProviderDetailScreen } from '../screens/main/ServiceProviderDetailScreen';
import { CreateServiceProfileScreen } from '../screens/main/CreateServiceProfileScreen';
import { JobDetailScreen } from '../screens/main/JobDetailScreen';
import { CreateJobProfileScreen } from '../screens/main/CreateJobProfileScreen';
import { COLORS } from '../theme/theme';

const Stack = createNativeStackNavigator<MainStackParamList>();

export const MainStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: COLORS.background }
            }}
        >
            <Stack.Screen name="MainTabs" component={MainNavigator} />
            <Stack.Screen name="RoomDetail" component={RoomDetailScreen} />
            <Stack.Screen name="PostListing" component={PostListingScreen} />
            <Stack.Screen name="ServiceProviderDetail" component={ServiceProviderDetailScreen} />
            <Stack.Screen name="CreateServiceProfile" component={CreateServiceProfileScreen} />
            <Stack.Screen name="JobDetail" component={JobDetailScreen} />
            <Stack.Screen name="CreateJobProfile" component={CreateJobProfileScreen} />
        </Stack.Navigator>
    );
};
