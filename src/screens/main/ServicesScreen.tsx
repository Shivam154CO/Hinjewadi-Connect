import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MainTabScreenProps, ServiceProvider } from '../../types';
import { providerService } from '../../services/providerService';
import { ProviderCard } from '../../components/ProviderCard';

const CATEGORIES = [
    { key: 'All', label: 'All', icon: 'view-grid' },
    { key: 'Maid', label: 'Maid', icon: 'broom' },
    { key: 'Cook', label: 'Cook', icon: 'chef-hat' },
    { key: 'Cleaner', label: 'Cleaner', icon: 'spray' },
    { key: 'Laundry', label: 'Laundry', icon: 'tshirt-crew' },
    { key: 'Driver', label: 'Driver', icon: 'car' },
];

export const ServicesScreen: React.FC<MainTabScreenProps<'Services'>> = ({ navigation }) => {
    const [providers, setProviders] = useState<ServiceProvider[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
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

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchProviders();
        setRefreshing(false);
    };

    const filteredProviders = providers.filter(p => {
        return selectedCategory === 'All' || p.category === selectedCategory;
    });

    const getCategoryCount = (key: string) => 
        key === 'All' ? providers.length : providers.filter(p => p.category === key).length;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Local Services</Text>
                <TouchableOpacity style={styles.backButton}>
                    <MaterialCommunityIcons name="magnify" size={24} color="#1E293B" />
                </TouchableOpacity>
            </View>

            <View style={styles.categoryContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                    {CATEGORIES.map(cat => (
                        <TouchableOpacity
                            key={cat.key}
                            style={[
                                styles.categoryChip,
                                selectedCategory === cat.key && styles.categoryChipActive
                            ]}
                            onPress={() => setSelectedCategory(cat.key)}
                        >
                            <View style={[styles.iconCircle, selectedCategory === cat.key && styles.iconCircleActive]}>
                                <MaterialCommunityIcons
                                    name={cat.icon as any}
                                    size={18}
                                    color={selectedCategory === cat.key ? '#FFFFFF' : COLORS.primary}
                                />
                            </View>
                            <View>
                                <Text style={[styles.categoryLabel, selectedCategory === cat.key && styles.categoryLabelActive]}>
                                    {cat.label}
                                </Text>
                                <Text style={[styles.countText, selectedCategory === cat.key && styles.countTextActive]}>
                                    {getCategoryCount(cat.key)} providers
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {loading && !refreshing ? (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loaderText}>Finding trusted service providers...</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredProviders}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} />
                    }
                    renderItem={({ item }) => (
                        <ProviderCard
                            provider={item}
                            onPress={() => navigation.navigate('ServiceProviderDetail', { providerId: item.id })}
                        />
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons name="account-search-outline" size={80} color="#E2E8F0" />
                            <Text style={styles.emptyTitle}>No professionals yet</Text>
                            <Text style={styles.emptySubtitle}>We couldn't find any service providers in this category.</Text>
                            <TouchableOpacity style={styles.clearBtn} onPress={() => setSelectedCategory('All')}>
                                <Text style={styles.clearBtnText}>View All Services</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('CreateServiceProfile')}
            >
                <MaterialCommunityIcons name="plus" size={32} color="#FFFFFF" />
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 14,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: '#F8FAFC',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: { fontSize: 22, fontWeight: '900', color: '#1E293B', letterSpacing: -0.5 },
    categoryContainer: { marginBottom: 12 },
    categoryScroll: { paddingLeft: 20, paddingBottom: 16, gap: 12 },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingLeft: 10,
        paddingRight: 16,
        paddingVertical: 10,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#F1F5F9',
        gap: 12,
    },
    categoryChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: COLORS.primary + '10',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconCircleActive: { backgroundColor: 'rgba(255,255,255,0.2)' },
    categoryLabel: { fontSize: 14, fontWeight: '800', color: '#475569' },
    categoryLabelActive: { color: '#FFFFFF' },
    countText: { fontSize: 11, fontWeight: '600', color: '#94A3B8', marginTop: 1 },
    countTextActive: { color: 'rgba(255,255,255,0.7)' },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
    loaderText: { marginTop: 16, fontSize: 15, fontWeight: '600', color: '#64748B' },
    listContent: { paddingHorizontal: 20, paddingBottom: 100 },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, paddingHorizontal: 40 },
    emptyTitle: { fontSize: 20, fontWeight: '800', color: '#1E293B', marginTop: 20 },
    emptySubtitle: { fontSize: 15, color: '#64748B', textAlign: 'center', marginTop: 8, lineHeight: 22 },
    clearBtn: { marginTop: 24, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14, backgroundColor: COLORS.primary },
    clearBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        width: 64,
        height: 64,
        borderRadius: 22,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.medium,
    },
});
