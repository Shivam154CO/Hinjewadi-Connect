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
                    <MaterialCommunityIcons name="arrow-left" size={22} color="#111827" />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <View style={styles.headerLocation}>
                        <MaterialCommunityIcons name="map-marker" size={14} color={COLORS.primary} />
                        <Text style={styles.headerTitle}>{user?.area || 'Hinjewadi'}</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.filterIconBtn}>
                    <MaterialCommunityIcons name="tune-variant" size={20} color="#FFFFFF" />
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
                            <Text style={[styles.catLabel, selectedCategory === cat.key && styles.catLabelActive]}>
                                {cat.label}
                            </Text>
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

            {/* Result count */}
            {!loading && <Text style={styles.resultCount}>Found {sortedRooms.length} listings for you</Text>}

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
    container: { flex: 1, backgroundColor: '#0F0F0F' },
    header: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12,
    },
    iconBtn: {
        width: 40, height: 40, borderRadius: 10,
        backgroundColor: '#1C1C1E', alignItems: 'center', justifyContent: 'center',
    },
    headerCenter: { flex: 1, alignItems: 'center' },
    headerLocation: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    headerTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
    filterIconBtn: {
        width: 40, height: 40, borderRadius: 10,
        backgroundColor: '#00C896', alignItems: 'center', justifyContent: 'center',
    },

    searchSection: { paddingHorizontal: 16, marginBottom: 12 },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1C1C1E',
        borderRadius: 14,
        paddingHorizontal: 14,
        height: 50,
        gap: 10,
    },
    searchInput: { flex: 1, fontSize: 14, color: '#FFFFFF' },

    // Underline tab style — dark
    filterSection: { borderBottomWidth: 1, borderBottomColor: '#2C2C2E', marginBottom: 8 },
    categoryScroll: { paddingLeft: 16, gap: 0 },
    catChip: {
        paddingHorizontal: 16, paddingVertical: 12,
        borderBottomWidth: 2.5, borderBottomColor: 'transparent',
    },
    catChipActive: { borderBottomColor: '#00C896' },
    catLabel: { fontSize: 14, fontWeight: '600', color: '#636366' },
    catLabelActive: { color: '#00C896', fontWeight: '700' },

    // Unused but kept for type safety
    countBadge: {},
    countBadgeActive: {},
    countText: {},
    countTextActive: {},

    sortRow: { paddingHorizontal: 16, paddingBottom: 8, gap: 8 },
    sortToggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        padding: 3,
        alignSelf: 'flex-start',
    },
    sortSide: { paddingVertical: 6, paddingHorizontal: 16, alignItems: 'center', borderRadius: 6 },
    sortSideActive: { backgroundColor: '#FFFFFF', ...SHADOWS.light },
    sortSideText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
    sortSideTextActive: { color: COLORS.primary, fontWeight: '700' },
    phaseScroll: { gap: 8 },
    phaseChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
    phaseChipActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '10' },
    phaseText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
    phaseTextActive: { color: COLORS.primary, fontWeight: '700' },

    resultCount: { fontSize: 12, color: '#6B7280', paddingHorizontal: 16, paddingBottom: 8 },

    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
    loaderText: { marginTop: 12, fontSize: 14, color: '#6B7280' },
    listContent: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 100 },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, paddingHorizontal: 40 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 20 },
    emptySubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 6, lineHeight: 20 },
    clearBtn: { marginTop: 20, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, backgroundColor: COLORS.primary },
    clearBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
    fab: {
        position: 'absolute', bottom: 24, right: 16,
        width: 56, height: 56, borderRadius: 14,
        backgroundColor: COLORS.primary,
        alignItems: 'center', justifyContent: 'center',
        ...SHADOWS.medium,
    },
});

