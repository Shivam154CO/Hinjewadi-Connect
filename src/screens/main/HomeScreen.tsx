import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    FlatList,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MainTabScreenProps } from '../../types';
import { RoomCard } from '../../components/RoomCard';
import { ContactSheet } from '../../components/ContactSheet';
import { ContactInfo } from '../../utils/contactUtils';

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - SPACING.lg * 2 - SPACING.md) / 2;

// ── Phase coordinates for distance simulation ──
const PHASE_COORDS = {
    'Phase 1': { lat: 18.5912, lng: 73.7388 },
    'Phase 2': { lat: 18.5962, lng: 73.7148 },
    'Phase 3': { lat: 18.5723, lng: 73.6998 },
};

type PhaseKey = 'Phase 1' | 'Phase 2' | 'Phase 3';

// ── Mock data ──
const NEARBY_ROOMS = [
    {
        id: '1', ownerId: '1', title: '2BHK Fully Furnished Flat', description: 'Walking distance from Wipro.', price: 12000, deposit: 25000, area: 'Phase 1',
        type: 'Flat' as const, furnishing: 'Fully-furnished' as const, genderPreference: 'Any' as const,
        amenities: ['WiFi', 'AC', 'Parking'], images: [], status: 'Available' as const, contactPhone: '9876543210', createdAt: new Date().toISOString(), distance: '0.5 km',
    },
    {
        id: '2', ownerId: '2', title: 'Shared PG for Girls', description: 'Safe PG near IT park.', price: 6000, deposit: 5000, area: 'Phase 2',
        type: 'PG' as const, furnishing: 'Fully-furnished' as const, genderPreference: 'Female' as const,
        amenities: ['Food', 'AC', 'Security'], images: [], status: 'Available' as const, contactPhone: '9876543211', createdAt: new Date().toISOString(), distance: '1.2 km',
    },
    {
        id: '3', ownerId: '3', title: 'Single Room Phase 3', description: 'Spacious room with balcony.', price: 7000, deposit: 15000, area: 'Phase 3',
        type: 'Room' as const, furnishing: 'Semi-furnished' as const, genderPreference: 'Male' as const,
        amenities: ['WiFi', 'Bed', 'Cupboard'], images: [], status: 'Available' as const, contactPhone: '9876543212', createdAt: new Date().toISOString(), distance: '2.8 km',
    },
];

const NEARBY_JOBS = [
    { id: 'j1', title: 'Security Guard', company: 'Tech Park Services', area: 'Phase 1', salary: '₹15K-20K/mo', type: 'Full Time', distance: '0.3 km', urgent: true, contactPhone: '9876543001' },
    { id: 'j2', title: 'Office Boy', company: 'Infosys BPO', area: 'Phase 2', salary: '₹12K-15K/mo', type: 'Full Time', distance: '1.5 km', urgent: false, contactPhone: '9876543002' },
    { id: 'j3', title: 'Night Watchman', company: 'Blue Ridge Society', area: 'Phase 3', salary: '₹10K-14K/mo', type: 'Full Time', distance: '3.1 km', urgent: false, contactPhone: '9876543003' },
];

const NEARBY_SERVICES = [
    { id: 's1', name: 'Sunita Devi', category: 'Maid', rating: 4.8, area: 'Phase 1', availability: 'Available', distance: '0.2 km', initial: 'SD', color: '#E8D5F5', phone: '9000000001' },
    { id: 's2', name: 'Ramesh Kumar', category: 'Cook', rating: 4.9, area: 'Phase 2', availability: 'Available', distance: '1.0 km', initial: 'RK', color: '#D5E8F5', phone: '9000000002' },
    { id: 's3', name: 'Arun Driver', category: 'Driver', rating: 4.7, area: 'Phase 1', availability: 'Busy', distance: '0.8 km', initial: 'AD', color: '#F5D5E8', phone: '9000000005' },
];

const ACTION_CARDS = [
    { key: 'rooms', title: 'Find Home', subtitle: 'Room / PG / Flat', icon: 'home-outline', color: '#00BFA5', route: 'Rooms' },
    { key: 'jobs', title: 'Find Job', subtitle: 'Local opportunities', icon: 'briefcase-outline', color: '#448AFF', route: 'Jobs' },
    { key: 'services', title: 'Services', subtitle: 'Maid, Cook & more', icon: 'account-group-outline', color: '#7C3AED', route: 'Services' },
    { key: 'discover', title: 'Discover', subtitle: 'Explore Hinjewadi', icon: 'compass-outline', color: '#FF6D00', route: null },
];

// ── Distance helper ──
const getDistanceKm = (from: PhaseKey, to: PhaseKey): number => {
    const a = PHASE_COORDS[from];
    const b = PHASE_COORDS[to];
    const R = 6371;
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLng = ((b.lng - a.lng) * Math.PI) / 180;
    const s = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
};

const sortByPhaseDistance = <T extends { area: string }>(items: T[], selectedPhase: PhaseKey): (T & { distance: string })[] => {
    return items
        .map(item => {
            const dist = getDistanceKm(selectedPhase, item.area as PhaseKey);
            return { ...item, distance: dist < 1 ? `${(dist * 1000).toFixed(0)} m` : `${dist.toFixed(1)} km` };
        })
        .sort((a, b) => {
            const distA = getDistanceKm(selectedPhase, a.area as PhaseKey);
            const distB = getDistanceKm(selectedPhase, b.area as PhaseKey);
            return distA - distB;
        });
};

export const HomeScreen: React.FC<MainTabScreenProps<'Home'>> = ({ navigation }) => {
    const { user } = useAuth();
    const [selectedPhase, setSelectedPhase] = useState<PhaseKey>('Phase 1');
    const [detecting, setDetecting] = useState(false);
    const [sortBy, setSortBy] = useState<'distance' | 'recent'>('distance');
    const [contactSheetVisible, setContactSheetVisible] = useState(false);
    const [activeContact, setActiveContact] = useState<ContactInfo>({ name: '', phone: '' });

    // Sort data by distance to selected phase
    const sortedRooms = sortByPhaseDistance(NEARBY_ROOMS, selectedPhase);
    const sortedJobs = sortByPhaseDistance(NEARBY_JOBS, selectedPhase);
    const sortedServices = sortByPhaseDistance(NEARBY_SERVICES, selectedPhase);

    const openContactSheet = (contact: ContactInfo) => {
        setActiveContact(contact);
        setContactSheetVisible(true);
    };

    const handleAutoDetect = () => {
        setDetecting(true);
        // Simulate auto-detection
        setTimeout(() => {
            setSelectedPhase('Phase 1');
            setDetecting(false);
        }, 1500);
    };

    const handleCardPress = (route: string | null) => {
        if (route) navigation.navigate(route as any);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* ── HEADER ── */}
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <View>
                            <Text style={styles.appName}>Hinjewadi Connect</Text>
                            <Text style={styles.appSubtitle}>Your Local Community Platform</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.profileIndicator}
                            onPress={() => navigation.navigate('Profile')}
                        >
                            <MaterialCommunityIcons name="account" size={24} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>

                    {/* Location Bar */}
                    <View style={styles.locationBar}>
                        <View style={styles.locationLeft}>
                            <MaterialCommunityIcons name="map-marker" size={20} color={COLORS.primary} />
                            <View>
                                <Text style={styles.locationLabel}>Your Area</Text>
                                <Text style={styles.locationValue}>{selectedPhase}, Hinjewadi</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.detectButton} onPress={handleAutoDetect}>
                            {detecting ? (
                                <ActivityIndicator size="small" color={COLORS.primary} />
                            ) : (
                                <>
                                    <MaterialCommunityIcons name="crosshairs-gps" size={16} color={COLORS.primary} />
                                    <Text style={styles.detectText}>Detect</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Phase Selector */}
                    <View style={styles.phaseSelector}>
                        {(['Phase 1', 'Phase 2', 'Phase 3'] as PhaseKey[]).map(phase => (
                            <TouchableOpacity
                                key={phase}
                                style={[styles.phaseTab, selectedPhase === phase && styles.phaseTabActive]}
                                onPress={() => setSelectedPhase(phase)}
                            >
                                <View style={[styles.phaseDot, selectedPhase === phase && styles.phaseDotActive,
                                { backgroundColor: selectedPhase === phase ? COLORS[phase === 'Phase 1' ? 'phase1' : phase === 'Phase 2' ? 'phase2' : 'phase3'] : 'transparent' }
                                ]} />
                                <Text style={[styles.phaseTabText, selectedPhase === phase && styles.phaseTabTextActive]}>
                                    {phase}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.mainContent}>
                    {/* ── 2x2 ACTION GRID ── */}
                    <View style={styles.actionGrid}>
                        <View style={styles.gridRow}>
                            {ACTION_CARDS.slice(0, 2).map(card => (
                                <TouchableOpacity
                                    key={card.key}
                                    style={[styles.actionCard, { backgroundColor: card.color }]}
                                    onPress={() => handleCardPress(card.route)}
                                    activeOpacity={0.85}
                                >
                                    <View style={[styles.actionIconContainer, { backgroundColor: COLORS.white }]}>
                                        <MaterialCommunityIcons name={card.icon as any} size={28} color={card.color} />
                                    </View>
                                    <Text style={styles.actionTitle}>{card.title}</Text>
                                    <Text style={styles.actionSubtitle}>{card.subtitle}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <View style={styles.gridRow}>
                            {ACTION_CARDS.slice(2, 4).map(card => (
                                <TouchableOpacity
                                    key={card.key}
                                    style={[styles.actionCard, { backgroundColor: card.color }]}
                                    onPress={() => handleCardPress(card.route)}
                                    activeOpacity={0.85}
                                >
                                    <View style={[styles.actionIconContainer, { backgroundColor: COLORS.white }]}>
                                        <MaterialCommunityIcons name={card.icon as any} size={28} color={card.color} />
                                    </View>
                                    <Text style={styles.actionTitle}>{card.title}</Text>
                                    <Text style={styles.actionSubtitle}>{card.subtitle}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* ── SORT TOGGLE ── */}
                    <View style={styles.sortRow}>
                        <Text style={styles.discoverTitle}>
                            <MaterialCommunityIcons name="radar" size={18} color={COLORS.primary} /> Nearby Discovery
                        </Text>
                        <View style={styles.sortToggle}>
                            <TouchableOpacity
                                style={[styles.sortBtn, sortBy === 'distance' && styles.sortBtnActive]}
                                onPress={() => setSortBy('distance')}
                            >
                                <MaterialCommunityIcons name="map-marker-distance" size={14} color={sortBy === 'distance' ? COLORS.white : COLORS.textSecondary} />
                                <Text style={[styles.sortBtnText, sortBy === 'distance' && styles.sortBtnTextActive]}>Distance</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.sortBtn, sortBy === 'recent' && styles.sortBtnActive]}
                                onPress={() => setSortBy('recent')}
                            >
                                <MaterialCommunityIcons name="clock-outline" size={14} color={sortBy === 'recent' ? COLORS.white : COLORS.textSecondary} />
                                <Text style={[styles.sortBtnText, sortBy === 'recent' && styles.sortBtnTextActive]}>Recent</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* ── NEARBY ROOMS ── */}
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleRow}>
                            <View style={[styles.sectionIcon, { backgroundColor: '#E0F7F3' }]}>
                                <MaterialCommunityIcons name="home-outline" size={18} color="#00BFA5" />
                            </View>
                            <Text style={styles.sectionTitle}>Nearby Rooms</Text>
                            <View style={styles.countBadge}>
                                <Text style={styles.countText}>{sortedRooms.length}</Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={() => navigation.navigate('Rooms')}>
                            <View style={styles.viewAllRow}>
                                <Text style={styles.viewAllText}>View All</Text>
                                <MaterialCommunityIcons name="chevron-right" size={18} color={COLORS.primary} />
                            </View>
                        </TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                        {sortedRooms.map(room => (
                            <View key={room.id} style={styles.horizontalCard}>
                                <View style={[styles.miniCard, SHADOWS.light]}>
                                    <View style={styles.miniImagePlaceholder}>
                                        <MaterialCommunityIcons name="home-variant" size={36} color={COLORS.border} />
                                        <View style={styles.distanceBadge}>
                                            <MaterialCommunityIcons name="map-marker" size={10} color={COLORS.white} />
                                            <Text style={styles.distanceText}>{room.distance}</Text>
                                        </View>
                                        <View style={[styles.typeBadge, { backgroundColor: room.type === 'Flat' ? '#2563EB' : room.type === 'PG' ? '#7C3AED' : '#00BFA5' }]}>
                                            <Text style={styles.typeText}>{room.type}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.miniCardContent}>
                                        <Text style={styles.miniTitle} numberOfLines={1}>{room.title}</Text>
                                        <Text style={styles.miniArea}>{room.area}</Text>
                                        <View style={styles.miniPriceRow}>
                                            <Text style={styles.miniPrice}>₹{room.price.toLocaleString()}</Text>
                                            <Text style={styles.miniPriceLabel}>/month</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </ScrollView>

                    {/* ── NEARBY JOBS ── */}
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleRow}>
                            <View style={[styles.sectionIcon, { backgroundColor: '#E3F0FF' }]}>
                                <MaterialCommunityIcons name="briefcase-outline" size={18} color="#448AFF" />
                            </View>
                            <Text style={styles.sectionTitle}>Nearby Jobs</Text>
                            <View style={styles.countBadge}>
                                <Text style={styles.countText}>{sortedJobs.length}</Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={() => navigation.navigate('Jobs')}>
                            <View style={styles.viewAllRow}>
                                <Text style={styles.viewAllText}>View All</Text>
                                <MaterialCommunityIcons name="chevron-right" size={18} color={COLORS.primary} />
                            </View>
                        </TouchableOpacity>
                    </View>
                    {sortedJobs.map(job => (
                        <TouchableOpacity
                            key={job.id}
                            style={[styles.jobRow, SHADOWS.light]}
                            onPress={() => navigation.navigate('JobDetail', { jobId: job.id })}
                            activeOpacity={0.92}
                        >
                            <View style={styles.jobIconCircle}>
                                <MaterialCommunityIcons name="briefcase" size={20} color="#448AFF" />
                            </View>
                            <View style={styles.jobInfo}>
                                <View style={styles.jobTitleRow}>
                                    <Text style={styles.jobTitle} numberOfLines={1}>{job.title}</Text>
                                    {job.urgent && (
                                        <View style={styles.urgentChip}>
                                            <MaterialCommunityIcons name="lightning-bolt" size={10} color={COLORS.white} />
                                            <Text style={styles.urgentChipText}>Urgent</Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={styles.jobCompany}>{job.company}</Text>
                                <View style={styles.jobMetaRow}>
                                    <Text style={styles.jobSalary}>{job.salary}</Text>
                                    <View style={styles.jobDistChip}>
                                        <MaterialCommunityIcons name="map-marker" size={10} color={COLORS.primary} />
                                        <Text style={styles.jobDistText}>{job.distance}</Text>
                                    </View>
                                </View>
                            </View>
                            <TouchableOpacity
                                style={styles.callIconBtn}
                                onPress={() => openContactSheet({
                                    name: job.company,
                                    phone: job.contactPhone,
                                    context: 'job',
                                    contextTitle: job.title,
                                    contextCompany: job.company,
                                })}
                            >
                                <MaterialCommunityIcons name="phone" size={18} color={COLORS.success} />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ))}

                    {/* ── NEARBY SERVICES ── */}
                    <View style={[styles.sectionHeader, { marginTop: SPACING.lg }]}>
                        <View style={styles.sectionTitleRow}>
                            <View style={[styles.sectionIcon, { backgroundColor: '#F0E6FF' }]}>
                                <MaterialCommunityIcons name="account-group-outline" size={18} color="#7C3AED" />
                            </View>
                            <Text style={styles.sectionTitle}>Nearby Services</Text>
                            <View style={styles.countBadge}>
                                <Text style={styles.countText}>{sortedServices.length}</Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={() => navigation.navigate('Services')}>
                            <View style={styles.viewAllRow}>
                                <Text style={styles.viewAllText}>View All</Text>
                                <MaterialCommunityIcons name="chevron-right" size={18} color={COLORS.primary} />
                            </View>
                        </TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                        {sortedServices.map(svc => (
                            <TouchableOpacity
                                key={svc.id}
                                style={[styles.serviceCard, SHADOWS.light]}
                                onPress={() => navigation.navigate('ServiceProviderDetail', { providerId: svc.id })}
                                activeOpacity={0.92}
                            >
                                <View style={[styles.serviceAvatar, { backgroundColor: svc.color }]}>
                                    <Text style={styles.serviceInitial}>{svc.initial}</Text>
                                </View>
                                <Text style={styles.serviceName} numberOfLines={1}>{svc.name}</Text>
                                <Text style={styles.serviceCategory}>{svc.category}</Text>
                                <View style={styles.serviceRatingRow}>
                                    <MaterialCommunityIcons name="star" size={13} color="#FFB800" />
                                    <Text style={styles.serviceRating}>{svc.rating}</Text>
                                </View>
                                <View style={styles.serviceDistRow}>
                                    <MaterialCommunityIcons name="map-marker" size={12} color={COLORS.textSecondary} />
                                    <Text style={styles.serviceDistText}>{svc.distance}</Text>
                                </View>
                                <View style={[
                                    styles.serviceAvailBadge,
                                    { backgroundColor: svc.availability === 'Available' ? '#E8F5E9' : '#FFF3E0' }
                                ]}>
                                    <View style={[
                                        styles.serviceAvailDot,
                                        { backgroundColor: svc.availability === 'Available' ? COLORS.success : '#FF9800' }
                                    ]} />
                                    <Text style={[
                                        styles.serviceAvailText,
                                        { color: svc.availability === 'Available' ? COLORS.success : '#FF9800' }
                                    ]}>{svc.availability}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <View style={{ height: SPACING.xxl }} />
                </View>
            </ScrollView>

            {user?.role === 'employer' && (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => navigation.navigate('PostListing')}
                >
                    <MaterialCommunityIcons name="plus" size={30} color={COLORS.white} />
                </TouchableOpacity>
            )}

            <ContactSheet
                visible={contactSheetVisible}
                onClose={() => setContactSheetVisible(false)}
                contact={activeContact}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    // ── Header ──
    header: {
        backgroundColor: COLORS.primary,
        padding: SPACING.lg,
        paddingBottom: SPACING.xl + 10,
        borderBottomLeftRadius: BORDER_RADIUS.xl,
        borderBottomRightRadius: BORDER_RADIUS.xl,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: SPACING.md,
        marginBottom: SPACING.md,
    },
    appName: {
        color: COLORS.white,
        fontSize: 22,
        fontWeight: '800',
    },
    appSubtitle: {
        color: COLORS.white + 'CC',
        fontSize: 14,
        fontWeight: '500',
    },
    profileIndicator: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.white + '20',
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Location bar
    locationBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.sm,
        paddingHorizontal: SPACING.md,
        marginBottom: SPACING.md,
    },
    locationLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    locationLabel: {
        fontSize: 10,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    locationValue: {
        fontSize: 14,
        color: COLORS.text,
        fontWeight: '700',
    },
    detectButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E3F0FF',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: BORDER_RADIUS.full,
        gap: 4,
    },
    detectText: {
        fontSize: 12,
        color: COLORS.primary,
        fontWeight: '700',
    },
    // Phase selector
    phaseSelector: {
        flexDirection: 'row',
        backgroundColor: COLORS.white + '15',
        borderRadius: BORDER_RADIUS.md,
        padding: 4,
    },
    phaseTab: {
        flex: 1,
        flexDirection: 'row',
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: BORDER_RADIUS.sm,
        gap: 6,
    },
    phaseTabActive: {
        backgroundColor: COLORS.white,
    },
    phaseDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    phaseDotActive: {},
    phaseTabText: {
        color: COLORS.white,
        fontWeight: '600',
        fontSize: 14,
    },
    phaseTabTextActive: {
        color: COLORS.primary,
    },
    // Main
    mainContent: {
        padding: SPACING.lg,
    },
    // 2x2 Grid
    actionGrid: {
        marginTop: -SPACING.xl,
        marginBottom: SPACING.lg,
        gap: SPACING.md,
    },
    gridRow: {
        flexDirection: 'row',
        gap: SPACING.md,
    },
    actionCard: {
        flex: 1,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        paddingVertical: SPACING.lg,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.medium,
        minHeight: CARD_SIZE * 0.85,
    },
    actionIconContainer: {
        width: 52,
        height: 52,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.sm,
        ...SHADOWS.light,
    },
    actionTitle: {
        color: COLORS.white,
        fontSize: 15,
        fontWeight: '700',
        textAlign: 'center',
    },
    actionSubtitle: {
        color: COLORS.white + 'BB',
        fontSize: 11,
        fontWeight: '500',
        textAlign: 'center',
        marginTop: 2,
    },
    // Sort
    sortRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    discoverTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: COLORS.text,
    },
    sortToggle: {
        flexDirection: 'row',
        backgroundColor: '#EEF2F6',
        borderRadius: BORDER_RADIUS.full,
        padding: 3,
    },
    sortBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: BORDER_RADIUS.full,
        gap: 4,
    },
    sortBtnActive: {
        backgroundColor: COLORS.primary,
    },
    sortBtnText: {
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    sortBtnTextActive: {
        color: COLORS.white,
    },
    // Sections
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
        marginTop: SPACING.md,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sectionIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
    },
    countBadge: {
        backgroundColor: COLORS.primary + '15',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: BORDER_RADIUS.full,
    },
    countText: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.primary,
    },
    viewAllRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    viewAllText: {
        color: COLORS.primary,
        fontSize: 13,
        fontWeight: '600',
    },
    // Horizontal scroll
    horizontalScroll: {
        paddingRight: SPACING.lg,
        gap: SPACING.md,
    },
    horizontalCard: {
        width: width * 0.52,
    },
    // Mini Room Card
    miniCard: {
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.lg,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    miniImagePlaceholder: {
        height: 100,
        backgroundColor: '#EEF2F6',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    distanceBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: BORDER_RADIUS.full,
        gap: 3,
    },
    distanceText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: '700',
    },
    typeBadge: {
        position: 'absolute',
        bottom: 8,
        left: 8,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: BORDER_RADIUS.full,
    },
    typeText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: '700',
    },
    miniCardContent: {
        padding: SPACING.sm,
    },
    miniTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.text,
    },
    miniArea: {
        fontSize: 11,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    miniPriceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginTop: 4,
    },
    miniPrice: {
        fontSize: 15,
        fontWeight: '800',
        color: COLORS.primary,
    },
    miniPriceLabel: {
        fontSize: 10,
        color: COLORS.textSecondary,
        marginLeft: 2,
    },
    // Job Row
    jobRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
        gap: SPACING.md,
    },
    jobIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#E3F0FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    jobInfo: {
        flex: 1,
    },
    jobTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    jobTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.text,
        flex: 1,
    },
    urgentChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FF5252',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: BORDER_RADIUS.full,
        gap: 2,
    },
    urgentChipText: {
        color: COLORS.white,
        fontSize: 9,
        fontWeight: '700',
    },
    jobCompany: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    jobMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 4,
    },
    jobSalary: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.primary,
    },
    jobDistChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F4F8',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: BORDER_RADIUS.full,
        gap: 3,
    },
    jobDistText: {
        fontSize: 10,
        color: COLORS.primary,
        fontWeight: '600',
    },
    callIconBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E8F5E9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Service Cards
    serviceCard: {
        width: 130,
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    serviceAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
    },
    serviceInitial: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.secondary,
    },
    serviceName: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.text,
        textAlign: 'center',
    },
    serviceCategory: {
        fontSize: 11,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    serviceRatingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        marginTop: 4,
    },
    serviceRating: {
        fontSize: 12,
        fontWeight: '700',
        color: '#F59E0B',
    },
    serviceDistRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        marginTop: 4,
    },
    serviceDistText: {
        fontSize: 10,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    serviceAvailBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: BORDER_RADIUS.full,
        gap: 4,
        marginTop: 6,
    },
    serviceAvailDot: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
    },
    serviceAvailText: {
        fontSize: 9,
        fontWeight: '700',
    },
    // FAB
    fab: {
        position: 'absolute',
        bottom: SPACING.lg,
        right: SPACING.lg,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.secondary,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.medium,
    },
    featuredPlaceholder: {
        marginTop: SPACING.sm,
    },
});
