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
                            <MaterialCommunityIcons name="star" size={10} color="#FFD60A" />
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
                    <MaterialCommunityIcons name="map-marker-outline" size={11} color="#636366" />
                    <Text style={s.tagText}>{provider.areas[0]}</Text>
                </View>
                <View style={s.tag}>
                    <MaterialCommunityIcons name="briefcase-outline" size={11} color="#636366" />
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
                        <MaterialCommunityIcons name="whatsapp" size={16} color="#25D366" />
                    </TouchableOpacity>
                    <TouchableOpacity style={s.callBtn} onPress={handleCall}>
                        <MaterialCommunityIcons name="phone" size={13} color="#000000" />
                        <Text style={s.callText}>Call</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const s = StyleSheet.create({
    card: {
        backgroundColor: '#1C1C1E', borderRadius: 12, padding: 12,
        marginBottom: 10,
        borderWidth: 1, borderColor: '#2C2C2E',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15, shadowRadius: 4, elevation: 2,
    },
    header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
    avatarWrap: { position: 'relative', marginRight: 10 },
    avatar: {
        width: 42, height: 42, borderRadius: 8,
        alignItems: 'center', justifyContent: 'center',
    },
    avatarText: { fontSize: 18, fontWeight: '700' },
    statusDot: {
        position: 'absolute', bottom: 0, right: 0,
        width: 10, height: 10, borderRadius: 5,
        borderWidth: 1.5, borderColor: '#1C1C1E',
    },
    nameBlock: { flex: 1 },
    nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
    name: { fontSize: 14, fontWeight: '700', color: '#FFFFFF', flex: 1, marginRight: 8 },
    ratingTag: {
        flexDirection: 'row', alignItems: 'center', gap: 2,
        backgroundColor: '#FFD60A15', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
    },
    ratingText: { fontSize: 10, fontWeight: '700', color: '#FFD60A' },
    category: { fontSize: 11, color: '#636366', marginBottom: 4 },
    statusTag: { alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
    statusText: { fontSize: 9, fontWeight: '700' },
    tagsRow: {
        flexDirection: 'row', gap: 8, marginBottom: 10,
        backgroundColor: '#252527', padding: 8, borderRadius: 8,
    },
    tag: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    tagText: { fontSize: 10, fontWeight: '600', color: '#AEAEB2' },
    footer: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#2C2C2E', paddingTop: 10,
    },
    priceLabel: { fontSize: 9, color: '#636366', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },
    priceValue: { fontSize: 13, fontWeight: '700', color: '#FFFFFF', marginTop: 1 },
    actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    waBtn: {
        width: 32, height: 32, borderRadius: 8,
        backgroundColor: '#25D36620', alignItems: 'center', justifyContent: 'center',
    },
    callBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: '#00C896', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8,
    },
    callText: { color: '#000000', fontSize: 12, fontWeight: '700' },
});
