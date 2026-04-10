import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ErrorBoundary } from './src/components/ErrorBoundary';
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
import { NetworkBanner } from './src/components/NetworkBanner';
import { MaintenanceBlocker } from './src/components/MaintenanceBlocker';
import { appConfigService } from './src/services/appConfigService';

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
    
    const [maintenance, setMaintenance] = React.useState(false);

    React.useEffect(() => {
        appConfigService.getConfig().then(config => {
            if (config.maintenanceMode) setMaintenance(true);
        });
        
        if (fontsLoaded) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) return null;

    if (maintenance) {
        return (
            <GestureHandlerRootView style={{ flex: 1 }}>
                <MaintenanceBlocker />
            </GestureHandlerRootView>
        );
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ErrorBoundary>
                <NetworkBanner />
                <QueryProvider>
                    <SafeAreaProvider>
                        <AuthProvider>
                            <AppNavigator />
                            <StatusBar style="dark" />
                        </AuthProvider>
                    </SafeAreaProvider>
                </QueryProvider>
            </ErrorBoundary>
        </GestureHandlerRootView>
    );
}
