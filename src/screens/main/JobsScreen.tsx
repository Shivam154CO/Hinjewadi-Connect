import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MainTabScreenProps, Job } from '../../types';
import { executeContact } from '../../utils/contactUtils';
import { jobService } from '../../services/jobService';
import { PHASE_COORDS, PhaseKey, sortByPhaseDistance } from '../../utils/geoUtils';
import { useAuth } from '../../context/AuthContext';
import { VerifiedBadge } from '../../components/TrustBadges';

const JOB_CATEGORIES = [
    { key: 'Peon', label: 'Peon', icon: 'account' },
    { key: 'Guard', label: 'Guard', icon: 'shield-account' },
    { key: 'Office Boy', label: 'Office Boy', icon: 'briefcase-outline' },
    { key: 'Watchman', label: 'Watchman', icon: 'eye-outline' },
    { key: 'Helper', label: 'Helper', icon: 'hand-heart' },
    { key: 'Security', label: 'Security', icon: 'security' },
    { key: 'Driver', label: 'Driver', icon: 'car' },
    { key: 'Cook', label: 'Cook', icon: 'chef-hat' },
];

const AREA_FILTERS = ['All', 'Phase 1', 'Phase 2', 'Phase 3'];

const TABS = ['Browse Jobs', 'My Applications'];

const JobCard = ({ job, onPress }: { job: Job; onPress: () => void }) => {
    const handleCall = () => {
        jobService.incrementLeads(job.id).catch(() => { });
        executeContact('call', {
            name: job.company,
            phone: job.contactPhone,
            context: 'job',
            contextTitle: job.title,
            contextCompany: job.company,
        });
    };

    return (
        <TouchableOpacity
            style={[styles.jobCard, SHADOWS.light]}
            onPress={onPress}
            activeOpacity={0.92}
        >
            {/* Image placeholder */}
            <View style={styles.jobImageContainer}>
                <View style={styles.jobImagePlaceholder}>
                    <MaterialCommunityIcons name="office-building" size={50} color={COLORS.border} />
                </View>
                {/* Posted badge */}
                <View style={styles.postedBadge}>
                    <Text style={styles.postedBadgeText}>{job.postedAgo}</Text>
                </View>
                {/* Urgent badge */}
                {job.urgent && (
                    <View style={styles.urgentBadge}>
                        <MaterialCommunityIcons name="lightning-bolt" size={12} color={COLORS.white} />
                        <Text style={styles.urgentText}>Urgent</Text>
                    </View>
                )}
            </View>

            {/* Content */}
            <View style={styles.jobContent}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={styles.jobTitle}>{job.title}</Text>
                    <VerifiedBadge status="verified" size="sm" />
                </View>
                <Text style={styles.jobCompany}>{job.company}</Text>

                {/* Info chips */}
                <View style={styles.jobChipsRow}>
                    <View style={[styles.jobChip, { backgroundColor: '#E3F0FF' }]}>
                        <MaterialCommunityIcons name="map-marker" size={12} color="#2563EB" />
                        <Text style={[styles.jobChipText, { color: '#2563EB' }]}>{job.area}</Text>
                    </View>
                    <View style={[styles.jobChip, { backgroundColor: '#FFF0E0' }]}>
                        <Text style={[styles.jobChipText, { color: '#FF6D00' }]}>{job.type}</Text>
                    </View>
                    <View style={[styles.jobChip, { backgroundColor: '#F0F4F8' }]}>
                        <MaterialCommunityIcons name="clock-outline" size={12} color={COLORS.textSecondary} />
                        <Text style={[styles.jobChipText, { color: COLORS.textSecondary }]}>{job.experience}</Text>
                    </View>
                </View>

                {/* Bottom row: salary + call */}
                <View style={styles.bottomRow}>
                    <View>
                        <Text style={styles.salaryLabel}>Salary</Text>
                        <Text style={styles.salaryValue}>{job.salary}</Text>
                    </View>
                    <TouchableOpacity style={styles.callBtn} onPress={handleCall}>
                        <MaterialCommunityIcons name="phone" size={18} color={COLORS.white} />
                        <Text style={styles.callBtnText}>Call</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export const JobsScreen: React.FC<MainTabScreenProps<'Jobs'>> = ({ navigation }) => {
    const { user } = useAuth();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedArea, setSelectedArea] = useState('All');
    const [sortBy, setSortBy] = useState<'recent' | 'distance'>('recent');
    const [selectedPhase, setSelectedPhase] = useState<PhaseKey>((user?.area as PhaseKey) || 'Phase 1');

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const data = await jobService.getJobs();
            setJobs(data);
        } catch (error) {
            console.error('Failed to fetch jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredJobs = jobs.filter(job => {
        const categoryMatch = !selectedCategory || job.category === selectedCategory;
        const areaMatch = selectedArea === 'All' || job.area === selectedArea;
        return categoryMatch && areaMatch;
    });

    const sortedJobs = sortBy === 'distance'
        ? sortByPhaseDistance(filteredJobs, selectedPhase)
        : filteredJobs;

    const getCategoryCount = (key: string) =>
        jobs.filter(j => j.category === key).length;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Local Jobs</Text>
                <TouchableOpacity style={styles.notifButton}>
                    <MaterialCommunityIcons name="bell-outline" size={22} color={COLORS.text} />
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                {TABS.map((tab, index) => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, activeTab === index && styles.tabActive]}
                        onPress={() => setActiveTab(index)}
                    >
                        <Text style={[styles.tabText, activeTab === index && styles.tabTextActive]}>
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {activeTab === 0 && (
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
            )}

            {activeTab === 0 ? (
                <>
                    {/* Category Icons */}
                    <View style={styles.categorySection}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                            {JOB_CATEGORIES.map(cat => (
                                <TouchableOpacity
                                    key={cat.key}
                                    style={[
                                        styles.categoryCard,
                                        selectedCategory === cat.key && styles.categoryCardActive
                                    ]}
                                    onPress={() => setSelectedCategory(
                                        selectedCategory === cat.key ? null : cat.key
                                    )}
                                >
                                    <View style={[
                                        styles.categoryIconCircle,
                                        selectedCategory === cat.key && styles.categoryIconCircleActive
                                    ]}>
                                        <MaterialCommunityIcons
                                            name={cat.icon as any}
                                            size={22}
                                            color={selectedCategory === cat.key ? COLORS.white : COLORS.primary}
                                        />
                                    </View>
                                    <Text style={[
                                        styles.categoryLabel,
                                        selectedCategory === cat.key && styles.categoryLabelActive
                                    ]}>{cat.label}</Text>
                                    <Text style={styles.categoryCount}>{getCategoryCount(cat.key)}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Area Filter */}
                    <View style={styles.areaFilterContainer}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.areaFilterScroll}>
                            {AREA_FILTERS.map(area => (
                                <TouchableOpacity
                                    key={area}
                                    style={[
                                        styles.areaChip,
                                        selectedArea === area && styles.areaChipActive
                                    ]}
                                    onPress={() => setSelectedArea(area)}
                                >
                                    {area !== 'All' && (
                                        <MaterialCommunityIcons
                                            name="map-marker"
                                            size={14}
                                            color={selectedArea === area ? COLORS.white : COLORS.textSecondary}
                                        />
                                    )}
                                    <Text style={[
                                        styles.areaChipText,
                                        selectedArea === area && styles.areaChipTextActive
                                    ]}>{area}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Results count */}
                    <View style={styles.resultsRow}>
                        <Text style={styles.resultsText}>
                            {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found
                        </Text>
                    </View>

                    {/* Job List */}
                    <FlatList
                        data={sortedJobs}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <JobCard
                                job={item}
                                onPress={() => navigation.navigate('JobDetail', { jobId: item.id })}
                            />
                        )}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <MaterialCommunityIcons name="briefcase-off" size={60} color={COLORS.border} />
                                <Text style={styles.emptyText}>No jobs found</Text>
                                <Text style={styles.emptySubtext}>Try changing filters or area</Text>
                            </View>
                        }
                    />
                </>
            ) : (
                <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons name="file-document-outline" size={60} color={COLORS.border} />
                    <Text style={styles.emptyText}>No Applications Yet</Text>
                    <Text style={styles.emptySubtext}>Jobs you apply to will appear here</Text>
                </View>
            )}

            {/* FAB - Create Job Profile */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('CreateJobProfile')}
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
    notifButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.light,
    },
    // Tabs
    tabContainer: {
        flexDirection: 'row',
        marginHorizontal: SPACING.lg,
        backgroundColor: '#EEF2F6',
        borderRadius: BORDER_RADIUS.full,
        padding: 4,
        marginBottom: SPACING.md,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: BORDER_RADIUS.full,
    },
    tabActive: {
        backgroundColor: COLORS.white,
        ...SHADOWS.light,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    tabTextActive: {
        color: COLORS.primary,
        fontWeight: '700',
    },
    // Categories
    categorySection: {
        marginBottom: SPACING.sm,
    },
    categoryScroll: {
        paddingHorizontal: SPACING.lg,
        gap: SPACING.md,
    },
    categoryCard: {
        alignItems: 'center',
        width: 75,
    },
    categoryCardActive: {},
    categoryIconCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#E8F0FE',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
    },
    categoryIconCircleActive: {
        backgroundColor: COLORS.primary,
    },
    categoryLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.text,
        textAlign: 'center',
    },
    categoryLabelActive: {
        color: COLORS.primary,
    },
    categoryCount: {
        fontSize: 10,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    // Area filters
    areaFilterContainer: {
        marginBottom: SPACING.sm,
    },
    areaFilterScroll: {
        paddingHorizontal: SPACING.lg,
        gap: SPACING.sm,
    },
    areaChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: COLORS.white,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        gap: 4,
    },
    areaChipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    areaChipText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    areaChipTextActive: {
        color: COLORS.white,
    },
    // Results
    resultsRow: {
        paddingHorizontal: SPACING.lg,
        marginBottom: SPACING.sm,
    },
    resultsText: {
        fontSize: 13,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    // Job list
    listContent: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: 100,
    },
    jobCard: {
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.xl,
        overflow: 'hidden',
        marginBottom: SPACING.lg,
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    jobImageContainer: {
        width: '100%',
        height: 160,
        position: 'relative',
    },
    jobImagePlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#EEF2F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    postedBadge: {
        position: 'absolute',
        top: SPACING.md,
        right: SPACING.md,
        backgroundColor: 'rgba(0,0,0,0.55)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: BORDER_RADIUS.full,
    },
    postedBadgeText: {
        color: COLORS.white,
        fontSize: 11,
        fontWeight: '600',
    },
    urgentBadge: {
        position: 'absolute',
        top: SPACING.md,
        left: SPACING.md,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FF5252',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: BORDER_RADIUS.full,
        gap: 3,
    },
    urgentText: {
        color: COLORS.white,
        fontSize: 11,
        fontWeight: '700',
    },
    jobContent: {
        padding: SPACING.md,
    },
    jobTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 4,
    },
    jobCompany: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginBottom: SPACING.sm,
    },
    jobChipsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: SPACING.sm,
    },
    jobChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: BORDER_RADIUS.full,
        gap: 3,
    },
    jobChipText: {
        fontSize: 11,
        fontWeight: '600',
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingTop: SPACING.sm,
    },
    salaryLabel: {
        fontSize: 11,
        color: COLORS.textSecondary,
    },
    salaryValue: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.primary,
    },
    callBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.success,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: BORDER_RADIUS.full,
        gap: 6,
    },
    callBtnText: {
        color: COLORS.white,
        fontWeight: '700',
        fontSize: 13,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80,
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
        backgroundColor: COLORS.primary,
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
