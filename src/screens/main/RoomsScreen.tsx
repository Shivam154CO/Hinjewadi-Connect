import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Dimensions,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme/theme';
import { RoomCard } from '../../components/RoomCard';
import { Room, MainTabScreenProps } from '../../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { roomService } from '../../services/roomService';
import { PHASE_COORDS, PhaseKey, sortByPhaseDistance } from '../../utils/geoUtils';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = [
    { key: 'All', label: 'All', icon: 'apps' },
    { key: 'Room', label: 'Rooms', icon: 'bed-outline' },
    { key: 'PG', label: 'PGs', icon: 'home-group' },
    { key: 'Flat', label: 'Flats', icon: 'office-building' },
];

export const RoomsScreen: React.FC<MainTabScreenProps<'Rooms'>> = ({ navigation }) => {
    const { user } = useAuth();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'recent' | 'distance'>('recent');
    const [selectedPhase, setSelectedPhase] = useState<PhaseKey>((user?.area as PhaseKey) || 'Phase 1');

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            setLoading(true);
            const data = await roomService.getRooms();
            setRooms(data);
        } catch (error) {
            console.error('Failed to fetch rooms:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchRooms();
        setRefreshing(false);
    };

    const filteredRooms = rooms.filter(room => {
        const categoryMatch = selectedCategory === 'All' || room.type === selectedCategory;
        const searchMatch = searchQuery === '' ||
            room.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            room.area.toLowerCase().includes(searchQuery.toLowerCase());
        return categoryMatch && searchMatch;
    });

    const sortedRooms = sortBy === 'distance'
        ? sortByPhaseDistance(filteredRooms, selectedPhase)
        : filteredRooms;

    const getCategoryCount = (key: string) =>
        key === 'All' ? rooms.length : rooms.filter(r => r.type === key).length;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Premium Living</Text>
                <TouchableOpacity style={styles.iconBtn}>
                    <MaterialCommunityIcons name="map-search-outline" size={24} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            <View style={styles.searchSection}>
                <View style={styles.searchBar}>
                    <MaterialCommunityIcons name="magnify" size={22} color="#94A3B8" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search area, landmark or PG name..."
                        placeholderTextColor="#94A3B8"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <MaterialCommunityIcons name="close-circle" size={18} color="#94A3B8" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <View style={styles.filterSection}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                    {CATEGORIES.map(cat => (
                        <TouchableOpacity
                            key={cat.key}
                            style={[styles.catChip, selectedCategory === cat.key && styles.catChipActive]}
                            onPress={() => setSelectedCategory(cat.key)}
                        >
                            <MaterialCommunityIcons
                                name={cat.icon as any}
                                size={18}
                                color={selectedCategory === cat.key ? '#FFFFFF' : '#64748B'}
                            />
                            <Text style={[styles.catLabel, selectedCategory === cat.key && styles.catLabelActive]}>
                                {cat.label}
                            </Text>
                            <View style={[styles.countBadge, selectedCategory === cat.key && styles.countBadgeActive]}>
                                <Text style={[styles.countText, selectedCategory === cat.key && styles.countTextActive]}>
                                    {getCategoryCount(cat.key)}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <View style={styles.sortRow}>
                    <View style={styles.sortToggleContainer}>
                        <TouchableOpacity
                            style={[styles.sortSide, sortBy === 'recent' && styles.sortSideActive]}
                            onPress={() => setSortBy('recent')}
                        >
                            <Text style={[styles.sortSideText, sortBy === 'recent' && styles.sortSideTextActive]}>Recent</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.sortSide, sortBy === 'distance' && styles.sortSideActive]}
                            onPress={() => setSortBy('distance')}
                        >
                            <Text style={[styles.sortSideText, sortBy === 'distance' && styles.sortSideTextActive]}>Nearby</Text>
                        </TouchableOpacity>
                    </View>

                    {sortBy === 'distance' && (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.phaseScroll}>
                            {(Object.keys(PHASE_COORDS) as PhaseKey[]).map(phase => (
                                <TouchableOpacity
                                    key={phase}
                                    style={[styles.phaseChip, selectedPhase === phase && styles.phaseChipActive]}
                                    onPress={() => setSelectedPhase(phase)}
                                >
                                    <Text style={[styles.phaseText, selectedPhase === phase && styles.phaseTextActive]}>{phase}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}
                </View>
            </View>

            {loading && !refreshing ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loaderText}>Finding the best stays for you...</Text>
                </View>
            ) : (
                <FlatList
                    data={sortedRooms}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} />
                    }
                    renderItem={({ item }) => (
                        <RoomCard
                            room={item}
                            onPress={(id) => navigation.navigate('RoomDetail', { roomId: id })}
                        />
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons name="home-search-outline" size={80} color="#E2E8F0" />
                            <Text style={styles.emptyTitle}>No matching stays</Text>
                            <Text style={styles.emptySubtitle}>Try changing filters or searching a different area.</Text>
                            <TouchableOpacity
                                style={styles.clearBtn}
                                onPress={() => { setSelectedCategory('All'); setSearchQuery(''); setSortBy('recent'); }}
                            >
                                <Text style={styles.clearBtnText}>Clear All Filters</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('PostListing')}
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
    iconBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: '#F8FAFC',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: { fontSize: 22, fontWeight: '900', color: '#1E293B', letterSpacing: -0.5 },
    searchSection: { paddingHorizontal: 20, marginBottom: 16 },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 54,
    },
    searchInput: { flex: 1, marginLeft: 12, fontSize: 15, color: '#1E293B', fontWeight: '600' },
    filterSection: { marginBottom: 12 },
    categoryScroll: { paddingLeft: 20, paddingBottom: 16, gap: 10 },
    catChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingLeft: 12,
        paddingRight: 8,
        paddingVertical: 8,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#F1F5F9',
        gap: 8,
    },
    catChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    catLabel: { fontSize: 13, fontWeight: '700', color: '#64748B' },
    catLabelActive: { color: '#FFFFFF' },
    countBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
    countBadgeActive: { backgroundColor: 'rgba(255,255,255,0.2)' },
    countText: { fontSize: 10, fontWeight: '800', color: '#94A3B8' },
    countTextActive: { color: '#FFFFFF' },
    sortRow: { paddingHorizontal: 20, gap: 12 },
    sortToggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        padding: 4,
        width: 200,
    },
    sortSide: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
    sortSideActive: { backgroundColor: '#FFFFFF', ...SHADOWS.light },
    sortSideText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
    sortSideTextActive: { color: COLORS.primary },
    phaseScroll: { gap: 8 },
    phaseChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0' },
    phaseChipActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '05' },
    phaseText: { fontSize: 12, fontWeight: '700', color: '#64748B' },
    phaseTextActive: { color: COLORS.primary },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
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
