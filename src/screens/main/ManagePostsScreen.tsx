import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MainStackScreenProps, Room, Job } from '../../types';
import { roomService } from '../../services/roomService';
import { jobService } from '../../services/jobService';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';

export const ManagePostsScreen: React.FC<MainStackScreenProps<'ManagePosts'>> = ({ navigation }) => {
    const { user } = useAuth();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeType, setActiveType] = useState<'rooms' | 'jobs' | 'inquiries'>('rooms');

    useEffect(() => {
        fetchMyPosts();
    }, [activeType]);

    const fetchMyPosts = async () => {
        if (!user) return;
        setLoading(true);
        try {
            if (activeType === 'inquiries') {
                const myLeads = await adminService.getRecentLeads(user.id);
                setLeads(myLeads);
            } else {
                const [myRooms, myJobs] = await Promise.all([
                    roomService.getRoomsByOwner(user.id),
                    jobService.getJobsByEmployer(user.id)
                ]);
                setRooms(myRooms);
                setJobs(myJobs);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (item: Room) => {
        const newStatus = item.status === 'Available' ? 'Occupied' : 'Available';
        try {
            await roomService.updateRoom(item.id, { status: newStatus });
            Alert.alert('Success', `Listing marked as ${newStatus}`);
            fetchMyPosts();
        } catch (error) {
            Alert.alert('Error', 'Failed to update status');
        }
    };

    const handleDelete = (id: string, type: 'room' | 'job') => {
        Alert.alert(
            'Delete Listing',
            'Are you sure you want to delete this listing?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            if (type === 'room') await roomService.deleteRoom(id);
                            else await jobService.deleteJob(id);
                            fetchMyPosts();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete listing');
                        }
                    }
                }
            ]
        );
    };

    const renderRoom = ({ item }: { item: Room }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={[styles.statusBadge, item.status === 'Occupied' && styles.occupiedBadge]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                </View>
                <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>

            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.price}>₹{item.price}/month</Text>

            <View style={styles.statsRow}>
                <View style={styles.stat}>
                    <MaterialCommunityIcons name="eye-outline" size={16} color={COLORS.textSecondary} />
                    <Text style={styles.statValue}>{item.viewsCount || 0}</Text>
                    <Text style={styles.statLabel}>Views</Text>
                </View>
                <View style={styles.stat}>
                    <MaterialCommunityIcons name="phone-outline" size={16} color={COLORS.textSecondary} />
                    <Text style={styles.statValue}>{item.leadsCount || 0}</Text>
                    <Text style={styles.statLabel}>Leads</Text>
                </View>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleToggleStatus(item)}
                >
                    <MaterialCommunityIcons
                        name={item.status === 'Available' ? 'check-circle-outline' : 'clock-outline'}
                        size={18}
                        color={COLORS.primary}
                    />
                    <Text style={styles.actionText}>
                        {item.status === 'Available' ? 'Mark Occupied' : 'Mark Available'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDelete(item.id, 'room')}
                >
                    <MaterialCommunityIcons name="delete-outline" size={18} color={COLORS.error} />
                    <Text style={[styles.actionText, { color: COLORS.error }]}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderJob = ({ item }: { item: Job }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={[styles.statusBadge, { backgroundColor: COLORS.primary + '15' }]}>
                    <Text style={[styles.statusText, { color: COLORS.primary }]}>{item.category}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: '#E0F7F3', marginLeft: 8 }]}>
                    <Text style={[styles.statusText, { color: '#00BFA5' }]}>{item.area}</Text>
                </View>
                {item.urgent && (
                    <View style={[styles.statusBadge, { backgroundColor: '#FFEBEE', marginLeft: 8 }]}>
                        <Text style={[styles.statusText, { color: '#EF4444' }]}>URGENT</Text>
                    </View>
                )}
            </View>

            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.price}>{item.salary}</Text>

            <View style={styles.statsRow}>
                <View style={styles.stat}>
                    <MaterialCommunityIcons name="eye-outline" size={16} color={COLORS.textSecondary} />
                    <Text style={styles.statValue}>{item.viewsCount || 0}</Text>
                    <Text style={styles.statLabel}>Views</Text>
                </View>
                <View style={styles.stat}>
                    <MaterialCommunityIcons name="phone-outline" size={16} color={COLORS.textSecondary} />
                    <Text style={styles.statValue}>{item.leadsCount || 0}</Text>
                    <Text style={styles.statLabel}>Leads</Text>
                </View>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('JobDetail', { jobId: item.id })}
                >
                    <MaterialCommunityIcons name="eye-outline" size={18} color={COLORS.primary} />
                    <Text style={styles.actionText}>View Listing</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDelete(item.id, 'job')}
                >
                    <MaterialCommunityIcons name="delete-outline" size={18} color={COLORS.error} />
                    <Text style={[styles.actionText, { color: COLORS.error }]}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Postings</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Dashboard Summary Stats */}
            <View style={styles.summaryContainer}>
                <View style={[styles.summaryCard, { backgroundColor: COLORS.primary + '10' }]}>
                    <Text style={[styles.summaryValue, { color: COLORS.primary }]}>
                        {activeType === 'rooms' ? rooms.length : activeType === 'jobs' ? jobs.length : leads.length}
                    </Text>
                    <Text style={styles.summaryLabel}>
                        {activeType === 'inquiries' ? 'Recent Leads' : `Total ${activeType}`}
                    </Text>
                </View>
                {activeType !== 'inquiries' && (
                    <>
                        <View style={[styles.summaryCard, { backgroundColor: '#10B98110' }]}>
                            <Text style={[styles.summaryValue, { color: '#10B981' }]}>
                                {activeType === 'rooms'
                                    ? rooms.reduce((acc, r) => acc + (r.leadsCount || 0), 0)
                                    : jobs.reduce((acc, j) => acc + (j.leadsCount || 0), 0)
                                }
                            </Text>
                            <Text style={styles.summaryLabel}>Total Leads</Text>
                        </View>
                        <View style={[styles.summaryCard, { backgroundColor: '#F59E0B10' }]}>
                            <Text style={[styles.summaryValue, { color: '#F59E0B' }]}>
                                {activeType === 'rooms'
                                    ? rooms.reduce((acc, r) => acc + (r.viewsCount || 0), 0)
                                    : jobs.reduce((acc, j) => acc + (j.viewsCount || 0), 0)
                                }
                            </Text>
                            <Text style={styles.summaryLabel}>Total Views</Text>
                        </View>
                    </>
                )}
            </View>

            {/* Tab Selector */}
            <View style={styles.tabContainer}>
                {(['rooms', 'jobs', 'inquiries'] as const).map((type) => (
                    <TouchableOpacity
                        key={type}
                        style={[styles.tab, activeType === type && styles.tabActive]}
                        onPress={() => setActiveType(type)}
                    >
                        <MaterialCommunityIcons
                            name={type === 'rooms' ? 'home-city-outline' : type === 'jobs' ? 'briefcase-outline' : 'phone-incoming-outline'}
                            size={18}
                            color={activeType === type ? COLORS.primary : COLORS.textSecondary}
                        />
                        <Text style={[styles.tabText, activeType === type && styles.tabTextActive]}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : activeType === 'inquiries' ? (
                <FlatList
                    data={leads}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    renderItem={({ item }) => (
                        <View style={styles.leadCard}>
                            <View style={styles.leadHeader}>
                                <Text style={styles.leadType}>{item.listing_type.toUpperCase()}</Text>
                                <Text style={styles.leadTime}>{new Date(item.created_at).toLocaleDateString()}</Text>
                            </View>
                            <Text style={styles.leadName}>{item.inquirer?.name || 'Anonymous User'}</Text>
                            <Text style={styles.leadPhone}>{item.inquirer?.phone || 'No phone provided'}</Text>
                            <TouchableOpacity
                                style={styles.callBackBtn}
                                onPress={() => Alert.alert('Coming Soon', 'Direct call back feature is being integrated.')}
                            >
                                <MaterialCommunityIcons name="phone" size={16} color={COLORS.white} />
                                <Text style={styles.callBackText}>Call Back</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    ListEmptyComponent={
                        <View style={styles.centered}>
                            <MaterialCommunityIcons name="phone-off-outline" size={64} color={COLORS.border} />
                            <Text style={styles.emptyText}>No inquiries received yet</Text>
                        </View>
                    }
                />
            ) : (activeType === 'rooms' ? rooms : jobs).length === 0 ? (
                <View style={styles.centered}>
                    <MaterialCommunityIcons name="post-outline" size={64} color={COLORS.border} />
                    <Text style={styles.emptyText}>You haven't posted any {activeType} yet</Text>
                    <TouchableOpacity
                        style={styles.postNowButton}
                        onPress={() => navigation.navigate('PostListing')}
                    >
                        <Text style={styles.postNowText}>Post Now</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={(activeType === 'rooms' ? rooms : jobs) as any[]}
                    renderItem={activeType === 'rooms' ? renderRoom as any : renderJob as any}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        backgroundColor: COLORS.white,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
    },
    summaryContainer: {
        flexDirection: 'row',
        padding: SPACING.lg,
        gap: SPACING.sm,
        backgroundColor: COLORS.white,
    },
    summaryCard: {
        flex: 1,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    summaryValue: {
        fontSize: 18,
        fontWeight: '800',
    },
    summaryLabel: {
        fontSize: 10,
        color: COLORS.textSecondary,
        fontWeight: '600',
        marginTop: 2,
    },
    list: {
        padding: SPACING.lg,
        paddingBottom: 40,
    },
    tabContainer: {
        flexDirection: 'row',
        padding: SPACING.lg,
        paddingBottom: 0,
        gap: SPACING.md,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
    },
    tabActive: {
        borderBottomColor: COLORS.primary,
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
    card: {
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        marginBottom: SPACING.lg,
        ...SHADOWS.light,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.sm,
        backgroundColor: COLORS.success + '20',
    },
    occupiedBadge: {
        backgroundColor: COLORS.error + '20',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.text,
    },
    dateText: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 4,
    },
    price: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.primary,
        marginBottom: SPACING.lg,
    },
    actions: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingTop: SPACING.md,
        gap: SPACING.lg,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    deleteButton: {
        marginLeft: 'auto',
    },
    actionText: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginLeft: 4,
    },
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.xxl,
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.textSecondary,
        marginTop: SPACING.md,
        textAlign: 'center',
    },
    postNowButton: {
        marginTop: SPACING.xl,
        backgroundColor: COLORS.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: BORDER_RADIUS.md,
    },
    postNowText: {
        color: COLORS.white,
        fontWeight: '700',
    },
    statsRow: {
        flexDirection: 'row',
        paddingVertical: SPACING.md,
        gap: SPACING.xl,
    },
    stat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statValue: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.text,
    },
    statLabel: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    leadCard: {
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        marginBottom: SPACING.lg,
        ...SHADOWS.light,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.primary,
    },
    leadHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    leadType: {
        fontSize: 10,
        fontWeight: '800',
        color: COLORS.primary,
        letterSpacing: 1,
    },
    leadTime: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    leadName: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 4,
    },
    leadPhone: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: SPACING.lg,
    },
    callBackBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        paddingVertical: 10,
        borderRadius: BORDER_RADIUS.md,
        gap: 8,
    },
    callBackText: {
        color: COLORS.white,
        fontWeight: '700',
        fontSize: 14,
    },
});
