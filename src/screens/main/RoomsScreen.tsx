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
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme/theme';
import { RoomCard } from '../../components/RoomCard';
import { Room, MainTabScreenProps } from '../../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { roomService } from '../../services/roomService';
import { PHASE_COORDS, PhaseKey, sortByPhaseDistance } from '../../utils/geoUtils';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

const CATEGORIES = [
    { key: 'All', label: 'All' },
    { key: 'Room', label: 'Single Room' },
    { key: 'PG', label: 'PG' },
    { key: 'Flat', label: 'Flat' },
];

export const RoomsScreen: React.FC<MainTabScreenProps<'Rooms'>> = ({ navigation }) => {
    const { user } = useAuth();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
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

    const categoryCounts = rooms.reduce((acc, room) => {
        acc[room.type] = (acc[room.type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Rooms & PGs</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <MaterialCommunityIcons name="magnify" size={20} color={COLORS.textSecondary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search rooms, PGs..."
                        placeholderTextColor={COLORS.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <MaterialCommunityIcons name="close-circle" size={18} color={COLORS.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Sort & Proximity Filter */}
            <View style={styles.sortContainer}>
                <View style={styles.sortToggle}>
                    <TouchableOpacity
                        style={[styles.sortBtn, sortBy === 'recent' && styles.sortBtnActive]}
                        onPress={() => setSortBy('recent')}
                    >
                        <MaterialCommunityIcons name="clock-outline" size={16} color={sortBy === 'recent' ? COLORS.white : COLORS.textSecondary} />
                        <Text style={[styles.sortBtnText, sortBy === 'recent' && styles.sortBtnTextActive]}>Recent</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.sortBtn, sortBy === 'distance' && styles.sortBtnActive]}
                        onPress={() => setSortBy('distance')}
                    >
                        <MaterialCommunityIcons name="map-marker-distance" size={16} color={sortBy === 'distance' ? COLORS.white : COLORS.textSecondary} />
                        <Text style={[styles.sortBtnText, sortBy === 'distance' && styles.sortBtnTextActive]}>Nearby</Text>
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
                                <Text style={[styles.phaseChipText, selectedPhase === phase && styles.phaseChipTextActive]}>{phase}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
            </View>

            {/* Category Filter */}
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
                            <Text style={[
                                styles.categoryChipText,
                                selectedCategory === cat.key && styles.categoryChipTextActive
                            ]}>
                                {cat.label} {cat.key === 'All' ? `(${rooms.length})` : `(${categoryCounts[cat.key] || 0})`}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Room List */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={sortedRooms}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <RoomCard
                            room={item}
                            onPress={(id) => navigation.navigate('RoomDetail', { roomId: id })}
                        />
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons name="home-off" size={60} color={COLORS.border} />
                            <Text style={styles.emptyText}>No listings found.</Text>
                            <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
                        </View>
                    }
                />
            )}

            {/* FAB */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('PostListing')}
            >
                <MaterialCommunityIcons name="plus" size={28} color={COLORS.white} />
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFB',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    searchContainer: {
        paddingHorizontal: SPACING.lg,
        marginBottom: SPACING.md,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.lg,
        paddingHorizontal: SPACING.md,
        height: 48,
        borderWidth: 1,
        borderColor: COLORS.border,
        gap: SPACING.sm,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: COLORS.text,
    },
    categoryContainer: {
        marginBottom: SPACING.md,
    },
    categoryScroll: {
        paddingHorizontal: SPACING.lg,
        gap: SPACING.sm,
    },
    categoryChip: {
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: COLORS.white,
        borderWidth: 1.5,
        borderColor: COLORS.border,
    },
    categoryChipActive: {
        backgroundColor: COLORS.success,
        borderColor: COLORS.success,
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
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
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
        backgroundColor: COLORS.success,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.medium,
    },
    sortContainer: {
        paddingHorizontal: SPACING.lg,
        marginBottom: SPACING.md,
        gap: SPACING.sm,
    },
    sortToggle: {
        flexDirection: 'row',
        backgroundColor: '#EEF2F6',
        borderRadius: BORDER_RADIUS.md,
        padding: 4,
    },
    sortBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: BORDER_RADIUS.md,
        gap: 6,
    },
    sortBtnActive: {
        backgroundColor: COLORS.primary,
        ...SHADOWS.light,
    },
    sortBtnText: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.textSecondary,
    },
    sortBtnTextActive: {
        color: COLORS.white,
    },
    phaseScroll: {
        gap: SPACING.sm,
    },
    phaseChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    phaseChipActive: {
        backgroundColor: COLORS.primary + '15',
        borderColor: COLORS.primary,
    },
    phaseChipText: {
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    phaseChipTextActive: {
        color: COLORS.primary,
    },
});
