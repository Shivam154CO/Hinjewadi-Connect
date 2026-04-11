import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    TextInput, ActivityIndicator, RefreshControl, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { MainTabScreenProps, Room, Job } from '../../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { roomService } from '../../services/roomService';
import { jobService } from '../../services/jobService';
import { useTranslation } from 'react-i18next';

const HomeScreen: React.FC<MainTabScreenProps<'Home'>> = ({ navigation }) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [featuredRooms, setFeaturedRooms] = useState<Room[]>([]);
    const [recentJobs, setRecentJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');

    const userName = user?.name?.split(' ')[0] || 'there';

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [rooms, jobs] = await Promise.all([
                roomService.getRooms(6),
                jobService.getJobs(4),
            ]);
            setFeaturedRooms(rooms);
            setRecentJobs(jobs);
        } catch { } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingWrap}>
                <ActivityIndicator size="large" color="#00C896" />
            </View>
        );
    }

    return (
        <View style={styles.root}>
            <SafeAreaView edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <View style={styles.locationRow}>
                            <MaterialCommunityIcons name="map-marker" size={14} color="#00C896" />
                            <Text style={styles.locationText}>{user?.area || 'Hinjewadi'}, Pune</Text>
                        </View>
                        <Text style={styles.greeting}>Hello, {userName} 👋</Text>
                    </View>
                    <TouchableOpacity style={styles.avatarBtn} onPress={() => navigation.navigate('Profile')}>
                        <View style={styles.avatarCircle}>
                            <Text style={styles.avatarInitial}>{user?.name?.charAt(0).toUpperCase() || 'U'}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scroll}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor="#00C896" />}
            >
                {/* Search */}
                <View style={styles.searchWrap}>
                    <MaterialCommunityIcons name="magnify" size={20} color="#636366" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search rooms, jobs..."
                        placeholderTextColor="#636366"
                        value={search}
                        onChangeText={setSearch}
                    />
                    <View style={styles.filterBtn}>
                        <MaterialCommunityIcons name="tune-variant" size={16} color="#00C896" />
                    </View>
                </View>

                {/* Quick Categories */}
                <View style={styles.catRow}>
                    {[
                        { label: 'Rooms', icon: 'home-variant', screen: 'Rooms', color: '#007AFF' },
                        { label: 'Jobs', icon: 'briefcase', screen: 'Jobs', color: '#00C896' },
                        { label: 'Services', icon: 'account-group', screen: 'Services', color: '#FF9500' },
                        { label: 'Post', icon: 'plus', screen: 'PostListing', color: '#AF52DE' },
                    ].map((cat) => (
                        <TouchableOpacity
                            key={cat.label}
                            style={styles.catItem}
                            onPress={() => navigation.navigate(cat.screen as any)}
                            activeOpacity={0.75}
                        >
                            <View style={[styles.catIcon, { backgroundColor: cat.color + '20' }]}>
                                <MaterialCommunityIcons name={cat.icon as any} size={22} color={cat.color} />
                            </View>
                            <Text style={styles.catLabel}>{cat.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Available Rooms */}
                {featuredRooms.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHead}>
                            <Text style={styles.sectionTitle}>Available Rooms</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Rooms')}>
                                <Text style={styles.seeAll}>See all</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Image grid — 2 col like reference */}
                        <View style={styles.roomGrid}>
                            {featuredRooms.slice(0, 4).map((room, idx) => (
                                <TouchableOpacity
                                    key={room.id}
                                    style={[styles.roomGridCard, idx % 2 !== 0 && { marginTop: 28 }]}
                                    onPress={() => navigation.navigate('RoomDetail', { roomId: room.id })}
                                    activeOpacity={0.85}
                                >
                                    <View style={styles.roomGridImg}>
                                        {room.images?.[0] ? (
                                            <Image source={{ uri: room.images[0] }} style={StyleSheet.absoluteFill} />
                                        ) : (
                                            <View style={styles.roomGridPlaceholder}>
                                                <MaterialCommunityIcons name="home-city-outline" size={32} color="#3A3A3C" />
                                            </View>
                                        )}
                                        <View style={styles.roomGridOverlay} />
                                        <View style={styles.roomGridBadge}>
                                            <Text style={styles.roomGridType}>{room.type}</Text>
                                        </View>
                                        <TouchableOpacity style={styles.roomGridArrow}>
                                            <MaterialCommunityIcons name="arrow-top-right" size={14} color="#000" />
                                        </TouchableOpacity>
                                    </View>
                                    <View style={styles.roomGridInfo}>
                                        <Text style={styles.roomGridPrice}>₹{room.price.toLocaleString()}<Text style={styles.roomGridPriceSub}>/mo</Text></Text>
                                        <Text style={styles.roomGridArea} numberOfLines={1}>{room.area}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {/* Recent Jobs */}
                {recentJobs.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHead}>
                            <Text style={styles.sectionTitle}>Recent Jobs</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Jobs')}>
                                <Text style={styles.seeAll}>See all</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                            {recentJobs.map((job) => (
                                <TouchableOpacity
                                    key={job.id}
                                    style={styles.jobCard}
                                    onPress={() => navigation.navigate('JobDetail', { jobId: job.id })}
                                    activeOpacity={0.85}
                                >
                                    <View style={styles.jobIconWrap}>
                                        <MaterialCommunityIcons name="briefcase-outline" size={20} color="#00C896" />
                                    </View>
                                    <Text style={styles.jobTitle} numberOfLines={2}>{job.title}</Text>
                                    <Text style={styles.jobCompany} numberOfLines={1}>{job.company}</Text>
                                    <View style={styles.jobSalaryTag}>
                                        <Text style={styles.jobSalaryText}>{job.salary}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                <View style={{ height: 110 }} />
            </ScrollView>
        </View>
    );
};

export default HomeScreen;

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#0F0F0F' },
    loadingWrap: { flex: 1, backgroundColor: '#0F0F0F', alignItems: 'center', justifyContent: 'center' },
    scroll: { paddingHorizontal: 20 },

    // Header
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16,
    },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
    locationText: { fontSize: 12, color: '#AEAEB2', fontWeight: '500' },
    greeting: { fontSize: 22, fontWeight: '700', color: '#FFFFFF', letterSpacing: -0.4 },
    avatarBtn: {},
    avatarCircle: {
        width: 42, height: 42, borderRadius: 14,
        backgroundColor: '#00C896', alignItems: 'center', justifyContent: 'center',
    },
    avatarInitial: { fontSize: 18, fontWeight: '700', color: '#000000' },

    // Search
    searchWrap: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#1C1C1E', borderRadius: 14,
        paddingHorizontal: 14, height: 50, gap: 10, marginBottom: 24,
    },
    searchInput: { flex: 1, fontSize: 14, color: '#FFFFFF' },
    filterBtn: {
        width: 32, height: 32, borderRadius: 10,
        backgroundColor: '#00C89618', alignItems: 'center', justifyContent: 'center',
    },

    // Categories
    catRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 28 },
    catItem: { alignItems: 'center', gap: 8 },
    catIcon: {
        width: 58, height: 58, borderRadius: 18,
        alignItems: 'center', justifyContent: 'center',
    },
    catLabel: { fontSize: 12, fontWeight: '600', color: '#AEAEB2' },

    // Section
    section: { marginBottom: 28 },
    sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
    seeAll: { fontSize: 13, color: '#00C896', fontWeight: '600' },

    // Room grid (reference style — 2 col offset)
    roomGrid: { flexDirection: 'row', gap: 12 },
    roomGridCard: { flex: 1 },
    roomGridImg: {
        height: 170, borderRadius: 20, overflow: 'hidden',
        backgroundColor: '#1C1C1E', position: 'relative',
    },
    roomGridPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    roomGridOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    roomGridBadge: {
        position: 'absolute', bottom: 10, left: 10,
    },
    roomGridType: { fontSize: 11, color: '#FFFFFF', fontWeight: '700' },
    roomGridArrow: {
        position: 'absolute', bottom: 10, right: 10,
        width: 28, height: 28, borderRadius: 8,
        backgroundColor: '#00C896',
        alignItems: 'center', justifyContent: 'center',
    },
    roomGridInfo: { paddingTop: 10, paddingHorizontal: 2 },
    roomGridPrice: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
    roomGridPriceSub: { fontSize: 11, fontWeight: '400', color: '#636366' },
    roomGridArea: { fontSize: 12, color: '#AEAEB2', marginTop: 2 },

    // Job cards
    jobCard: {
        width: 160, backgroundColor: '#1C1C1E', borderRadius: 18, padding: 14,
        shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3, shadowRadius: 16, elevation: 6,
    },
    jobIconWrap: {
        width: 38, height: 38, borderRadius: 12,
        backgroundColor: '#00C89620', alignItems: 'center',
        justifyContent: 'center', marginBottom: 12,
    },
    jobTitle: { fontSize: 14, fontWeight: '600', color: '#FFFFFF', lineHeight: 20 },
    jobCompany: { fontSize: 12, color: '#636366', marginTop: 3 },
    jobSalaryTag: {
        marginTop: 12, backgroundColor: '#00C89615', borderRadius: 8,
        paddingHorizontal: 8, paddingVertical: 5, alignSelf: 'flex-start',
    },
    jobSalaryText: { fontSize: 12, fontWeight: '700', color: '#00C896' },
});
