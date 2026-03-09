import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MainStackScreenProps, Job } from '../../types';
import { ContactSheet, QuickContactBar } from '../../components/ContactSheet';
import { ContactInfo } from '../../utils/contactUtils';
import { VerifiedCheck, TrustInfoCard } from '../../components/TrustBadges';
import { ReportSheet, ReportBlockActions } from '../../components/ReportSheet';
import { confirmBlock, blockUser, addToBlockedList } from '../../utils/trustSafetyUtils';
import { jobService } from '../../services/jobService';

// Mock — in production fetched by route.params.jobId
const MOCK_JOB: Job = {
    id: '1',
    employerId: 'e1',
    title: 'Security Guard',
    company: 'Tech Park Security Services',
    category: 'Guard',
    description: 'We are looking for a dedicated and reliable security guard for the day shift at our Hinjewadi Phase 1 tech park campus. The candidate should be physically fit, alert, and capable of handling visitor management and access control.\n\nPrevious experience in corporate/tech park security is preferred but not mandatory. We provide on-the-job training.',
    area: 'Phase 1',
    type: 'Full Time',
    experience: '2-5 years',
    salary: '₹15,000 - ₹20,000/mo',
    contactPhone: '9876543001',
    postedAgo: '2 days ago',
    urgent: false,
    requirements: [
        'Physical fitness',
        'Age between 25-45',
        'Marathi and Hindi speaking',
        'No criminal record',
        'Basic reading/writing',
    ],
    benefits: [
        'Provident Fund (PF)',
        'ESI Health Insurance',
        'Uniform provided free',
        'Weekly off (rotational)',
        'Festival bonus',
        'Overtime pay',
    ],
};

export const JobDetailScreen: React.FC<MainStackScreenProps<'JobDetail'>> = ({ route, navigation }) => {
    const { jobId } = route.params;
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [contactSheetVisible, setContactSheetVisible] = useState(false);
    const [reportVisible, setReportVisible] = useState(false);

    useEffect(() => {
        fetchJob();
    }, [jobId]);

    const fetchJob = async () => {
        try {
            setLoading(true);
            const data = await jobService.getJobById(jobId);
            if (data) {
                setJob(data);
                // Increment View
                jobService.incrementViews(jobId).catch(() => { });
            }
        } catch (error) {
            console.error('Failed to fetch job:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </SafeAreaView>
        );
    }

    if (!job) {
        return (
            <SafeAreaView style={[styles.container, styles.center]}>
                <Text style={styles.errorText}>Job listing not found.</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backLink}>Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const jobContact: ContactInfo = {
        id: job.id,
        name: job.company,
        phone: job.contactPhone,
        ownerId: job.employerId,
        context: 'job',
        contextTitle: job.title,
        contextCompany: job.company,
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Job Details</Text>
                    <TouchableOpacity style={styles.shareButton}>
                        <MaterialCommunityIcons name="share-variant" size={20} color={COLORS.text} />
                    </TouchableOpacity>
                </View>

                {/* Hero */}
                <View style={styles.heroCard}>
                    <View style={styles.heroImagePlaceholder}>
                        <MaterialCommunityIcons name="office-building" size={60} color={COLORS.border} />
                    </View>

                    <View style={styles.heroContent}>
                        <View style={styles.titleRow}>
                            <Text style={styles.jobTitle}>{job.title}</Text>
                            <VerifiedCheck verified={true} size={18} />
                            {job.urgent && (
                                <View style={styles.urgentBadge}>
                                    <MaterialCommunityIcons name="lightning-bolt" size={12} color={COLORS.white} />
                                    <Text style={styles.urgentText}>Urgent</Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.company}>{job.company}</Text>
                        <Text style={styles.postedAgo}>Posted {job.postedAgo}</Text>
                    </View>
                </View>

                {/* Quick Info */}
                <View style={styles.quickInfoRow}>
                    <View style={styles.quickInfoItem}>
                        <View style={[styles.quickInfoIcon, { backgroundColor: '#E3F0FF' }]}>
                            <MaterialCommunityIcons name="map-marker" size={20} color="#2563EB" />
                        </View>
                        <Text style={styles.quickInfoLabel}>Location</Text>
                        <Text style={styles.quickInfoValue}>{job.area}</Text>
                    </View>
                    <View style={styles.quickInfoItem}>
                        <View style={[styles.quickInfoIcon, { backgroundColor: '#FFF0E0' }]}>
                            <MaterialCommunityIcons name="clock-outline" size={20} color="#FF6D00" />
                        </View>
                        <Text style={styles.quickInfoLabel}>Type</Text>
                        <Text style={styles.quickInfoValue}>{job.type}</Text>
                    </View>
                    <View style={styles.quickInfoItem}>
                        <View style={[styles.quickInfoIcon, { backgroundColor: '#E8F5E9' }]}>
                            <MaterialCommunityIcons name="currency-inr" size={20} color={COLORS.success} />
                        </View>
                        <Text style={styles.quickInfoLabel}>Salary</Text>
                        <Text style={styles.quickInfoValue}>{job.salary}</Text>
                    </View>
                </View>

                {/* Experience */}
                <View style={styles.section}>
                    <View style={styles.sectionHeaderRow}>
                        <MaterialCommunityIcons name="briefcase-clock" size={20} color={COLORS.primary} />
                        <Text style={styles.sectionTitle}>Experience Required</Text>
                    </View>
                    <Text style={styles.experienceText}>{job.experience}</Text>
                </View>

                {/* Description */}
                <View style={styles.section}>
                    <View style={styles.sectionHeaderRow}>
                        <MaterialCommunityIcons name="text-box-outline" size={20} color={COLORS.primary} />
                        <Text style={styles.sectionTitle}>Job Description</Text>
                    </View>
                    <Text style={styles.descriptionText}>{job.description}</Text>
                </View>

                {/* Requirements */}
                <View style={styles.section}>
                    <View style={styles.sectionHeaderRow}>
                        <MaterialCommunityIcons name="clipboard-check-outline" size={20} color={COLORS.primary} />
                        <Text style={styles.sectionTitle}>Requirements</Text>
                    </View>
                    {job.requirements.map((req, idx) => (
                        <View key={idx} style={styles.listItem}>
                            <View style={styles.checkIcon}>
                                <MaterialCommunityIcons name="check" size={14} color={COLORS.primary} />
                            </View>
                            <Text style={styles.listItemText}>{req}</Text>
                        </View>
                    ))}
                </View>

                {/* Benefits */}
                <View style={styles.section}>
                    <View style={styles.sectionHeaderRow}>
                        <MaterialCommunityIcons name="gift-outline" size={20} color={COLORS.success} />
                        <Text style={styles.sectionTitle}>Benefits</Text>
                    </View>
                    {job.benefits.map((benefit, idx) => (
                        <View key={idx} style={styles.listItem}>
                            <View style={[styles.checkIcon, { backgroundColor: '#E8F5E9' }]}>
                                <MaterialCommunityIcons name="check" size={14} color={COLORS.success} />
                            </View>
                            <Text style={styles.listItemText}>{benefit}</Text>
                        </View>
                    ))}
                </View>

                {/* Employer Contact Info */}
                <View style={styles.section}>
                    <View style={styles.sectionHeaderRow}>
                        <MaterialCommunityIcons name="account-tie" size={20} color={COLORS.secondary} />
                        <Text style={styles.sectionTitle}>Employer Contact</Text>
                        <VerifiedCheck verified={true} />
                    </View>
                    <View style={styles.contactRow}>
                        <MaterialCommunityIcons name="phone" size={18} color={COLORS.textSecondary} />
                        <Text style={styles.contactText}>{job.contactPhone}</Text>
                    </View>
                </View>

                {/* Trust & Verification */}
                <View style={[styles.section, { padding: 0, overflow: 'hidden' }]}>
                    <TrustInfoCard
                        verificationStatus="verified"
                        trustScore={82}
                        totalReviews={23}
                        averageRating={4.6}
                        joinedAt="2024-09-15"
                    />
                </View>

                {/* Report & Safety */}
                <View style={styles.section}>
                    <View style={styles.sectionHeaderRow}>
                        <MaterialCommunityIcons name="shield-outline" size={20} color={COLORS.textSecondary} />
                        <Text style={styles.sectionTitle}>Safety</Text>
                    </View>
                    <Text style={{ fontSize: 13, color: COLORS.textSecondary, marginBottom: SPACING.sm }}>
                        Something wrong with this listing?
                    </Text>
                    <ReportBlockActions
                        onReport={() => setReportVisible(true)}
                        onBlock={() => confirmBlock(job.company, async () => {
                            await blockUser('currentUser', job.employerId, job.company, job.contactPhone, 'Manually blocked');
                        })}
                    />
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Bottom Action Bar */}
            <QuickContactBar contact={jobContact} style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }} />

            <ContactSheet
                visible={contactSheetVisible}
                onClose={() => setContactSheetVisible(false)}
                contact={jobContact}
            />

            <ReportSheet
                visible={reportVisible}
                onClose={() => setReportVisible(false)}
                targetId={job.id}
                targetType="job"
                targetName={job.title}
                reporterId="currentUser"
                targetUserId={job.employerId}
                targetUserName={job.company}
                targetUserPhone={job.contactPhone}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFB',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
        color: COLORS.textSecondary,
        marginBottom: 10,
    },
    backLink: {
        color: COLORS.primary,
        fontWeight: '700',
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
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.text,
    },
    shareButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.light,
    },
    // Hero
    heroCard: {
        marginHorizontal: SPACING.lg,
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.xl,
        overflow: 'hidden',
        ...SHADOWS.light,
    },
    heroImagePlaceholder: {
        width: '100%',
        height: 180,
        backgroundColor: '#EEF2F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroContent: {
        padding: SPACING.md,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    jobTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: COLORS.text,
        flex: 1,
    },
    urgentBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FF5252',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: BORDER_RADIUS.full,
        gap: 3,
        marginLeft: 8,
    },
    urgentText: {
        color: COLORS.white,
        fontSize: 11,
        fontWeight: '700',
    },
    company: {
        fontSize: 15,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    postedAgo: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    // Quick info
    quickInfoRow: {
        flexDirection: 'row',
        marginHorizontal: SPACING.lg,
        marginTop: SPACING.md,
        gap: SPACING.sm,
    },
    quickInfoItem: {
        flex: 1,
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        alignItems: 'center',
        ...SHADOWS.light,
    },
    quickInfoIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
    },
    quickInfoLabel: {
        fontSize: 11,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    quickInfoValue: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.text,
        textAlign: 'center',
        marginTop: 2,
    },
    // Sections
    section: {
        marginHorizontal: SPACING.lg,
        marginTop: SPACING.md,
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        ...SHADOWS.light,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: SPACING.sm,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
    },
    experienceText: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.primary,
        backgroundColor: '#E8F0FE',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: BORDER_RADIUS.full,
        alignSelf: 'flex-start',
        overflow: 'hidden',
    },
    descriptionText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        lineHeight: 22,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 6,
    },
    checkIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#E8F0FE',
        alignItems: 'center',
        justifyContent: 'center',
    },
    listItemText: {
        fontSize: 14,
        color: COLORS.text,
        flex: 1,
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    contactText: {
        fontSize: 15,
        color: COLORS.text,
        fontWeight: '600',
    },
    // Bottom Bar
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        padding: SPACING.md,
        paddingBottom: SPACING.xl,
        gap: SPACING.sm,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        ...SHADOWS.medium,
    },
    bottomCallBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.success,
        paddingVertical: 14,
        borderRadius: BORDER_RADIUS.full,
        gap: 8,
    },
    bottomBtnText: {
        color: COLORS.white,
        fontWeight: '700',
        fontSize: 15,
    },
    bottomWhatsappBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E8F5E9',
        paddingVertical: 14,
        borderRadius: BORDER_RADIUS.full,
        gap: 8,
        borderWidth: 1,
        borderColor: '#C8E6C9',
    },
    bottomWhatsappText: {
        color: COLORS.success,
        fontWeight: '700',
        fontSize: 15,
    },
});
