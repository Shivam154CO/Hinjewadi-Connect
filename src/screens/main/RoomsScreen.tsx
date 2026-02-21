import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme/theme';
import { RoomCard } from '../../components/RoomCard';
import { Room, MainTabScreenProps } from '../../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const CATEGORIES = [
    { key: 'All', label: 'All', count: 245 },
    { key: 'Room', label: 'Single Room', count: 89 },
    { key: 'PG', label: 'PG', count: 102 },
    { key: 'Flat', label: 'Flat', count: 54 },
];

const MOCK_ROOMS: Room[] = [
    {
        id: '1',
        ownerId: '101',
        title: '2BHK Fully Furnished Flat',
        description: 'Walking distance from Wipro, nice locality with all modern amenities.',
        price: 12000,
        deposit: 25000,
        area: 'Phase 1',
        type: 'Flat',
        furnishing: 'Fully-furnished',
        genderPreference: 'Any',
        amenities: ['WiFi', 'AC', 'Parking', 'Lift'],
        images: [],
        status: 'Available',
        contactPhone: '9876543210',
        createdAt: new Date().toISOString()
    },
    {
        id: '2',
        ownerId: '102',
        title: 'Shared PG for Girls - Safe & Secure',
        description: 'Safe and secure PG with mess facilities near IT park.',
        price: 6000,
        deposit: 5000,
        area: 'Phase 2',
        type: 'PG',
        furnishing: 'Fully-furnished',
        genderPreference: 'Female',
        amenities: ['Food', 'AC', 'Security', 'Laundry'],
        images: [],
        status: 'Available',
        contactPhone: '9876543211',
        createdAt: new Date().toISOString()
    },
    {
        id: '3',
        ownerId: '103',
        title: 'Comfortable Single Room in Phase 1',
        description: 'Spacious room with attached bathroom and balcony.',
        price: 7000,
        deposit: 15000,
        area: 'Phase 1',
        type: 'Room',
        furnishing: 'Semi-furnished',
        genderPreference: 'Male',
        amenities: ['Wifi', 'Bed', 'Cupboard'],
        images: [],
        status: 'Available',
        contactPhone: '9876543212',
        createdAt: new Date().toISOString()
    },
    {
        id: '4',
        ownerId: '104',
        title: '1BHK Near Phase 3 IT Park',
        description: 'Modern 1BHK flat with premium interiors.',
        price: 15000,
        deposit: 40000,
        area: 'Phase 3',
        type: 'Flat',
        furnishing: 'Fully-furnished',
        genderPreference: 'Any',
        amenities: ['TV', 'Fridge', 'Parking', 'Gym'],
        images: [],
        status: 'Available',
        contactPhone: '9876543213',
        createdAt: new Date().toISOString()
    },
];

export const RoomsScreen: React.FC<MainTabScreenProps<'Rooms'>> = ({ navigation }) => {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredRooms = MOCK_ROOMS.filter(room => {
        const categoryMatch = selectedCategory === 'All' || room.type === selectedCategory;
        const searchMatch = searchQuery === '' ||
            room.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            room.area.toLowerCase().includes(searchQuery.toLowerCase());
        return categoryMatch && searchMatch;
    });

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
                                {cat.label} ({cat.count})
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Room List */}
            <FlatList
                data={filteredRooms}
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
});
