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
import Constants from 'expo-constants';
import './src/utils/i18n';
import { MaintenanceBlocker } from './src/components/MaintenanceBlocker';
import { ForceUpdateBlocker } from './src/components/ForceUpdateBlocker';
import { appConfigService } from './src/services/appConfigService';
import { telemetryService } from './src/services/telemetryService';
import { notificationService } from './src/services/notificationService';

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
    const [needsUpdate, setNeedsUpdate] = React.useState(false);
    const [latestVer, setLatestVer] = React.useState('1.0.0');

    React.useEffect(() => {
        telemetryService.init();
        notificationService.registerForPushNotificationsAsync().then(token => {
            if (token) telemetryService.logEvent('PushToken_Registered', { token });
        });

        appConfigService.getConfig().then(config => {
            if (config.maintenanceMode) setMaintenance(true);
            
            const currentVer = Constants.expoConfig?.version || '1.0.0';
            if (config.minAppVersion && config.minAppVersion.localeCompare(currentVer, undefined, { numeric: true, sensitivity: 'base' }) > 0) {
                setNeedsUpdate(true);
                setLatestVer(config.minAppVersion);
            }
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

    if (needsUpdate) {
        return (
            <GestureHandlerRootView style={{ flex: 1 }}>
                <ForceUpdateBlocker latestVersion={latestVer} />
            </GestureHandlerRootView>
        );
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ErrorBoundary>
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
