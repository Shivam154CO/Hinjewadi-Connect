import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { MainTabScreenProps } from '../../types';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const HomeScreen: React.FC<MainTabScreenProps<'Home'>> = ({ navigation }) => {
    const { user } = useAuth();

    const userName = user?.name?.split(' ')[0] || 'Guest';

    const renderTenantHome = () => (
        <View style={styles.dashboard}>
            <View style={styles.welcomeSection}>
                <Text style={styles.greeting}>Namaste, {userName}</Text>
                <Text style={styles.subtitle}>Find what you need in Hinjewadi</Text>
            </View>

            <View style={styles.quickActions}>
                <ActionCard
                    title="Find a Room"
                    subtitle="PG, Flats & Rooms"
                    icon="home-search"
                    color="#4F46E5"
                    onPress={() => navigation.navigate('Rooms')}
                />
                <ActionCard
                    title="Find a Job"
                    subtitle="Local opportunities"
                    icon="briefcase-search"
                    color="#10B981"
                    onPress={() => navigation.navigate('Jobs')}
                />
                <ActionCard
                    title="Get Services"
                    subtitle="Maids, Cooks & more"
                    icon="account-group"
                    color="#F59E0B"
                    onPress={() => navigation.navigate('Services')}
                />
            </View>

            <View style={styles.promoCard}>
                <View style={styles.promoText}>
                    <Text style={styles.promoTitle}>Going Professional?</Text>
                    <Text style={styles.promoSubtitle}>Switch to Worker or Employer mode in your profile to start earning.</Text>
                    <TouchableOpacity 
                        style={styles.promoBtn}
                        onPress={() => navigation.navigate('Profile')}
                    >
                        <Text style={styles.promoBtnText}>Learn More</Text>
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
                <Text style={styles.subtitle}>Manage your listings and findings</Text>
            </View>

            <View style={styles.statsRow}>
                <StatCard label="Postings" value="Live" icon="post" color={COLORS.primary} />
                <StatCard label="Response" value="24h" icon="clock-fast" color={COLORS.success} />
            </View>

            <TouchableOpacity 
                style={styles.primaryAction}
                onPress={() => navigation.navigate('PostListing')}
            >
                <MaterialCommunityIcons name="plus-circle" size={24} color={COLORS.white} />
                <Text style={styles.primaryActionText}>Post New Listing</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.secondaryAction}
                onPress={() => navigation.navigate('ManagePosts')}
            >
                <MaterialCommunityIcons name="clipboard-list-outline" size={24} color={COLORS.primary} />
                <Text style={styles.secondaryActionText}>Manage My Postings</Text>
            </TouchableOpacity>
        </View>
    );

    const renderWorkerHome = () => (
        <View style={styles.dashboard}>
            <View style={styles.welcomeSection}>
                <Text style={styles.greeting}>Worker Dashboard</Text>
                <Text style={styles.subtitle}>Stay visible to potential employers</Text>
            </View>

            <View style={styles.statusSection}>
                <View style={[styles.statusIndicator, user?.availability === 'Available' ? styles.statusOnline : styles.statusOffline]} />
                <Text style={styles.statusText}>
                    Status: <Text style={{ fontWeight: '800' }}>{user?.availability || 'Available'}</Text>
                </Text>
            </View>

            <View style={styles.quickActions}>
                <ActionCard
                    title="Find Jobs"
                    subtitle="Browse all openings"
                    icon="magnify"
                    color={COLORS.primary}
                    onPress={() => navigation.navigate('Jobs')}
                />
                <ActionCard
                    title="My Profile"
                    subtitle="Manage your skills"
                    icon="account-edit"
                    color={COLORS.success}
                    onPress={() => navigation.navigate('Profile')}
                />
            </View>

            <View style={styles.tipCard}>
                <MaterialCommunityIcons name="lightbulb-on" size={24} color="#F59E0B" />
                <Text style={styles.tipText}>Keep your status 'Available' to receive more job calls!</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.brandName}>Hinjewadi Connect</Text>
                        <View style={styles.locationContainer}>
                            <MaterialCommunityIcons name="map-marker" size={14} color={COLORS.primary} />
                            <Text style={styles.locationText}>{user?.area || 'All Phases'}, Pune</Text>
                        </View>
                    </View>
                    <TouchableOpacity 
                        style={styles.profileBtn}
                        onPress={() => navigation.navigate('Profile')}
                    >
                        <MaterialCommunityIcons name="account-circle" size={32} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>

                {user?.role === 'employer' ? renderEmployerHome() : 
                 user?.role === 'worker' ? renderWorkerHome() : 
                 renderTenantHome()}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Local News & Updates</Text>
                    <View style={styles.newsCard}>
                        <Text style={styles.newsTitle}>Phase 3 Metro Connect</Text>
                        <Text style={styles.newsBody}>New feeding services started from Shivajinagar to Hinjewadi Phase 3.</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const ActionCard = ({ title, subtitle, icon, color, onPress }: any) => (
    <TouchableOpacity style={[styles.actionCard]} onPress={onPress}>
        <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
            <MaterialCommunityIcons name={icon} size={28} color={color} />
        </View>
        <View style={styles.actionTextContent}>
            <Text style={styles.actionTitle}>{title}</Text>
            <Text style={styles.actionSubtitle}>{subtitle}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.border} />
    </TouchableOpacity>
);

const StatCard = ({ label, value, icon, color }: any) => (
    <View style={styles.statCard}>
        <MaterialCommunityIcons name={icon} size={20} color={color} />
        <View style={{ marginLeft: 8 }}>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    </View>
);

export default HomeScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        backgroundColor: COLORS.white,
    },
    brandName: { fontSize: 20, fontWeight: '900', color: COLORS.text, letterSpacing: -0.5 },
    locationContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
    locationText: { fontSize: 12, color: COLORS.textSecondary, marginLeft: 4, fontWeight: '600' },
    profileBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    dashboard: { padding: SPACING.lg },
    welcomeSection: { marginBottom: SPACING.xl },
    greeting: { fontSize: 28, fontWeight: '800', color: COLORS.text, letterSpacing: -0.5 },
    subtitle: { fontSize: 16, color: COLORS.textSecondary, marginTop: 4 },
    quickActions: { gap: SPACING.md },
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        ...SHADOWS.light,
    },
    iconContainer: {
        width: 52,
        height: 52,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionTextContent: { flex: 1, marginLeft: SPACING.md },
    actionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
    actionSubtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
    promoCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.primary,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.lg,
        marginTop: SPACING.xl,
        overflow: 'hidden',
        ...SHADOWS.medium,
    },
    promoText: { flex: 1, zIndex: 1 },
    promoTitle: { fontSize: 20, fontWeight: '800', color: COLORS.white },
    promoSubtitle: { fontSize: 14, color: COLORS.white + 'CC', marginTop: 8, lineHeight: 20 },
    promoBtn: {
        backgroundColor: COLORS.white,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: BORDER_RADIUS.md,
        marginTop: SPACING.md,
        alignSelf: 'flex-start',
    },
    promoBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },
    promoIcon: { position: 'absolute', right: -10, bottom: -10, opacity: 0.2 },
    primaryAction: {
        flexDirection: 'row',
        backgroundColor: COLORS.primary,
        padding: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: SPACING.md,
        ...SHADOWS.medium,
    },
    primaryActionText: { color: COLORS.white, fontSize: 17, fontWeight: '800', marginLeft: 10 },
    secondaryAction: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        padding: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.primary + '30',
    },
    secondaryActionText: { color: COLORS.primary, fontSize: 16, fontWeight: '700', marginLeft: 10 },
    statsRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.md },
    statCard: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        alignItems: 'center',
        ...SHADOWS.light,
    },
    statValue: { fontSize: 18, fontWeight: '800', color: COLORS.text },
    statLabel: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' },
    statusSection: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        marginBottom: SPACING.xl,
        ...SHADOWS.light,
    },
    statusIndicator: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
    statusOnline: { backgroundColor: COLORS.success },
    statusOffline: { backgroundColor: COLORS.error },
    statusText: { fontSize: 15, color: COLORS.text },
    tipCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFBEB',
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        marginTop: SPACING.xl,
        borderWidth: 1,
        borderColor: '#FEF3C7',
    },
    tipText: { flex: 1, fontSize: 13, color: '#92400E', marginLeft: 10, lineHeight: 18 },
    section: { padding: SPACING.lg },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.md },
    newsCard: {
        backgroundColor: COLORS.white,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.secondary,
        ...SHADOWS.light,
    },
    newsTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
    newsBody: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4, lineHeight: 20 },
});
