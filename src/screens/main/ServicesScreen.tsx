import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MainTabScreenProps, ServiceProvider } from '../../types';
import { executeContact, ContactInfo } from '../../utils/contactUtils';
import { providerService } from '../../services/providerService';
import { VerifiedCheck } from '../../components/TrustBadges';

const CATEGORIES = [
    { key: 'All', label: 'All', icon: 'view-grid' },
    { key: 'Maid', label: 'Maid', icon: 'broom' },
    { key: 'Cook', label: 'Cook', icon: 'chef-hat' },
    { key: 'Cleaner', label: 'Cleaner', icon: 'spray' },
    { key: 'Laundry', label: 'Laundry', icon: 'tshirt-crew' },
    { key: 'Driver', label: 'Driver', icon: 'car' },
];

const ProviderCard = ({ provider, onPress }: { provider: ServiceProvider; onPress: () => void }) => {
    const contact: ContactInfo = {
        name: provider.name,
        phone: provider.phone,
        whatsapp: provider.whatsapp,
        context: 'service',
        contextTitle: provider.category,
    };

    const handleCall = () => executeContact('call', contact);
    const handleWhatsApp = () => executeContact('whatsapp', contact);

    const statusColors = {
        Available: { bg: '#E8F5E9', dot: COLORS.success, text: COLORS.success },
        Busy: { bg: '#FFF3E0', dot: '#FF9800', text: '#FF9800' },
        Paused: { bg: '#FFEBEE', dot: '#EF5350', text: '#EF5350' },
    };
    const status = statusColors[provider.availability];

    return (
        <TouchableOpacity
            style={[styles.providerCard, SHADOWS.light]}
            onPress={onPress}
            activeOpacity={0.92}
        >
            {/* Top: Avatar + Name + Rating */}
            <View style={styles.cardTop}>
                <View style={[styles.avatar, { backgroundColor: provider.avatarColor }]}>
                    <Text style={styles.avatarText}>{provider.initial}</Text>
                </View>
                <View style={styles.nameSection}>
                    <View style={styles.nameRatingRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.providerName}>{provider.name}</Text>
                            <VerifiedCheck verified={true} />
                        </View>
                        <View style={styles.ratingBadge}>
                            <MaterialCommunityIcons name="star" size={14} color="#FFB800" />
                            <Text style={styles.ratingText}>{provider.rating}</Text>
                        </View>
                    </View>
                    <Text style={styles.categoryLabel}>{provider.category}</Text>
                </View>
            </View>

            {/* Info row */}
            <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                    <MaterialCommunityIcons name="map-marker" size={14} color={COLORS.secondary} />
                    <Text style={styles.infoText}>{provider.areas.join(', ')}</Text>
                </View>
                <View style={styles.infoDot} />
                <View style={styles.infoItem}>
                    <MaterialCommunityIcons name="clock-outline" size={14} color={COLORS.secondary} />
                    <Text style={styles.infoText}>{provider.experience}</Text>
                </View>
                <View style={styles.infoDot} />
                <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                    <View style={[styles.statusDot, { backgroundColor: status.dot }]} />
                    <Text style={[styles.statusText, { color: status.text }]}>{provider.availability}</Text>
                </View>
            </View>

            {/* Working hours */}
            <View style={styles.timingRow}>
                <MaterialCommunityIcons name="clock-time-four-outline" size={14} color={COLORS.textSecondary} />
                <Text style={styles.timingText}>{provider.workingHours}</Text>
                <View style={{ flex: 1 }} />
                <Text style={styles.priceText}>{provider.priceRange}</Text>
            </View>

            {/* Skills */}
            <View style={styles.skillsRow}>
                {provider.skills.slice(0, 3).map((skill, idx) => (
                    <View key={idx} style={styles.skillChip}>
                        <Text style={styles.skillText}>{skill}</Text>
                    </View>
                ))}
                {provider.skills.length > 3 && (
                    <Text style={styles.moreSkills}>+{provider.skills.length - 3}</Text>
                )}
            </View>

            {/* Action buttons */}
            <View style={styles.actionRow}>
                <TouchableOpacity
                    style={styles.callButton}
                    onPress={() => {
                        providerService.incrementLeads(provider.id).catch(() => { });
                        handleCall();
                    }}
                >
                    <MaterialCommunityIcons name="phone" size={18} color={COLORS.white} />
                    <Text style={styles.callButtonText}>Call</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.whatsappButton}
                    onPress={() => {
                        providerService.incrementLeads(provider.id).catch(() => { });
                        handleWhatsApp();
                    }}
                >
                    <MaterialCommunityIcons name="whatsapp" size={18} color={COLORS.success} />
                    <Text style={styles.whatsappButtonText}>WhatsApp</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.profileButton} onPress={onPress}>
                    <MaterialCommunityIcons name="account-eye" size={18} color={COLORS.secondary} />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

export const ServicesScreen: React.FC<MainTabScreenProps<'Services'>> = ({ navigation }) => {
    const [providers, setProviders] = useState<ServiceProvider[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        fetchProviders();
    }, []);

    const fetchProviders = async () => {
        try {
            setLoading(true);
            const data = await providerService.getProviders();
            setProviders(data);
        } catch (error) {
            console.error('Failed to fetch providers:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProviders = providers.filter(p => {
        return selectedCategory === 'All' || p.category === selectedCategory;
    });

    const categoryCounts = CATEGORIES.map(cat => ({
        ...cat,
        count: cat.key === 'All'
            ? providers.length
            : providers.filter(p => p.category === cat.key).length,
    }));

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Services</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Category Filter */}
            <View style={styles.categoryContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                    {categoryCounts.map(cat => (
                        <TouchableOpacity
                            key={cat.key}
                            style={[
                                styles.categoryChip,
                                selectedCategory === cat.key && styles.categoryChipActive
                            ]}
                            onPress={() => setSelectedCategory(cat.key)}
                        >
                            <MaterialCommunityIcons
                                name={cat.icon as any}
                                size={16}
                                color={selectedCategory === cat.key ? COLORS.white : COLORS.textSecondary}
                            />
                            <Text style={[
                                styles.categoryChipText,
                                selectedCategory === cat.key && styles.categoryChipTextActive
                            ]}>
                                {cat.label} ({cat.count})
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Provider List */}
            <FlatList
                data={filteredProviders}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <ProviderCard
                        provider={item}
                        onPress={() => navigation.navigate('ServiceProviderDetail', { providerId: item.id })}
                    />
                )}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="account-search" size={60} color={COLORS.border} />
                        <Text style={styles.emptyText}>No providers in this category</Text>
                        <Text style={styles.emptySubtext}>Try selecting a different service</Text>
                    </View>
                }
            />

            {/* FAB - Create service profile */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('CreateServiceProfile')}
            >
                <MaterialCommunityIcons name="plus" size={28} color={COLORS.white} />
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F3FF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.light,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.text,
    },
    categoryContainer: {
        paddingBottom: SPACING.md,
    },
    categoryScroll: {
        paddingHorizontal: SPACING.lg,
        gap: SPACING.sm,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: COLORS.white,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        gap: 6,
    },
    categoryChipActive: {
        backgroundColor: COLORS.secondary,
        borderColor: COLORS.secondary,
    },
    categoryChipText: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    categoryChipTextActive: {
        color: COLORS.white,
    },
    listContent: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: 100,
    },
    providerCard: {
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: '#E8E0F0',
    },
    cardTop: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
        borderWidth: 2,
        borderColor: COLORS.white,
        ...SHADOWS.light,
    },
    avatarText: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.secondary,
    },
    nameSection: {
        flex: 1,
    },
    nameRatingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    providerName: {
        fontSize: 17,
        fontWeight: '800',
        color: COLORS.text,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF8E1',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: BORDER_RADIUS.full,
        gap: 3,
    },
    ratingText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#F59E0B',
    },
    categoryLabel: {
        fontSize: 13,
        color: COLORS.textSecondary,
        fontWeight: '500',
        marginTop: 2,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
        flexWrap: 'wrap',
        gap: 6,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    infoText: {
        fontSize: 12,
        color: COLORS.secondary,
        fontWeight: '600',
    },
    infoDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: COLORS.border,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.full,
        gap: 4,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
    },
    timingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: SPACING.sm,
        paddingVertical: 8,
        paddingHorizontal: SPACING.sm,
        backgroundColor: '#F8F7FC',
        borderRadius: BORDER_RADIUS.sm,
    },
    timingText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    priceText: {
        fontSize: 12,
        color: COLORS.secondary,
        fontWeight: '700',
    },
    skillsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: SPACING.md,
    },
    skillChip: {
        backgroundColor: '#F0E6FF',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.full,
    },
    skillText: {
        fontSize: 11,
        color: COLORS.secondary,
        fontWeight: '600',
    },
    moreSkills: {
        fontSize: 11,
        color: COLORS.textSecondary,
        alignSelf: 'center',
    },
    actionRow: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    callButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.success,
        paddingVertical: 11,
        borderRadius: BORDER_RADIUS.full,
        gap: 6,
    },
    callButtonText: {
        color: COLORS.white,
        fontWeight: '700',
        fontSize: 14,
    },
    whatsappButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E8F5E9',
        paddingVertical: 11,
        borderRadius: BORDER_RADIUS.full,
        gap: 6,
        borderWidth: 1,
        borderColor: '#C8E6C9',
    },
    whatsappButtonText: {
        color: COLORS.success,
        fontWeight: '700',
        fontSize: 14,
    },
    profileButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F0E6FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
        marginTop: SPACING.md,
    },
    emptySubtext: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    fab: {
        position: 'absolute',
        bottom: SPACING.xl,
        right: SPACING.lg,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.secondary,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.medium,
    },
});
