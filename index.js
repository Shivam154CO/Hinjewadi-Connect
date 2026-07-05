import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';

if (Platform.OS === 'web' && typeof window !== 'undefined' && window.history) {
    const originalReplaceState = window.history.replaceState;
    window.history.replaceState = function (...args) {
        try {
            return originalReplaceState.apply(this, args);
        } catch (e) {
            console.warn('Caught replaceState error (possibly from browser extension):', e);
        }
    };

    const originalPushState = window.history.pushState;
    window.history.pushState = function (...args) {
        try {
            return originalPushState.apply(this, args);
        } catch (e) {
            console.warn('Caught pushState error (possibly from browser extension):', e);
        }
    };
}

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
