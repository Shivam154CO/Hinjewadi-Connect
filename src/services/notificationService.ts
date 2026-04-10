import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Set up UI behavior when a notification arrives while the app is open
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

class NotificationService {
    async registerForPushNotificationsAsync(): Promise<string | undefined> {
        let token;

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#4F46E5',
            });
        }

        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                console.warn('Failed to get push token for push notification!');
                return;
            }
            
            token = await Notifications.getExpoPushTokenAsync({
                projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID,
            });
            return token.data;
        } else {
            console.warn('Must use physical device for Push Notifications');
        }
    }

    async sendLocalNotification(title: string, body: string) {
        await Notifications.scheduleNotificationAsync({
            content: { title, body },
            trigger: null, // Send immediately
        });
    }
}

export const notificationService = new NotificationService();
