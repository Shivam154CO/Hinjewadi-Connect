import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Pressable,
    Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../theme/theme';
import { ContactInfo, executeContact } from '../utils/contactUtils';

const { width } = Dimensions.get('window');

interface ContactSheetProps {
    visible: boolean;
    onClose: () => void;
    contact: ContactInfo;
}

const CONTACT_OPTIONS = [
    {
        key: 'call' as const,
        label: 'Call Now',
        sublabel: 'Direct phone call',
        icon: 'phone',
        color: '#10B981',
        bgColor: '#E8F5E9',
    },
    {
        key: 'whatsapp' as const,
        label: 'WhatsApp',
        sublabel: 'Send a message',
        icon: 'whatsapp',
        color: '#25D366',
        bgColor: '#E8F8EE',
    },
    {
        key: 'sms' as const,
        label: 'SMS',
        sublabel: 'Send a text message',
        icon: 'message-text-outline',
        color: '#2563EB',
        bgColor: '#E3F0FF',
    },
    {
        key: 'chat' as const,
        label: 'In-App Chat',
        sublabel: 'Coming soon',
        icon: 'chat-processing-outline',
        color: '#7C3AED',
        bgColor: '#F0E6FF',
        disabled: true,
    },
];

export const ContactSheet: React.FC<ContactSheetProps> = ({ visible, onClose, contact }) => {
    const handleAction = (action: typeof CONTACT_OPTIONS[number]) => {
        if (action.disabled) {
            executeContact('chat', contact);
            return;
        }
        onClose();
        // Small delay so modal closes smoothly before action
        setTimeout(() => executeContact(action.key, contact), 300);
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <Pressable style={styles.overlay} onPress={onClose}>
                <Pressable style={styles.sheet} onPress={e => e.stopPropagation()}>
                    {/* Handle */}
                    <View style={styles.handle} />

                    {/* Contact Info Header */}
                    <View style={styles.contactHeader}>
                        <View style={styles.contactAvatar}>
                            <Text style={styles.contactInitial}>
                                {contact.name.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                        <View style={styles.contactInfo}>
                            <Text style={styles.contactName}>{contact.name}</Text>
                            <Text style={styles.contactPhone}>{contact.phone}</Text>
                            {contact.context && (
                                <View style={styles.contextBadge}>
                                    <MaterialCommunityIcons
                                        name={
                                            contact.context === 'room' ? 'home-outline' :
                                                contact.context === 'job' ? 'briefcase-outline' :
                                                    contact.context === 'service' ? 'account-wrench-outline' :
                                                        'account-outline'
                                        }
                                        size={12}
                                        color={COLORS.primary}
                                    />
                                    <Text style={styles.contextText}>
                                        {contact.context === 'room' ? 'Room Owner' :
                                            contact.context === 'job' ? 'Employer' :
                                                contact.context === 'service' ? 'Service Provider' :
                                                    'Contact'}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Action Buttons */}
                    <Text style={styles.actionLabel}>Choose how to connect</Text>
                    {CONTACT_OPTIONS.map(option => (
                        <TouchableOpacity
                            key={option.key}
                            style={[
                                styles.actionRow,
                                option.disabled && styles.actionRowDisabled,
                            ]}
                            onPress={() => handleAction(option)}
                            activeOpacity={0.8}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: option.bgColor }]}>
                                <MaterialCommunityIcons
                                    name={option.icon as any}
                                    size={22}
                                    color={option.color}
                                />
                            </View>
                            <View style={styles.actionTextContainer}>
                                <Text style={[
                                    styles.actionTitle,
                                    option.disabled && styles.actionTitleDisabled,
                                ]}>{option.label}</Text>
                                <Text style={styles.actionSublabel}>{option.sublabel}</Text>
                            </View>
                            {option.disabled ? (
                                <View style={styles.comingSoonBadge}>
                                    <Text style={styles.comingSoonText}>Soon</Text>
                                </View>
                            ) : (
                                <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.border} />
                            )}
                        </TouchableOpacity>
                    ))}

                    {/* Cancel */}
                    <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                </Pressable>
            </Pressable>
        </Modal>
    );
};

// ── Quick Contact Bar (inline, for detail screens) ──
interface QuickContactBarProps {
    contact: ContactInfo;
    style?: object;
}

export const QuickContactBar: React.FC<QuickContactBarProps> = ({ contact, style }) => {
    return (
        <View style={[styles.quickBar, style]}>
            <TouchableOpacity
                style={styles.quickCallBtn}
                onPress={() => executeContact('call', contact)}
            >
                <MaterialCommunityIcons name="phone" size={20} color={COLORS.white} />
                <Text style={styles.quickCallText}>Call Now</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.quickWhatsappBtn}
                onPress={() => executeContact('whatsapp', contact)}
            >
                <MaterialCommunityIcons name="whatsapp" size={20} color="#25D366" />
                <Text style={styles.quickWhatsappText}>WhatsApp</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.quickSmsBtn}
                onPress={() => executeContact('sms', contact)}
            >
                <MaterialCommunityIcons name="message-text-outline" size={20} color={COLORS.primary} />
            </TouchableOpacity>
        </View>
    );
};

// ── Contact Icon Buttons (inline, for cards) ──
interface ContactIconsProps {
    contact: ContactInfo;
}

export const ContactIcons: React.FC<ContactIconsProps> = ({ contact }) => {
    return (
        <View style={styles.iconRow}>
            <TouchableOpacity
                style={[styles.iconBtn, { backgroundColor: '#E8F5E9' }]}
                onPress={() => executeContact('call', contact)}
            >
                <MaterialCommunityIcons name="phone" size={18} color="#10B981" />
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.iconBtn, { backgroundColor: '#E8F8EE' }]}
                onPress={() => executeContact('whatsapp', contact)}
            >
                <MaterialCommunityIcons name="whatsapp" size={18} color="#25D366" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    // ── Modal ──
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: BORDER_RADIUS.xl,
        borderTopRightRadius: BORDER_RADIUS.xl,
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.xxl,
        ...SHADOWS.medium,
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: COLORS.border,
        alignSelf: 'center',
        marginTop: SPACING.md,
        marginBottom: SPACING.md,
    },
    // Contact header
    contactHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
        paddingVertical: SPACING.sm,
    },
    contactAvatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: COLORS.primary + '15',
        alignItems: 'center',
        justifyContent: 'center',
    },
    contactInitial: {
        fontSize: 22,
        fontWeight: '800',
        color: COLORS.primary,
    },
    contactInfo: {
        flex: 1,
    },
    contactName: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
    },
    contactPhone: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    contextBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E3F0FF',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: BORDER_RADIUS.full,
        gap: 4,
        alignSelf: 'flex-start',
        marginTop: 4,
    },
    contextText: {
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.primary,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: SPACING.md,
    },
    actionLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginBottom: SPACING.sm,
    },
    // Action rows
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.md,
        gap: SPACING.md,
    },
    actionRowDisabled: {
        opacity: 0.55,
    },
    actionIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionTextContainer: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.text,
    },
    actionTitleDisabled: {
        color: COLORS.textSecondary,
    },
    actionSublabel: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 1,
    },
    comingSoonBadge: {
        backgroundColor: '#F0E6FF',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.full,
    },
    comingSoonText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#7C3AED',
    },
    cancelButton: {
        alignItems: 'center',
        paddingVertical: SPACING.md,
        marginTop: SPACING.sm,
        backgroundColor: '#F1F5F9',
        borderRadius: BORDER_RADIUS.full,
    },
    cancelText: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    // ── Quick Contact Bar ──
    quickBar: {
        flexDirection: 'row',
        gap: SPACING.sm,
        padding: SPACING.md,
        paddingBottom: SPACING.xl,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    quickCallBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#10B981',
        paddingVertical: 14,
        borderRadius: BORDER_RADIUS.full,
        gap: 8,
    },
    quickCallText: {
        color: COLORS.white,
        fontWeight: '700',
        fontSize: 15,
    },
    quickWhatsappBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E8F8EE',
        paddingVertical: 14,
        borderRadius: BORDER_RADIUS.full,
        gap: 8,
        borderWidth: 1,
        borderColor: '#C8E6C9',
    },
    quickWhatsappText: {
        color: '#25D366',
        fontWeight: '700',
        fontSize: 15,
    },
    quickSmsBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E3F0FF',
        borderWidth: 1,
        borderColor: '#BDDCFF',
    },
    // ── Contact Icons ──
    iconRow: {
        flexDirection: 'row',
        gap: 8,
    },
    iconBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
