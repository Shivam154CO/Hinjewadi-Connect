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
    StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { MainTabScreenProps } from '../../types';
import { RoomCard } from '../../components/RoomCard';
import { ContactSheet } from '../../components/ContactSheet';
import { ContactInfo } from '../../utils/contactUtils';
import { roomService } from '../../services/roomService';
import { jobService } from '../../services/jobService';
import { providerService } from '../../services/providerService';
import { Room, Job, ServiceProvider } from '../../types';

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - SPACING.lg * 2 - SPACING.md) / 2;

const ACTION_CARDS = [
    { key: 'rooms', title: 'Find Home', subtitle: 'Room / PG / Flat', icon: 'home-outline', color: '#00BFA5', route: 'Rooms' },
    { key: 'jobs', title: 'Find Job', subtitle: 'Local opportunities', icon: 'briefcase-outline', color: '#448AFF', route: 'Jobs' },
    { key: 'services', title: 'Services', subtitle: 'Maid, Cook & more', icon: 'account-group-outline', color: '#7C3AED', route: 'Services' },
    { key: 'discover', title: 'Discover', subtitle: 'Explore Hinjewadi', icon: 'compass-outline', color: '#FF6D00', route: null },
];

import { PHASE_COORDS, PhaseKey, sortByPhaseDistance, findNearestPhase, isWithinHinjewadiRange, LocationCoords } from '../../utils/geoUtils';

export const HomeScreen: React.FC<MainTabScreenProps<'Home'>> = ({ navigation }) => {
    const { user } = useAuth();
    const [selectedPhase, setSelectedPhase] = useState<PhaseKey | null>(null);
    const [detecting, setDetecting] = useState(true);
    const [sortBy, setSortBy] = useState<'distance' | 'recent'>('distance');
    const [contactSheetVisible, setContactSheetVisible] = useState(false);
    const [activeContact, setActiveContact] = useState<ContactInfo>({ name: '', phone: '' });
    const [isOutOfRange, setIsOutOfRange] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [userCoords, setUserCoords] = useState<LocationCoords | null>(null);
    const [userAddress, setUserAddress] = useState<string | null>(null);

    const [rooms, setRooms] = useState<Room[]>([]);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [providers, setProviders] = useState<ServiceProvider[]>([]);
    const [loading, setLoading] = useState(true);


    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [roomData, jobData, providerData] = await Promise.all([
                roomService.getRooms(),
                jobService.getJobs(),
                providerService.getProviders()
            ]);
            setRooms(roomData);
            setJobs(jobData);
            setProviders(providerData);
        } catch (error) {
            console.error('Failed to fetch home data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Sort data by distance to selected phase OR exact user coords
    const sortedRooms = sortByPhaseDistance(rooms, selectedPhase || 'Phase 1', userCoords || undefined);
    const sortedJobs = sortByPhaseDistance(jobs, selectedPhase || 'Phase 1', userCoords || undefined);
    const sortedServices = sortByPhaseDistance(providers, selectedPhase || 'Phase 1', userCoords || undefined);

    const openContactSheet = (contact: ContactInfo) => {
        setActiveContact(contact);
        setContactSheetVisible(true);
    };

    const handleAutoDetect = async () => {
        try {
            setDetecting(true);
            setLocationError(null);

            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setDetecting(false);
                setLocationError('Location permission denied');
                return;
            }

            // Use a timeout to handle slow/no network gracefully
            const locationPromise = Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });
            const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('Location timeout')), 15000)
            );

            let location;
            try {
                location = await Promise.race([locationPromise, timeoutPromise]);
            } catch (e) {
                setDetecting(false);
                setLocationError('Slow network – tap to retry');
                return;
            }

            const { latitude, longitude } = location.coords;

            // Check if within Hinjewadi range
            if (isWithinHinjewadiRange(latitude, longitude)) {
                const { phase } = findNearestPhase(latitude, longitude);

                setUserCoords({ lat: latitude, lng: longitude });
                setSelectedPhase(phase);
                setIsOutOfRange(false);

                try {
                    const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
                    if (address) {
                        const addrString = `${address.name || ''} ${address.street || ''}, ${address.district || ''}`.trim();
                        setUserAddress(addrString || 'Detected Location');
                    }
                } catch (e) {
                    setUserAddress('Detected Location');
                }

            } else {
                setIsOutOfRange(true);
            }
        } catch (error) {
            console.error('Location detection error:', error);
            setLocationError('Could not detect location – tap to retry');
        } finally {
            setDetecting(false);
        }
    };

    useEffect(() => {
        fetchAllData();
        handleAutoDetect();
    }, []);

    const handleCardPress = (route: string | null) => {
        if (route) navigation.navigate(route as any);
    };

    const getRoleData = () => {
        switch (user?.role) {
            case 'tenant':
                return {
                    subtitle: 'Finding you the best rooms nearby',
                    cards: ACTION_CARDS // Rooms first
                };
            case 'worker':
                return {
                    subtitle: 'Find new work opportunities locally',
                    cards: [ACTION_CARDS[1], ACTION_CARDS[2], ACTION_CARDS[0], ACTION_CARDS[3]] // Jobs/Services first
                };
            case 'employer':
                return {
                    subtitle: 'Manage your listings & community leads',
                    cards: [
                        { key: 'dashboard', title: 'Dashboard', subtitle: 'Manage listings', icon: 'view-dashboard', color: COLORS.primary, route: 'ManagePosts' as any },
                        ...ACTION_CARDS
                    ]
                };
            default:
                return {
                    subtitle: 'Your Local Community Platform',
                    cards: ACTION_CARDS
                };
        }
    };

    const roleData = getRoleData();

    if (isOutOfRange) {
        return (
            <View style={styles.restrictedContainer}>
                <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
                <SafeAreaView style={styles.restrictedContent}>
                    <View style={styles.restrictedIconWrapper}>
                        <View style={styles.radarPulse} />
                        <MaterialCommunityIcons name="map-marker-off" size={80} color={COLORS.primary} />
                    </View>

                    <Text style={styles.restrictedTitle}>Access Restricted</Text>
                    <Text style={styles.restrictedSubtitle}>
                        Saarthi is a hyperlocal platform exclusively for the Hinjewadi IT Park community.
                    </Text>

                    <View style={styles.restrictedInfoBox}>
                        <MaterialCommunityIcons name="information-outline" size={20} color={COLORS.textSecondary} />
                        <Text style={styles.restrictedInfoText}>
                            Your current location appears to be outside Hinjewadi (Phase 1, 2, or 3).
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={handleAutoDetect}
                    >
                        <Text style={styles.retryButtonText}>Try Detect Again</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.manualButton}
                        onPress={() => setIsOutOfRange(false)}
                    >
                        <Text style={styles.manualButtonText}>Browse Manually</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                {/* ── HEADER ── (extends to top) */}
                <View style={styles.header}>
                    <SafeAreaView edges={['top']} />
                    <View style={styles.headerTop}>
                        <View>
                            <Text style={styles.appName}>Saarthi</Text>
                            <Text style={styles.appSubtitle}>{roleData.subtitle}</Text>
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
                            <View style={styles.locationTextWrap}>
                                <Text style={styles.locationLabel}>Current Location</Text>
                                <Text style={styles.locationValue} numberOfLines={1}>
                                    {detecting ? 'Detecting...' : (userAddress || 'Hinjewadi Community')}
                                </Text>
                            </View>
                        </View>
                        {detecting && (
                            <ActivityIndicator size="small" color={COLORS.primary} style={{ marginLeft: 8 }} />
                        )}
                        {!detecting && locationError && (
                            <TouchableOpacity style={styles.retryChip} onPress={handleAutoDetect}>
                                <MaterialCommunityIcons name="refresh" size={14} color={'#E65100'} />
                                <Text style={styles.retryChipText}>Retry</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    {!detecting && locationError && (
                        <View style={styles.locationErrorBanner}>
                            <MaterialCommunityIcons name="wifi-alert" size={14} color={'#E65100'} />
                            <Text style={styles.locationErrorText}>{locationError}</Text>
                        </View>
                    )}

                    {/* Phase Selector */}
                    <View style={styles.phaseSelector}>
                        {(Object.keys(PHASE_COORDS) as PhaseKey[]).map(phase => (
                            <TouchableOpacity
                                key={phase}
                                style={[styles.phaseTab, selectedPhase === phase && styles.phaseTabActive]}
                                onPress={() => setSelectedPhase(phase)}
                            >
                                <View style={[styles.phaseDot, selectedPhase === phase && styles.phaseDotActive,
                                { backgroundColor: (selectedPhase === phase || (!selectedPhase && detecting)) ? COLORS[phase === 'Phase 1' ? 'phase1' : phase === 'Phase 2' ? 'phase2' : 'phase3'] : 'transparent' }
                                ]} />
                                <Text style={[styles.phaseTabText, selectedPhase === phase && styles.phaseTabTextActive]}>
                                    {phase}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.mainContent}>
                    {/* Action Grid */}
                    <View style={styles.actionGrid}>
                        <View style={styles.gridRow}>
                            {roleData.cards.slice(0, 2).map((card) => (
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
                        {roleData.cards.length > 2 && (
                            <View style={styles.gridRow}>
                                {roleData.cards.slice(2, 4).map((card) => (
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
                        )}
                        {roleData.cards.length > 4 && (
                            <View style={styles.gridRow}>
                                {roleData.cards.slice(4, 6).map((card) => (
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
                        )}
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
                        {sortedServices.map((svc: any) => (
                            <TouchableOpacity
                                key={svc.id}
                                style={[styles.serviceCard, SHADOWS.light]}
                                onPress={() => navigation.navigate('ServiceProviderDetail', { providerId: svc.id })}
                                activeOpacity={0.92}
                            >
                                <View style={[styles.serviceAvatar, { backgroundColor: svc.avatarColor }]}>
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
            {/* Bottom safe area padding for devices with home indicator */}
            <SafeAreaView edges={['bottom']} />
        </View>
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
        flex: 1,
    },
    locationTextWrap: {
        flex: 1,
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
    retryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF3E0',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: BORDER_RADIUS.full,
        gap: 4,
        marginLeft: 8,
    },
    retryChipText: {
        fontSize: 11,
        color: '#E65100',
        fontWeight: '700',
    },
    locationErrorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF3E0',
        borderRadius: BORDER_RADIUS.sm,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 6,
        gap: 6,
        marginBottom: SPACING.sm,
    },
    locationErrorText: {
        fontSize: 11,
        color: '#E65100',
        fontWeight: '600',
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
    // Restricted Screen
    restrictedContainer: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    restrictedContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.xl,
    },
    restrictedIconWrapper: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: COLORS.primary + '10',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.xl,
        position: 'relative',
    },
    radarPulse: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        borderWidth: 2,
        borderColor: COLORS.primary,
        opacity: 0.2,
    },
    restrictedTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: COLORS.text,
        marginBottom: SPACING.md,
        textAlign: 'center',
    },
    restrictedSubtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: SPACING.xl,
    },
    restrictedInfoBox: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
        gap: SPACING.sm,
        marginBottom: SPACING.xxl,
    },
    restrictedInfoText: {
        flex: 1,
        fontSize: 13,
        color: COLORS.textSecondary,
        lineHeight: 18,
    },
    retryButton: {
        backgroundColor: COLORS.primary,
        width: '100%',
        paddingVertical: 16,
        borderRadius: BORDER_RADIUS.lg,
        alignItems: 'center',
        marginBottom: SPACING.md,
        ...SHADOWS.medium,
    },
    retryButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '700',
    },
    manualButton: {
        paddingVertical: 12,
    },
    manualButtonText: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: '600',
    },
});
