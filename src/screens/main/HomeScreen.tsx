import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { MainTabScreenProps, Room, Job } from '../../types';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { roomService } from '../../services/roomService';
import { jobService } from '../../services/jobService';

import { useTranslation } from 'react-i18next';
import { AIInsights } from '../../components/AIInsights';

const HomeScreen: React.FC<MainTabScreenProps<'Home'>> = ({ navigation }) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [featuredRooms, setFeaturedRooms] = useState<Room[]>([]);
    const [recentJobs, setRecentJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const userName = user?.name?.split(' ')[0] || t('guest');

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [rooms, jobs] = await Promise.all([
                roomService.getRooms(5),
                jobService.getJobs(5)
            ]);
            setFeaturedRooms(rooms);
            setRecentJobs(jobs);
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadDashboardData();
    };

    const renderTenantHome = () => (
        <View style={styles.dashboard}>
            <View style={styles.welcomeSection}>
                <Text style={styles.greeting}>{t('namaste')}, {userName}</Text>
                <Text style={styles.subtitle}>{t('home_subtitle', { area: user?.area || 'Hinjewadi' })}</Text>
            </View>

            {/* AI Insights - Smart Market Analysis */}
            <AIInsights />

            {/* Category Grid - Dynamic & Clean */}
            <View style={styles.categoryGrid}>
                <CategoryItem title={t('rooms')} icon="home-variant" color="#4F46E5" onPress={() => navigation.navigate('Rooms')} />
                <CategoryItem title={t('jobs')} icon="briefcase" color="#10B981" onPress={() => navigation.navigate('Jobs')} />
                <CategoryItem title={t('services')} icon="account-group" color="#F59E0B" onPress={() => navigation.navigate('Services')} />
                <CategoryItem title={t('post')} icon="plus-thick" color="#8B5CF6" onPress={() => navigation.navigate('PostListing')} />
            </View>

            {/* Live Rooms Section */}
            {featuredRooms.length > 0 && (
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{t('featured_rooms')}</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Rooms')}>
                            <Text style={styles.seeAllText}>{t('see_all')}</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                        {featuredRooms.map(room => (
                            <FeaturedCard
                                key={room.id}
                                title={room.title}
                                price={`₹${room.price.toLocaleString()}`}
                                area={room.area}
                                item={room}
                                onPress={() => navigation.navigate('RoomDetail', { roomId: room.id })}
                            />
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Live Jobs Section */}
            {recentJobs.length > 0 && (
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{t('latest_jobs')}</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Jobs')}>
                            <Text style={styles.seeAllText}>{t('see_all')}</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                        {recentJobs.map(job => (
                            <JobMiniCard
                                key={job.id}
                                title={job.title}
                                company={job.company}
                                salary={job.salary}
                                onPress={() => navigation.navigate('JobDetail', { jobId: job.id })}
                            />
                        ))}
                    </ScrollView>
                </View>
            )}

            <View style={styles.promoBanner}>
                <View style={styles.promoText}>
                    <Text style={styles.promoTitle}>Going Professional?</Text>
                    <Text style={styles.promoSubtitle}>List yourself as a Worker to get noticed by local employers.</Text>
                    <TouchableOpacity style={styles.promoBtn} onPress={() => navigation.navigate('Profile')}>
                        <Text style={styles.promoBtnText}>Upgrade Profile</Text>
                    </TouchableOpacity>
                </View>
                <MaterialCommunityIcons name="rocket-launch" size={60} color={COLORS.white} style={styles.promoIcon} />
            </View>
        </View>
    );

    const renderEmployerHome = () => (
        <View style={styles.dashboard}>
            <View style={styles.welcomeSection}>
                <Text style={styles.greeting}>Employer Hub</Text>
                <Text style={styles.subtitle}>Manage your active listings</Text>
            </View>

            <View style={styles.statsRow}>
                <StatCard label="Postings" value="Live" icon="post" color={COLORS.primary} />
                <StatCard label="Response" value="24h" icon="clock-fast" color={COLORS.success} />
            </View>

            <View style={styles.actionGrid}>
                <BigActionBtn title="Post New Listing" icon="plus-circle" color={COLORS.primary} onPress={() => navigation.navigate('PostListing')} />
                <BigActionBtn title="View My Posts" icon="clipboard-list" color={COLORS.secondary} onPress={() => navigation.navigate('ManagePosts')} />
            </View>
        </View>
    );

    const renderWorkerHome = () => (
        <View style={styles.dashboard}>
            <View style={styles.welcomeSection}>
                <Text style={styles.greeting}>Worker Portal</Text>
                <Text style={styles.subtitle}>You are visible in {user?.area || 'Hinjewadi'}</Text>
            </View>

            <View style={[styles.statusCard, { borderColor: user?.availability === 'Available' ? COLORS.success : COLORS.error }]}>
                <View style={styles.statusInfo}>
                    <View style={[styles.statusDot, { backgroundColor: user?.availability === 'Available' ? COLORS.success : COLORS.error }]} />
                    <Text style={styles.statusLabel}>Current Status: <Text style={styles.statusValue}>{user?.availability || 'Available'}</Text></Text>
                </View>
                <TouchableOpacity style={styles.statusBtn} onPress={() => navigation.navigate('Profile')}>
                    <Text style={styles.statusBtnText}>Change</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.quickActions}>
                <ActionCard title="Find Jobs" subtitle="Browse local openings" icon="magnify" color={COLORS.primary} onPress={() => navigation.navigate('Jobs')} />
                <ActionCard title="Profile Stats" subtitle="See profile visits" icon="chart-line" color={COLORS.success} onPress={() => navigation.navigate('Profile')} />
            </View>
        </View>
    );

    if (loading && !refreshing) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Fetching latest updates...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView 
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
            >
                <View style={styles.header}>
                    <View>
                        <Text style={styles.brandName}>Hinjewadi Connect</Text>
                        <Text style={styles.locationText}>
                            <MaterialCommunityIcons name="map-marker" size={12} color={COLORS.primary} /> {user?.area || 'All Phases'}, Pune
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('Profile')}>
                        <MaterialCommunityIcons name="account-circle-outline" size={32} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>

                {user?.role === 'employer' ? renderEmployerHome() : 
                 user?.role === 'worker' ? renderWorkerHome() : 
                 renderTenantHome()}

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const CategoryItem = ({ title, icon, color, onPress }: any) => (
    <TouchableOpacity style={styles.categoryItem} onPress={onPress}>
        <View style={[styles.categoryIcon, { backgroundColor: color + '10' }]}>
            <MaterialCommunityIcons name={icon} size={28} color={color} />
        </View>
        <Text style={styles.categoryTitle}>{title}</Text>
    </TouchableOpacity>
);

const FeaturedCard = ({ title, price, area, onPress }: any) => (
    <TouchableOpacity style={styles.featuredCard} onPress={onPress}>
        <View style={styles.cardImagePlaceholder}>
            <MaterialCommunityIcons name="home-city-outline" size={40} color={COLORS.border} />
        </View>
        <View style={styles.cardContent}>
            <Text style={styles.cardTitle} numberOfLines={1}>{title}</Text>
            <View style={styles.cardFooter}>
                <Text style={styles.cardPrice}>{price}</Text>
                <Text style={styles.cardArea}>{area}</Text>
            </View>
        </View>
    </TouchableOpacity>
);

const JobMiniCard = ({ title, company, salary, onPress }: any) => (
    <TouchableOpacity style={styles.jobMiniCard} onPress={onPress}>
        <View style={styles.jobIcon}>
            <MaterialCommunityIcons name="briefcase-outline" size={24} color={COLORS.primary} />
        </View>
        <Text style={styles.jobTitle} numberOfLines={1}>{title}</Text>
        <Text style={styles.jobCompany} numberOfLines={1}>{company}</Text>
        <Text style={styles.jobSalary}>{salary}</Text>
    </TouchableOpacity>
);

const ActionCard = ({ title, subtitle, icon, color, onPress }: any) => (
    <TouchableOpacity style={styles.actionCard} onPress={onPress}>
        <View style={[styles.actionIcon, { backgroundColor: color + '10' }]}>
            <MaterialCommunityIcons name={icon} size={24} color={color} />
        </View>
        <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={styles.actionCardTitle}>{title}</Text>
            <Text style={styles.actionCardSubtitle}>{subtitle}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.border} />
    </TouchableOpacity>
);

const BigActionBtn = ({ title, icon, color, onPress }: any) => (
    <TouchableOpacity style={[styles.bigActionBtn, { backgroundColor: color }]} onPress={onPress}>
        <MaterialCommunityIcons name={icon} size={32} color={COLORS.white} />
        <Text style={styles.bigActionBtnText}>{title}</Text>
    </TouchableOpacity>
);

const StatCard = ({ label, value, icon, color }: any) => (
    <View style={styles.statCard}>
        <MaterialCommunityIcons name={icon} size={22} color={color} />
        <View style={{ marginLeft: 12 }}>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
    loadingText: { marginTop: 16, color: COLORS.textSecondary, fontWeight: '600' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    brandName: { fontSize: 24, fontWeight: '900', color: COLORS.text, letterSpacing: -1 },
    locationText: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2, fontWeight: '600' },
    profileBtn: { padding: 4 },
    dashboard: { padding: SPACING.lg },
    welcomeSection: { marginBottom: SPACING.xl },
    greeting: { fontSize: 28, fontWeight: '800', color: COLORS.text, letterSpacing: -0.5 },
    subtitle: { fontSize: 16, color: COLORS.textSecondary, marginTop: 4 },
    
    categoryGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
    categoryItem: { alignItems: 'center', width: '22%' },
    categoryIcon: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    categoryTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text },

    section: { marginBottom: 32 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 19, fontWeight: '800', color: COLORS.text },
    seeAllText: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
    horizontalScroll: { gap: 16 },
    
    featuredCard: { width: 220, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#F3F4F6', ...SHADOWS.light },
    cardImagePlaceholder: { width: '100%', height: 120, borderTopLeftRadius: 16, borderTopRightRadius: 16, backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center' },
    cardContent: { padding: 12 },
    cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, alignItems: 'center' },
    cardPrice: { fontSize: 16, fontWeight: '800', color: COLORS.success },
    cardArea: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600' },

    jobMiniCard: { width: 180, backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#F3F4F6', ...SHADOWS.light },
    jobIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary + '10', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    jobTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text },
    jobCompany: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
    jobSalary: { fontSize: 14, fontWeight: '800', color: COLORS.primary, marginTop: 8 },

    promoBanner: { backgroundColor: COLORS.primary, borderRadius: 24, padding: 24, flexDirection: 'row', overflow: 'hidden' },
    promoText: { flex: 1, zIndex: 1 },
    promoTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
    promoSubtitle: { fontSize: 14, color: '#FFFFFFCC', marginTop: 8, lineHeight: 20 },
    promoBtn: { backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, marginTop: 16, alignSelf: 'flex-start' },
    promoBtnText: { color: COLORS.primary, fontWeight: '800', fontSize: 13 },
    promoIcon: { position: 'absolute', right: -15, bottom: -15, opacity: 0.15 },

    statsRow: { flexDirection: 'row', gap: 16, marginBottom: 24 },
    statCard: { flex: 1, flexDirection: 'row', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#F3F4F6', alignItems: 'center', ...SHADOWS.light },
    statValue: { fontSize: 20, fontWeight: '800', color: COLORS.text },
    statLabel: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' },
    actionGrid: { flexDirection: 'row', gap: 16 },
    bigActionBtn: { flex: 1, height: 120, borderRadius: 20, alignItems: 'center', justifyContent: 'center', ...SHADOWS.medium },
    bigActionBtnText: { color: '#FFFFFF', fontWeight: '800', marginTop: 8, fontSize: 14 },

    statusCard: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 20, borderWidth: 2, backgroundColor: '#FFFFFF', marginBottom: 24, ...SHADOWS.light },
    statusInfo: { flex: 1, flexDirection: 'row', alignItems: 'center' },
    statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
    statusLabel: { fontSize: 15, color: COLORS.textSecondary },
    statusValue: { fontWeight: '800', color: COLORS.text },
    statusBtn: { backgroundColor: '#F3F4F6', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
    statusBtnText: { fontSize: 12, fontWeight: '700', color: COLORS.text },
    quickActions: { gap: 12 },
    actionCard: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 1, borderColor: '#F3F4F6', ...SHADOWS.light },
    actionIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    actionCardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
    actionCardSubtitle: { fontSize: 13, color: COLORS.textSecondary },
});

export default HomeScreen;
