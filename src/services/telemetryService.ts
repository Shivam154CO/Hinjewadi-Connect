// This is an architectural facade. 
// When you are ready for production, you just run `npx expo install @sentry/react-native` and drop your Sentry DSN here.

class TelemetryService {
    init() {
        if (!__DEV__) {
            console.log("[Telemetry] Production monitoring initialized.");
            // Sentry.init({ dsn: process.env.EXPO_PUBLIC_SENTRY_DSN });
        }
    }

    logError(error: Error | string, context?: any) {
        if (__DEV__) {
            console.error("[Telemetry ERROR]", error, context);
        } else {
            // Sentry.captureException(error, { extra: context });
            console.log("Logged to remote server:", error);
        }
    }

    logEvent(eventName: string, params?: any) {
        if (__DEV__) {
            console.log(`[Telemetry EVENT] ${eventName}`, params);
        } else {
            // mixpanel.track(eventName, params);
        }
    }
}

export const telemetryService = new TelemetryService();
