import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../theme/theme';
import { ServiceProvider } from '../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { executeContact, ContactInfo } from '../utils/contactUtils';
import { providerService } from '../services/providerService';

interface ProviderCardProps {
    provider: ServiceProvider;
    onPress: () => void;
}

export const ProviderCard: React.FC<ProviderCardProps> = ({ provider, onPress }) => {
    const contact: ContactInfo = {
        name: provider.name,
        phone: provider.phone,
        whatsapp: provider.whatsapp,
        context: 'service',
        contextTitle: provider.category,
    };

    const handleCall = () => {
        providerService.incrementLeads(provider.id).catch(() => { });
        executeContact('call', contact);
    };

    const handleWhatsApp = () => {
        providerService.incrementLeads(provider.id).catch(() => { });
        executeContact('whatsapp', contact);
    };

    const statusColors = {
        Available: { bg: '#F0FDF4', text: '#16A34A', dot: '#22C55E' },
        Busy: { bg: '#FFF7ED', text: '#EA580C', dot: '#F97316' },
        Paused: { bg: '#FEF2F2', text: '#DC2626', dot: '#EF4444' },
    };
    
    const status = statusColors[provider.availability] || statusColors.Available;

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={0.95}
        >
            <View style={styles.header}>
                <View style={[styles.avatar, { backgroundColor: provider.avatarColor || '#4F46E5' }]}>
                    <Text style={styles.avatarText}>{provider.initial}</Text>
                    <View style={[styles.statusIndicator, { backgroundColor: status.dot }]} />
                </View>
                <View style={styles.nameContent}>
                    <View style={styles.nameRow}>
                        <Text style={styles.name} numberOfLines={1}>{provider.name}</Text>
                        <View style={styles.ratingBadge}>
                            <MaterialCommunityIcons name="star" size={14} color="#F59E0B" />
                            <Text style={styles.ratingText}>{provider.rating}</Text>
                        </View>
                    </View>
                    <Text style={styles.category}>{provider.category}</Text>
                </View>
            </View>

            <View style={styles.tagsContainer}>
                <View style={styles.tag}>
                    <MaterialCommunityIcons name="map-marker-outline" size={14} color="#64748B" />
                    <Text style={styles.tagText} numberOfLines={1}>{provider.areas[0]}</Text>
                </View>
                <View style={styles.tag}>
                    <MaterialCommunityIcons name="briefcase-outline" size={14} color="#64748B" />
                    <Text style={styles.tagText}>{provider.experience}</Text>
                </View>
                <View style={[styles.statusTag, { backgroundColor: status.bg }]}>
                    <Text style={[styles.statusText, { color: status.text }]}>{provider.availability}</Text>
                </View>
            </View>

            <View style={styles.footer}>
                <View style={styles.priceContainer}>
                    <Text style={styles.priceLabel}>Starting from</Text>
                    <Text style={styles.priceValue}>{provider.priceRange}</Text>
                </View>
                <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.iconButton} onPress={handleWhatsApp}>
                        <MaterialCommunityIcons name="whatsapp" size={22} color="#10B981" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.callButton} onPress={handleCall}>
                        <LinearGradient
                            colors={['#4F46E5', '#3730A3']}
                            style={styles.gradient}
                        >
                            <MaterialCommunityIcons name="phone" size={18} color="#FFFFFF" />
                            <Text style={styles.callText}>Call</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        ...SHADOWS.medium,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatar: {
        width: 54,
        height: 54,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    avatarText: {
        fontSize: 20,
        fontWeight: '900',
        color: '#FFFFFF',
    },
    statusIndicator: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    nameContent: {
        flex: 1,
        marginLeft: 14,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    name: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1E293B',
        flex: 1,
        marginRight: 8,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFBEB',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#D97706',
    },
    category: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '600',
    },
    tagsContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    tag: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8FAFC',
        paddingVertical: 8,
        borderRadius: 12,
        gap: 6,
    },
    tagText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#475569',
    },
    statusTag: {
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusText: {
        fontSize: 11,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        paddingTop: 16,
    },
    priceContainer: {
        flex: 1,
    },
    priceLabel: {
        fontSize: 11,
        color: '#94A3B8',
        fontWeight: '700',
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    priceValue: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1E293B',
    },
    actionButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#F0FDF4',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#DCFCE7',
    },
    callButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    gradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        gap: 6,
    },
    callText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '800',
    },
});
