import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MainTabScreenProps, Job } from '../../types';
import { jobService } from '../../services/jobService';
import { PHASE_COORDS, PhaseKey, sortByPhaseDistance } from '../../utils/geoUtils';
import { useAuth } from '../../context/AuthContext';
import { JobCard } from '../../components/JobCard';

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
const TABS = ['Browse Jobs', 'My History'];

export const JobsScreen: React.FC<MainTabScreenProps<'Jobs'>> = ({ navigation }) => {
    const { user } = useAuth();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedArea, setSelectedArea] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
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
        const searchMatch = searchQuery === '' ||
            job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.company.toLowerCase().includes(searchQuery.toLowerCase());
        return categoryMatch && areaMatch && searchMatch;
    });

    const sortedJobs = sortBy === 'distance'
        ? sortByPhaseDistance(filteredJobs, selectedPhase)
        : filteredJobs;

    const getCategoryCount = (key: string) =>
        jobs.filter(j => j.category === key).length;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Local Jobs</Text>
                <TouchableOpacity style={styles.iconBtn}>
                    <MaterialCommunityIcons name="filter-variant" size={24} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            <View style={styles.searchSection}>
                <View style={styles.searchBar}>
                    <MaterialCommunityIcons name="magnify" size={20} color={COLORS.textSecondary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search roles, companies..."
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

                <View style={styles.tabBar}>
                    {TABS.map((tab, idx) => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tabItem, activeTab === idx && styles.tabActive]}
                            onPress={() => setActiveTab(idx)}
                        >
                            <Text style={[styles.tabLabel, activeTab === idx && styles.tabLabelActive]}>{tab}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {activeTab === 0 ? (
                <>
                    <View style={styles.filterSection}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                            {JOB_CATEGORIES.map(cat => (
                                <TouchableOpacity
                                    key={cat.key}
                                    style={[styles.catChip, selectedCategory === cat.key && styles.catChipActive]}
                                    onPress={() => setSelectedCategory(selectedCategory === cat.key ? null : cat.key)}
                                >
                                    <View style={[styles.catIcon, selectedCategory === cat.key && styles.catIconActive]}>
                                        <MaterialCommunityIcons
                                            name={cat.icon as any}
                                            size={20}
                                            color={selectedCategory === cat.key ? '#FFFFFF' : COLORS.primary}
                                        />
                                    </View>
                                    <Text style={[styles.catLabel, selectedCategory === cat.key && styles.catLabelActive]}>{cat.label}</Text>
                                    <View style={styles.catCount}>
                                        <Text style={styles.catCountText}>{getCategoryCount(cat.key)}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.areaScroll}>
                            {AREA_FILTERS.map(area => (
                                <TouchableOpacity
                                    key={area}
                                    style={[styles.areaChip, selectedArea === area && styles.areaChipActive]}
                                    onPress={() => setSelectedArea(area)}
                                >
                                    <Text style={[styles.areaText, selectedArea === area && styles.areaTextActive]}>{area}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {loading ? (
                        <View style={styles.loader}>
                            <ActivityIndicator size="large" color={COLORS.primary} />
                            <Text style={styles.loaderText}>Searching for opportunities...</Text>
                        </View>
                    ) : (
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
                                    <MaterialCommunityIcons name="briefcase-search-outline" size={70} color="#E2E8F0" />
                                    <Text style={styles.emptyTitle}>No exact matches</Text>
                                    <Text style={styles.emptySubtitle}>Try adjusting your search or area filters.</Text>
                                    <TouchableOpacity style={styles.resetBtn} onPress={() => { setSelectedCategory(null); setSelectedArea('All'); setSearchQuery(''); }}>
                                        <Text style={styles.resetBtnText}>Reset All Filters</Text>
                                    </TouchableOpacity>
                                </View>
                            }
                        />
                    )}
                </>
            ) : (
                <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons name="history" size={70} color="#E2E8F0" />
                    <Text style={styles.emptyTitle}>No History</Text>
                    <Text style={styles.emptySubtitle}>Businesses you interact with will appear here.</Text>
                </View>
            )}

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('CreateJobProfile')}
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
        justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14,
    },
    iconBtn: {
        width: 42, height: 42, borderRadius: 12,
        backgroundColor: '#1C1C1E', alignItems: 'center', justifyContent: 'center',
    },
    headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.5 },
    searchSection: { paddingHorizontal: 20, paddingBottom: 16 },
    searchBar: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#1C1C1E', borderRadius: 14,
        paddingHorizontal: 14, height: 50, marginBottom: 14, gap: 10,
    },
    searchInput: { flex: 1, fontSize: 15, color: '#FFFFFF' },
    tabBar: { flexDirection: 'row', backgroundColor: '#1C1C1E', borderRadius: 12, padding: 4 },
    tabItem: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
    tabActive: { backgroundColor: '#2C2C2E' },
    tabLabel: { fontSize: 14, fontWeight: '600', color: '#636366' },
    tabLabelActive: { color: '#00C896', fontWeight: '700' },
    filterSection: { marginBottom: 12 },
    categoryScroll: { paddingLeft: 20, paddingBottom: 14, gap: 10 },
    catChip: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#1C1C1E', paddingLeft: 8, paddingRight: 14,
        paddingVertical: 8, borderRadius: 14, gap: 10,
        borderWidth: 1, borderColor: '#2C2C2E',
    },
    catChipActive: { borderColor: '#00C896', backgroundColor: '#00C89610' },
    catIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#2C2C2E', alignItems: 'center', justifyContent: 'center' },
    catIconActive: { backgroundColor: '#00C896' },
    catLabel: { fontSize: 13, fontWeight: '600', color: '#AEAEB2' },
    catLabelActive: { color: '#00C896' },
    catCount: { paddingHorizontal: 6, paddingVertical: 2, backgroundColor: '#2C2C2E', borderRadius: 6 },
    catCountText: { fontSize: 10, fontWeight: '700', color: '#636366' },
    areaScroll: { paddingLeft: 20, gap: 8 },
    areaChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#1C1C1E', borderWidth: 1, borderColor: '#2C2C2E' },
    areaChipActive: { backgroundColor: '#00C896', borderColor: '#00C896' },
    areaText: { fontSize: 13, fontWeight: '600', color: '#636366' },
    areaTextActive: { color: '#000000', fontWeight: '700' },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
    loaderText: { marginTop: 14, fontSize: 14, color: '#636366' },
    listContent: { paddingHorizontal: 20, paddingBottom: 110 },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, paddingHorizontal: 40 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginTop: 20 },
    emptySubtitle: { fontSize: 14, color: '#636366', textAlign: 'center', marginTop: 8, lineHeight: 20 },
    resetBtn: { marginTop: 20, paddingHorizontal: 22, paddingVertical: 11, borderRadius: 12, backgroundColor: '#00C896' },
    resetBtnText: { color: '#000000', fontWeight: '700', fontSize: 14 },
    fab: {
        position: 'absolute', bottom: 100, right: 20,
        width: 56, height: 56, borderRadius: 18,
        backgroundColor: '#00C896', alignItems: 'center', justifyContent: 'center',
        shadowColor: '#00C896', shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4, shadowRadius: 14, elevation: 8,
    },
});

