import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    TextInput,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { jobService } from '../../services/jobService';
import { JobSeekerProfile, MainStackScreenProps } from '../../types';
import { executeContact, ContactInfo } from '../../utils/contactUtils';
import { COLORS, SPACING, BORDER_RADIUS } from '../../theme/theme';
import { ContactSheet } from '../../components/ContactSheet';

const CATEGORIES = ['All', 'Peon', 'Guard', 'Office Boy', 'Watchman', 'Helper', 'Security', 'Driver', 'Cook'];

const AVAILABILITY_COLORS: Record<string, string> = {
    'Immediately': '#00C896',
    'Within 1 Week': '#FF9500',
    'Within 1 Month': '#636366',
};

const JobSeekerCard = ({ profile, onContact }: {
    profile: JobSeekerProfile;
    onContact: (p: JobSeekerProfile) => void;
}) => {
    const initial = profile.name
        ? profile.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
        : 'W';
    const availColor = AVAILABILITY_COLORS[profile.availability] ?? COLORS.textMuted;

    return (
        <View style={card.root}>
            <View style={card.topRow}>
                {/* Avatar */}
                <View style={card.avatar}>
                    <Text style={card.avatarText}>{initial}</Text>
                </View>

                {/* Info */}
                <View style={{ flex: 1 }}>
                    <Text style={card.name}>{profile.name}</Text>
                    <View style={card.metaRow}>
                        <View style={card.categoryChip}>
                            <Text style={card.categoryChipText}>{profile.category}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <View style={[card.dot, { backgroundColor: availColor }]} />
                            <Text style={[card.availText, { color: availColor }]}>{profile.availability}</Text>
                        </View>
                    </View>
                    <View style={card.locationRow}>
                        <MaterialCommunityIcons name="map-marker-outline" size={13} color={COLORS.textMuted} />
                        <Text style={card.location}>{profile.area}</Text>
                    </View>
                </View>

                {/* Salary */}
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={card.salaryLabel}>Expected</Text>
                    <Text style={card.salary}>{profile.expectedSalary || '—'}</Text>
                </View>
            </View>

            {/* Experience & Bio */}
            {profile.experience ? (
                <View style={card.expRow}>
                    <MaterialCommunityIcons name="briefcase-outline" size={14} color={COLORS.textMuted} />
                    <Text style={card.expText}>{profile.experience} experience</Text>
                </View>
            ) : null}

            {profile.description ? (
                <Text style={card.bio} numberOfLines={2}>{profile.description}</Text>
            ) : null}

            {/* Skills */}
            {profile.skills.length > 0 && (
                <View style={card.skillsRow}>
                    {profile.skills.slice(0, 4).map((skill, i) => (
                        <View key={i} style={card.skillChip}>
                            <Text style={card.skillText}>{skill}</Text>
                        </View>
                    ))}
                    {profile.skills.length > 4 && (
                        <View style={card.skillChip}>
                            <Text style={card.skillText}>+{profile.skills.length - 4}</Text>
                        </View>
                    )}
                </View>
            )}

            {/* Contact */}
            <View style={card.actions}>
                <TouchableOpacity
                    style={card.callBtn}
                    onPress={() => onContact(profile)}
                    activeOpacity={0.8}
                >
                    <MaterialCommunityIcons name="message-outline" size={16} color="#000" style={{ marginRight: 4 }} />
                    <Text style={card.callBtnText}>Contact Worker</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export const JobSeekersScreen: React.FC<MainStackScreenProps<'JobSeekers'>> = ({ navigation }) => {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [search, setSearch] = useState('');
    const [contactSheetVisible, setContactSheetVisible] = useState(false);
    const [selectedSeekerContact, setSelectedSeekerContact] = useState<ContactInfo | null>(null);

    const {
        data: seekers = [],
        isLoading,
        isRefetching,
        refetch,
    } = useQuery({
        queryKey: ['job-seekers', selectedCategory],
        queryFn: () => jobService.getJobSeekers(40, selectedCategory),
        staleTime: 2 * 60 * 1000,
    });

    const filtered = seekers.filter(s => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
            s.name.toLowerCase().includes(q) ||
            s.category.toLowerCase().includes(q) ||
            s.skills.some(sk => sk.toLowerCase().includes(q))
        );
    });

    const handleContact = (profile: JobSeekerProfile) => {
        setSelectedSeekerContact({
            id: profile.id,
            name: profile.name,
            phone: profile.phone,
            ownerId: profile.userId,
            context: 'general',
            contextTitle: `${profile.category} Seeker`,
        });
        setContactSheetVisible(true);
    };

    return (
        <SafeAreaView style={styles.root} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={22} color={COLORS.text} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={styles.title}>Find Workers</Text>
                    <Text style={styles.subtitle}>
                        {filtered.length} {filtered.length === 1 ? 'profile' : 'profiles'} available
                    </Text>
                </View>
            </View>

            {/* Search */}
            <View style={styles.searchWrap}>
                <MaterialCommunityIcons name="magnify" size={20} color={COLORS.textMuted} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by name, skill or role..."
                    placeholderTextColor={COLORS.textMuted}
                    value={search}
                    onChangeText={setSearch}
                />
                {search.length > 0 && (
                    <TouchableOpacity onPress={() => setSearch('')}>
                        <MaterialCommunityIcons name="close-circle" size={18} color={COLORS.textMuted} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Category Filter */}
            <View style={styles.categoryBar}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: SPACING.lg, gap: 8 }}>
                    {CATEGORIES.map(cat => (
                        <TouchableOpacity
                            key={cat}
                            style={[styles.catChip, selectedCategory === cat && styles.catChipActive]}
                            onPress={() => setSelectedCategory(cat)}
                        >
                            <Text style={[styles.catText, selectedCategory === cat && styles.catTextActive]}>
                                {cat}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* List */}
            {isLoading && !isRefetching ? (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loaderText}>Loading worker profiles...</Text>
                </View>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefetching}
                            onRefresh={refetch}
                            colors={[COLORS.primary]}
                            tintColor={COLORS.primary}
                        />
                    }
                    renderItem={({ item }) => (
                        <JobSeekerCard profile={item} onContact={handleContact} />
                    )}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <View style={styles.emptyIcon}>
                                <MaterialCommunityIcons name="account-search-outline" size={38} color={COLORS.textMuted} />
                            </View>
                            <Text style={styles.emptyTitle}>No workers found</Text>
                            <Text style={styles.emptySubtitle}>
                                {search ? 'Try a different search term.' : 'No worker profiles in this category yet.'}
                            </Text>
                            {selectedCategory !== 'All' && (
                                <TouchableOpacity
                                    style={styles.clearBtn}
                                    onPress={() => { setSelectedCategory('All'); setSearch(''); }}
                                >
                                    <Text style={styles.clearBtnText}>Show All Workers</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    }
                />
            )}
            {selectedSeekerContact && (
                <ContactSheet
                    visible={contactSheetVisible}
                    onClose={() => setContactSheetVisible(false)}
                    contact={selectedSeekerContact}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#0F0F0F' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.sm,
        paddingBottom: SPACING.md,
        gap: SPACING.md,
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: '#1C1C1E', alignItems: 'center', justifyContent: 'center',
    },
    title: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.4 },
    subtitle: { fontSize: 13, color: '#636366', marginTop: 1 },
    searchWrap: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#1C1C1E', borderRadius: 14,
        marginHorizontal: SPACING.lg, marginBottom: SPACING.sm,
        paddingHorizontal: 14, paddingVertical: 10,
        borderWidth: 1, borderColor: '#2C2C2E',
    },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, fontSize: 15, color: '#FFFFFF' },
    categoryBar: { marginBottom: SPACING.sm },
    catChip: {
        paddingHorizontal: 16, paddingVertical: 8,
        borderRadius: 20, backgroundColor: '#1C1C1E',
        borderWidth: 1, borderColor: '#2C2C2E',
    },
    catChipActive: { backgroundColor: '#00C89618', borderColor: '#00C896' },
    catText: { fontSize: 13, fontWeight: '600', color: '#636366' },
    catTextActive: { color: '#00C896' },
    listContent: { paddingHorizontal: SPACING.lg, paddingBottom: 110 },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    loaderText: { fontSize: 14, color: '#636366' },
    empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
    emptyIcon: {
        width: 72, height: 72, borderRadius: 36,
        backgroundColor: '#1C1C1E', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
    },
    emptyTitle: { fontSize: 17, fontWeight: '700', color: '#FFFFFF', marginBottom: 6 },
    emptySubtitle: { fontSize: 14, color: '#636366', textAlign: 'center', lineHeight: 20 },
    clearBtn: { marginTop: 20, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14, backgroundColor: '#00C896' },
    clearBtnText: { color: '#000', fontWeight: '700', fontSize: 14 },
});

const card = StyleSheet.create({
    root: {
        backgroundColor: '#1C1C1E', borderRadius: 18,
        padding: 16, marginBottom: 12,
        borderWidth: 1, borderColor: '#2C2C2E',
    },
    topRow: { flexDirection: 'row', gap: 12, marginBottom: 10 },
    avatar: {
        width: 50, height: 50, borderRadius: 15,
        backgroundColor: '#00C89622', alignItems: 'center', justifyContent: 'center',
    },
    avatarText: { fontSize: 18, fontWeight: '800', color: '#00C896' },
    name: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', marginBottom: 5 },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    categoryChip: {
        backgroundColor: '#2C2C2E', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
    },
    categoryChipText: { fontSize: 11, fontWeight: '700', color: '#AEAEB2' },
    dot: { width: 6, height: 6, borderRadius: 3 },
    availText: { fontSize: 11, fontWeight: '600' },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    location: { fontSize: 12, color: '#636366' },
    salaryLabel: { fontSize: 10, color: '#636366', marginBottom: 2, fontWeight: '600' },
    salary: { fontSize: 13, fontWeight: '700', color: '#00C896' },
    expRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6 },
    expText: { fontSize: 13, color: '#AEAEB2' },
    bio: { fontSize: 13, color: '#636366', lineHeight: 19, marginBottom: 10 },
    skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
    skillChip: {
        backgroundColor: '#2C2C2E', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10,
    },
    skillText: { fontSize: 11, color: '#AEAEB2', fontWeight: '600' },
    actions: { flexDirection: 'row', gap: 10 },
    callBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#00C896', paddingVertical: 11, borderRadius: 12, gap: 6,
    },
    callBtnText: { color: '#000', fontWeight: '700', fontSize: 14 },
    waBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#25D36614', paddingVertical: 11, borderRadius: 12, gap: 6,
        borderWidth: 1, borderColor: '#25D36630',
    },
    waBtnText: { color: '#25D366', fontWeight: '700', fontSize: 14 },
});
