import { Linking, Alert, Platform } from 'react-native';

/**
 * Centralized Contact Utility
 * One-click Call | WhatsApp Deep Link | Future In-App Chat
 */

// ── One-Click Call ──
export const makeCall = (phone: string) => {
    const cleaned = phone.replace(/[^0-9+]/g, '');
    const url = `tel:${cleaned}`;
    Linking.canOpenURL(url)
        .then(supported => {
            if (supported) {
                Linking.openURL(url);
            } else {
                Alert.alert('Cannot Make Call', 'Phone calls are not supported on this device.');
            }
        })
        .catch(() => Alert.alert('Error', 'Failed to initiate call.'));
};

// ── WhatsApp Deep Link ──
export const openWhatsApp = (phone: string, message?: string) => {
    const cleaned = phone.replace(/[^0-9]/g, '');
    // Ensure country code
    const withCode = cleaned.startsWith('91') ? cleaned : `91${cleaned}`;
    const encodedMessage = message ? encodeURIComponent(message) : '';
    const url = `https://wa.me/${withCode}${encodedMessage ? `?text=${encodedMessage}` : ''}`;

    Linking.canOpenURL(url)
        .then(supported => {
            if (supported) {
                Linking.openURL(url);
            } else {
                Alert.alert('WhatsApp Not Found', 'WhatsApp is not installed on this device.');
            }
        })
        .catch(() => Alert.alert('Error', 'Failed to open WhatsApp.'));
};

// ── Pre-built WhatsApp messages for each context ──
export const whatsAppMessages = {
    room: (title: string) =>
        `Hi, I found your listing "${title}" on Hinjewadi Connect. Is it still available?`,
    job: (title: string, company: string) =>
        `Hi, I'm interested in the "${title}" position at ${company} listed on Hinjewadi Connect. Can we discuss?`,
    service: (name: string, category: string) =>
        `Hi ${name}, I found your ${category} service profile on Hinjewadi Connect. Are you available?`,
    general: () =>
        `Hi, I'm contacting you through Hinjewadi Connect.`,
};

// ── SMS Fallback ──
export const sendSMS = (phone: string, message?: string) => {
    const cleaned = phone.replace(/[^0-9+]/g, '');
    const body = message ? `&body=${encodeURIComponent(message)}` : '';
    const url = Platform.OS === 'ios'
        ? `sms:${cleaned}${body}`
        : `sms:${cleaned}?body=${message || ''}`;

    Linking.openURL(url).catch(() =>
        Alert.alert('Error', 'Failed to open messaging app.')
    );
};

// ── Contact action types ──
export type ContactAction = 'call' | 'whatsapp' | 'sms' | 'chat';

export interface ContactInfo {
    id?: string;
    name: string;
    phone: string;
    whatsapp?: string;
    ownerId?: string;
    context?: 'room' | 'job' | 'service' | 'general';
    contextTitle?: string;
    contextCompany?: string;
}

// ── Execute contact action ──
export const executeContact = (action: ContactAction, contact: ContactInfo) => {
    const whatsappPhone = contact.whatsapp || contact.phone;

    switch (action) {
        case 'call':
            makeCall(contact.phone);
            break;
        case 'whatsapp': {
            let message = whatsAppMessages.general();
            if (contact.context === 'room' && contact.contextTitle) {
                message = whatsAppMessages.room(contact.contextTitle);
            } else if (contact.context === 'job' && contact.contextTitle) {
                message = whatsAppMessages.job(contact.contextTitle, contact.contextCompany || '');
            } else if (contact.context === 'service') {
                message = whatsAppMessages.service(contact.name, contact.contextTitle || '');
            }
            openWhatsApp(whatsappPhone, message);
            break;
        }
        case 'sms':
            sendSMS(contact.phone, `Hi ${contact.name}, contacting from Hinjewadi Connect.`);
            break;
        case 'chat':
            // Future: navigate to in-app chat
            Alert.alert(
                'Coming Soon! 💬',
                'In-app chat will be available in the next update. For now, use Call or WhatsApp.',
                [{ text: 'OK' }]
            );
            break;
    }
};
