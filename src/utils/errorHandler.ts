import { Alert } from 'react-native';

export const errorHandler = {
    handleError: (error: any, title: string = 'Error') => {
        console.error(error);
        const message = error?.message || 'An unexpected error occurred';
        Alert.alert(title, message);
    },

    handleAuthError: (error: any) => {
        console.error('Auth Error:', error);
        let message = 'Authentication failed';

        if (error?.message?.includes('Invalid login credentials')) {
            message = 'Invalid email or password';
        } else if (error?.message?.includes('User already registered')) {
            message = 'An account with this email already exists';
        } else if (error?.message?.includes('Phone')) {
            message = 'Phone number verification failed';
        }

        Alert.alert('Authentication Error', message);
    },

    handleNetworkError: (error: any) => {
        console.error('Network Error:', error);
        Alert.alert(
            'Connection Error',
            'Please check your internet connection and try again.'
        );
    },

    handleValidationError: (field: string, message: string) => {
        Alert.alert('Validation Error', `${field}: ${message}`);
    }
};