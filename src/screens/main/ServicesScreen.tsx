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
    container: { flex: 1, backgroundColor: '#0F0F0F' },
    header: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14,
    },
    backButton: {
        width: 42, height: 42, borderRadius: 12,
        backgroundColor: '#1C1C1E', alignItems: 'center', justifyContent: 'center',
    },
    headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.5 },
    categoryContainer: { marginBottom: 12 },
    categoryScroll: { paddingLeft: 20, paddingBottom: 14, gap: 10 },
    categoryChip: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#1C1C1E', paddingLeft: 10, paddingRight: 14,
        paddingVertical: 10, borderRadius: 16, gap: 10,
        borderWidth: 1, borderColor: '#2C2C2E',
    },
    categoryChipActive: { borderColor: '#00C896', backgroundColor: '#00C89610' },
    iconCircle: {
        width: 34, height: 34, borderRadius: 10,
        backgroundColor: '#00C89618', alignItems: 'center', justifyContent: 'center',
    },
    iconCircleActive: { backgroundColor: '#00C896' },
    categoryLabel: { fontSize: 14, fontWeight: '700', color: '#AEAEB2' },
    categoryLabelActive: { color: '#00C896' },
    countText: { fontSize: 11, fontWeight: '600', color: '#636366', marginTop: 1 },
    countTextActive: { color: '#00C89680' },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
    loaderText: { marginTop: 14, fontSize: 14, color: '#636366' },
    listContent: { paddingHorizontal: 20, paddingBottom: 110 },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, paddingHorizontal: 40 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginTop: 20 },
    emptySubtitle: { fontSize: 14, color: '#636366', textAlign: 'center', marginTop: 8, lineHeight: 20 },
    clearBtn: { marginTop: 20, paddingHorizontal: 22, paddingVertical: 11, borderRadius: 12, backgroundColor: '#00C896' },
    clearBtnText: { color: '#000000', fontWeight: '700', fontSize: 14 },
    fab: {
        position: 'absolute', bottom: 100, right: 20,
        width: 56, height: 56, borderRadius: 18,
        backgroundColor: '#00C896', alignItems: 'center', justifyContent: 'center',
        shadowColor: '#00C896', shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4, shadowRadius: 14, elevation: 8,
    },
});

