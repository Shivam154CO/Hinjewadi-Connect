import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { OTPScreen } from '../screens/auth/OTPScreen';
import { RoleSelectionScreen } from '../screens/auth/RoleSelectionScreen';
import { ProfileCreationScreen } from '../screens/auth/ProfileCreationScreen';
import { COLORS } from '../theme/theme';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: COLORS.background }
            }}
        >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="OTP" component={OTPScreen} />
            <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
            <Stack.Screen name="ProfileCreation" component={ProfileCreationScreen} />
        </Stack.Navigator>
    );
};
