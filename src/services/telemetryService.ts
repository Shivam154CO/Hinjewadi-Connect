/**
 * Telemetry Facade Service 
 * Interfaces with remote logging providers (e.g. Sentry, Firebase) securely.
 */

class TelemetryService {
    private sessionId: string | null = null;
    private eventBuffer: any[] = [];
    private readonly BATCH_SIZE = 10;

    init() {
        this.sessionId = Math.random().toString(36).substring(7);
        if (__DEV__) {
            console.log(`[Telemetry] Session ${this.sessionId} initialized.`);
        }
    }

    logError(error: Error | string, context?: any) {
        const errorData = {
            message: typeof error === 'string' ? error : error.message,
            stack: typeof error === 'string' ? null : error.stack,
            context,
            sessionId: this.sessionId,
            timestamp: new Date().toISOString()
        };

        if (__DEV__) {
            console.error("[Telemetry ERROR]", errorData);
        } else {
            // Forward to a generic observability endpoint
            this.pushToRemote('ERROR', errorData);
        }
    }

    logEvent(eventName: string, params?: any) {
        const event = {
            eventName,
            params,
            sessionId: this.sessionId,
            timestamp: new Date().toISOString()
        };

        this.eventBuffer.push(event);

        if (this.eventBuffer.length >= this.BATCH_SIZE) {
            this.flushBatch();
        }

        if (__DEV__) {
            console.log(`[Telemetry EVENT] ${eventName}`, params);
        }
    }

    private flushBatch() {
        const batch = [...this.eventBuffer];
        this.eventBuffer = [];
        this.pushToRemote('BATCH_EVENT', batch);
    }

    private pushToRemote(level: string, data: any) {
        // Integration point for production telemetry (Datadog/Sentry)
        // Silently swallow if not configured to avoid console flooding
    }
}


export const telemetryService = new TelemetryService();
