import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ServiceProvider } from '../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { executeContact, ContactInfo } from '../utils/contactUtils';
import { providerService } from '../services/providerService';

interface ProviderCardProps {
    provider: ServiceProvider;
    onPress: () => void;
}

export const ProviderCard: React.FC<ProviderCardProps> = ({ provider, onPress }) => {
    const contact: ContactInfo = {
        name: provider.name, phone: provider.phone,
        whatsapp: provider.whatsapp, context: 'service', contextTitle: provider.category,
    };
    const handleCall = () => { providerService.incrementLeads(provider.id).catch(() => {}); executeContact('call', contact); };
    const handleWhatsApp = () => { providerService.incrementLeads(provider.id).catch(() => {}); executeContact('whatsapp', contact); };

    const statusColors: Record<string, { dot: string; label: string; bg: string }> = {
        Available: { dot: '#30D158', label: 'Available', bg: '#30D15820' },
        Busy:      { dot: '#FF9500', label: 'Busy',      bg: '#FF950020' },
        Paused:    { dot: '#FF453A', label: 'Paused',    bg: '#FF453A20' },
    };
    const status = statusColors[provider.availability] || statusColors.Available;

    return (
        <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.85}>
            <View style={s.header}>
                {/* Avatar */}
                <View style={s.avatarWrap}>
                    <View style={[s.avatar, { backgroundColor: (provider.avatarColor || '#00C896') + '30' }]}>
                        <Text style={[s.avatarText, { color: provider.avatarColor || '#00C896' }]}>{provider.initial}</Text>
                    </View>
                    <View style={[s.statusDot, { backgroundColor: status.dot }]} />
                </View>
                <View style={s.nameBlock}>
                    <View style={s.nameRow}>
                        <Text style={s.name} numberOfLines={1}>{provider.name}</Text>
                        <View style={s.ratingTag}>
                            <MaterialCommunityIcons name="star" size={12} color="#FFD60A" />
                            <Text style={s.ratingText}>{provider.rating}</Text>
                        </View>
                    </View>
                    <Text style={s.category}>{provider.category}</Text>
                    <View style={[s.statusTag, { backgroundColor: status.bg }]}>
                        <Text style={[s.statusText, { color: status.dot }]}>{status.label}</Text>
                    </View>
                </View>
            </View>

            <View style={s.tagsRow}>
                <View style={s.tag}>
                    <MaterialCommunityIcons name="map-marker-outline" size={12} color="#636366" />
                    <Text style={s.tagText}>{provider.areas[0]}</Text>
                </View>
                <View style={s.tag}>
                    <MaterialCommunityIcons name="briefcase-outline" size={12} color="#636366" />
                    <Text style={s.tagText}>{provider.experience}</Text>
                </View>
            </View>

            <View style={s.footer}>
                <View>
                    <Text style={s.priceLabel}>Starting from</Text>
                    <Text style={s.priceValue}>{provider.priceRange}</Text>
                </View>
                <View style={s.actions}>
                    <TouchableOpacity style={s.waBtn} onPress={handleWhatsApp}>
                        <MaterialCommunityIcons name="whatsapp" size={20} color="#25D366" />
                    </TouchableOpacity>
                    <TouchableOpacity style={s.callBtn} onPress={handleCall}>
                        <MaterialCommunityIcons name="phone" size={15} color="#000000" />
                        <Text style={s.callText}>Call</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const s = StyleSheet.create({
    card: {
        backgroundColor: '#1C1C1E', borderRadius: 20, padding: 16,
        marginBottom: 14,
        shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3, shadowRadius: 16, elevation: 6,
    },
    header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
    avatarWrap: { position: 'relative', marginRight: 12 },
    avatar: {
        width: 52, height: 52, borderRadius: 16,
        alignItems: 'center', justifyContent: 'center',
    },
    avatarText: { fontSize: 22, fontWeight: '700' },
    statusDot: {
        position: 'absolute', bottom: 0, right: 0,
        width: 12, height: 12, borderRadius: 6,
        borderWidth: 2, borderColor: '#1C1C1E',
    },
    nameBlock: { flex: 1 },
    nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
    name: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', flex: 1, marginRight: 8 },
    ratingTag: {
        flexDirection: 'row', alignItems: 'center', gap: 3,
        backgroundColor: '#FFD60A15', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8,
    },
    ratingText: { fontSize: 11, fontWeight: '700', color: '#FFD60A' },
    category: { fontSize: 12, color: '#636366', marginBottom: 6 },
    statusTag: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    statusText: { fontSize: 10, fontWeight: '700' },
    tagsRow: {
        flexDirection: 'row', gap: 10, marginBottom: 14,
        backgroundColor: '#252527', padding: 10, borderRadius: 12,
    },
    tag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    tagText: { fontSize: 11, fontWeight: '600', color: '#AEAEB2' },
    footer: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#2C2C2E', paddingTop: 12,
    },
    priceLabel: { fontSize: 10, color: '#636366', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },
    priceValue: { fontSize: 15, fontWeight: '700', color: '#FFFFFF', marginTop: 2 },
    actions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    waBtn: {
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: '#25D36620', alignItems: 'center', justifyContent: 'center',
    },
    callBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: '#00C896', paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12,
    },
    callText: { color: '#000000', fontSize: 13, fontWeight: '700' },
});
