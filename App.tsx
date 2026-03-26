import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryProvider } from './src/context/QueryProvider';
import { 
    useFonts, 
    Inter_400Regular, 
    Inter_700Bold, 
    Inter_900Black 
} from '@expo-google-fonts/inter';
import { 
    Outfit_400Regular, 
    Outfit_700Bold, 
    Outfit_800ExtraBold 
} from '@expo-google-fonts/outfit';
import * as SplashScreen from 'expo-splash-screen';
import './src/utils/i18n';

SplashScreen.preventAutoHideAsync();

export default function App() {
    const [fontsLoaded] = useFonts({
        Inter_400Regular,
        Inter_700Bold,
        Inter_900Black,
        Outfit_400Regular,
        Outfit_700Bold,
        Outfit_800ExtraBold,
    });

    React.useEffect(() => {
        if (fontsLoaded) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) return null;

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <QueryProvider>
                <SafeAreaProvider>
                    <AuthProvider>
                        <AppNavigator />
                        <StatusBar style="dark" />
                    </AuthProvider>
                </SafeAreaProvider>
            </QueryProvider>
        </GestureHandlerRootView>
    );
}
