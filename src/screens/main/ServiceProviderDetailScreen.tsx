import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MainStackScreenProps, ServiceProvider, ServiceReview } from '../../types';
import { ContactSheet, QuickContactBar } from '../../components/ContactSheet';
import { ContactInfo } from '../../utils/contactUtils';
import { VerifiedCheck, TrustInfoCard } from '../../components/TrustBadges';
import { ReportSheet, ReportBlockActions } from '../../components/ReportSheet';
import { confirmBlock, blockUser } from '../../utils/trustSafetyUtils';
import { providerService } from '../../services/providerService';
import { useProviderDetail, useAddReview } from '../../hooks/useProviders';
import { useAuth } from '../../context/AuthContext';
import { trustService } from '../../services/trustService';



const StarRating = ({ rating, size = 18, interactive = false, onRate }: {
    rating: number;
    size?: number;
    interactive?: boolean;
    onRate?: (r: number) => void;
}) => (
    <View style={{ flexDirection: 'row', gap: 4 }}>
        {[1, 2, 3, 4, 5].map(star => (
            <TouchableOpacity
                key={star}
                disabled={!interactive}
                onPress={() => onRate?.(star)}
            >
                <MaterialCommunityIcons
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={size}
                    color={star <= rating ? '#FFB800' : '#D1D5DB'}
                />
            </TouchableOpacity>
        ))}
    </View>
);

const ReviewCard = ({ review }: { review: ServiceReview }) => (
    <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
            <View style={styles.reviewerAvatar}>
                <Text style={styles.reviewerInitial}>{review.userName[0]}</Text>
            </View>
            <View style={styles.reviewerInfo}>
                <Text style={styles.reviewerName}>{review.userName}</Text>
                <Text style={styles.reviewDate}>{review.date}</Text>
            </View>
            <StarRating rating={review.rating} size={14} />
        </View>
        <Text style={styles.reviewText}>{review.comment}</Text>
    </View>
);

export const ServiceProviderDetailScreen: React.FC<MainStackScreenProps<'ServiceProviderDetail'>> = ({ navigation, route }) => {
    const { providerId } = route.params;
    const { user } = useAuth();
    const [showRateForm, setShowRateForm] = useState(false);
    const [userRating, setUserRating] = useState(0);
    const [userComment, setUserComment] = useState('');
    const { mutate: submitReview, isPending: isSubmittingReview } = useAddReview();

    const [contactSheetVisible, setContactSheetVisible] = useState(false);
    const [reportVisible, setReportVisible] = useState(false);
    const [trustProfile, setTrustProfile] = useState<any>(null);

    const { data: provider, isLoading, error } = useProviderDetail(providerId);

    useEffect(() => {
        if (provider) {
            // Increment View
            providerService.incrementViews(providerId).catch(() => { });

            // Fetch provider trust profile
            const targetUserId = provider.userId || provider.id;
            if (targetUserId) {
                trustService.getTrustProfile(targetUserId)
                    .then(profile => {
                        setTrustProfile(profile);
                    })
                    .catch(err => console.error('[ServiceProviderDetailScreen] Error fetching trust profile:', err));
            }
        }
    }, [provider, providerId]);

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </SafeAreaView>
        );
    }

    if (error || !provider) {
        return (
            <SafeAreaView style={[styles.container, styles.center]}>
                <Text style={styles.errorText}>Provider not found.</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backLink}>Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const providerContact: ContactInfo = {
        id: provider.id,
        name: provider.name,
        phone: provider.phone,
        whatsapp: provider.whatsapp,
        ownerId: provider.userId,
        context: 'service',
        contextTitle: provider.category,
    };

    const handleSubmitRating = () => {
        if (!user) {
            Alert.alert('Sign In Required', 'Please sign in to leave a review.');
            return;
        }
        if (userRating === 0) {
            Alert.alert('Rating Required', 'Please select a star rating before submitting.');
            return;
        }
        submitReview(
            {
                providerId,
                review: {
                    userName: user.name,
                    rating: userRating,
                    comment: userComment,
                    userId: user.id,
                },
            },
            {
                onSuccess: () => {
                    Alert.alert('Review Submitted', 'Thank you for your feedback!');
                    setShowRateForm(false);
                    setUserRating(0);
                    setUserComment('');
                },
                onError: () => {
                    Alert.alert('Error', 'Failed to submit review. Please try again.');
                },
            }
        );
    };

    const statusColors: Record<string, { bg: string; text: string }> = {
        Available: { bg: '#E8F5E9', text: COLORS.success },
        Busy: { bg: '#FFF3E0', text: '#FF9800' },
        Paused: { bg: '#FFEBEE', text: '#EF5350' },
    };
    const status = statusColors[provider.availability] || statusColors.Available;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Provider Profile</Text>
                    <TouchableOpacity style={styles.shareButton}>
                        <MaterialCommunityIcons name="share-variant" size={20} color={COLORS.text} />
                    </TouchableOpacity>
                </View>

                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={[styles.avatar, { backgroundColor: provider.avatarColor }]}>
                        <Text style={styles.avatarText}>{provider.initial}</Text>
                    </View>
                    <Text style={styles.providerName}>
                        {provider.name}
                        <VerifiedCheck verified={true} size={18} />
                    </Text>
                    <Text style={styles.categoryLabel}>{provider.category}</Text>

                    {/* Rating */}
                    <View style={styles.ratingRow}>
                        <StarRating rating={Math.round(provider.rating)} />
                        <Text style={styles.ratingValue}>{provider.rating}</Text>
                        <Text style={styles.ratingCount}>({provider.totalRatings} reviews)</Text>
                    </View>

                    {/* Status */}
                    <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                        <View style={[styles.statusDot, { backgroundColor: status.text }]} />
                        <Text style={[styles.statusLabel, { color: status.text }]}>{provider.availability}</Text>
                    </View>
                </View>

                {/* Quick Info */}
                <View style={styles.quickInfoSection}>
                    <View style={styles.quickInfoRow}>
                        <View style={styles.quickInfoItem}>
                            <View style={styles.quickInfoIcon}>
                                <MaterialCommunityIcons name="clock-outline" size={22} color={COLORS.secondary} />
                            </View>
                            <Text style={styles.quickInfoLabel}>Experience</Text>
                            <Text style={styles.quickInfoValue}>{provider.experience}</Text>
                        </View>
                        <View style={styles.quickInfoItem}>
                            <View style={styles.quickInfoIcon}>
                                <MaterialCommunityIcons name="currency-inr" size={22} color={COLORS.success} />
                            </View>
                            <Text style={styles.quickInfoLabel}>Price Range</Text>
                            <Text style={styles.quickInfoValue}>{provider.priceRange}</Text>
                        </View>
                        <View style={styles.quickInfoItem}>
                            <View style={styles.quickInfoIcon}>
                                <MaterialCommunityIcons name="star" size={22} color="#FFB800" />
                            </View>
                            <Text style={styles.quickInfoLabel}>Ratings</Text>
                            <Text style={styles.quickInfoValue}>{provider.totalRatings}</Text>
                        </View>
                    </View>
                </View>

                {/* About */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About</Text>
                    <Text style={styles.descriptionText}>{provider.description}</Text>
                </View>

                {/* Working Hours */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Working Hours</Text>
                    <View style={styles.infoRow}>
                        <MaterialCommunityIcons name="clock-time-four-outline" size={18} color={COLORS.secondary} />
                        <Text style={styles.infoValue}>{provider.workingHours}</Text>
                    </View>
                </View>

                {/* Areas Served */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Areas Served</Text>
                    <View style={styles.chipsRow}>
                        {provider.areas.map((area, idx) => (
                            <View key={idx} style={styles.areaChip}>
                                <MaterialCommunityIcons name="map-marker" size={14} color={COLORS.primary} />
                                <Text style={styles.areaChipText}>{area}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Skills */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Skills & Services</Text>
                    <View style={styles.chipsRow}>
                        {provider.skills.map((skill, idx) => (
                            <View key={idx} style={styles.skillChip}>
                                <Text style={styles.skillText}>{skill}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Real trust profile loaded per provider */}
                {trustProfile && (
                    <View style={{ marginHorizontal: SPACING.md, marginBottom: SPACING.md }}>
                        <TrustInfoCard
                            verificationStatus={trustProfile.verificationStatus}
                            trustScore={trustProfile.trustScore}
                            totalReviews={trustProfile.totalReviews}
                            averageRating={trustProfile.averageRating}
                            joinedAt={trustProfile.joinedAt}
                        />
                    </View>
                )}

                {/* Reviews */}
                <View style={styles.section}>
                    <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionTitle}>Reviews ({provider.reviews.length})</Text>
                        <TouchableOpacity
                            style={styles.rateButton}
                            onPress={() => setShowRateForm(!showRateForm)}
                        >
                            <MaterialCommunityIcons name="star-plus" size={16} color={COLORS.secondary} />
                            <Text style={styles.rateButtonText}>Rate</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Rate Form */}
                    {showRateForm && (
                        <View style={styles.rateForm}>
                            <Text style={styles.rateFormLabel}>Your Rating</Text>
                            <StarRating rating={userRating} size={32} interactive onRate={setUserRating} />
                            <TextInput
                                style={styles.rateInput}
                                placeholder="Write your review..."
                                placeholderTextColor={COLORS.textSecondary}
                                value={userComment}
                                onChangeText={setUserComment}
                                multiline
                                numberOfLines={3}
                            />
                            <TouchableOpacity
                                style={[styles.submitRateBtn, userRating === 0 && { opacity: 0.5 }]}
                                disabled={userRating === 0}
                                onPress={handleSubmitRating}
                            >
                                <Text style={styles.submitRateBtnText}>Submit Review</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {provider.reviews.map(review => (
                        <ReviewCard key={review.id} review={review} />
                    ))}
                </View>

                <View style={{ height: 120 }} />

                {/* Safety section */}

                {/* Report & Safety */}
                <View style={styles.section}>
                    <View style={styles.sectionHeaderRow}>
                        <MaterialCommunityIcons name="shield-outline" size={20} color={COLORS.textSecondary} />
                        <Text style={styles.sectionTitle}>Safety</Text>
                    </View>
                    <Text style={{ fontSize: 13, color: COLORS.textSecondary, marginBottom: SPACING.sm }}>
                        Something wrong with this profile?
                    </Text>
                    <ReportBlockActions
                        onReport={() => setReportVisible(true)}
                        onBlock={() => confirmBlock(provider.name, async () => {
                            if (!user) return;
                            await blockUser(user.id, provider.id, provider.name, provider.phone, 'Manually blocked');
                        })}
                    />
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Bottom Contact Bar */}
            <QuickContactBar
                contact={providerContact}
                onShowContactSheet={() => setContactSheetVisible(true)}
                style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}
            />

            <ContactSheet
                visible={contactSheetVisible}
                onClose={() => setContactSheetVisible(false)}
                contact={providerContact}
            />

            <ReportSheet
                visible={reportVisible}
                onClose={() => setReportVisible(false)}
                targetId={provider.id}
                targetType="service"
                targetName={provider.name}
                reporterId={user?.id ?? ''}
                targetUserId={provider.id}
                targetUserName={provider.name}
                targetUserPhone={provider.phone}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
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
        backgroundColor: COLORS.surface,
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
        backgroundColor: COLORS.surface,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.light,
    },
    profileCard: {
        backgroundColor: COLORS.surface,
        marginHorizontal: SPACING.lg,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.xl,
        alignItems: 'center',
        ...SHADOWS.light,
    },
    avatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.md,
        borderWidth: 3,
        borderColor: COLORS.surfaceAlt,
        ...SHADOWS.medium,
    },
    avatarText: {
        fontSize: 30,
        fontWeight: '800',
        color: COLORS.secondary,
    },
    providerName: {
        fontSize: 22,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: 4,
    },
    categoryLabel: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontWeight: '500',
        marginBottom: SPACING.sm,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: SPACING.md,
    },
    ratingValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#F59E0B',
    },
    ratingCount: {
        fontSize: 13,
        color: COLORS.textSecondary,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: BORDER_RADIUS.full,
        gap: 6,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusLabel: {
        fontSize: 13,
        fontWeight: '700',
    },
    quickInfoSection: {
        marginHorizontal: SPACING.lg,
        marginTop: SPACING.md,
    },
    quickInfoRow: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    quickInfoItem: {
        flex: 1,
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        alignItems: 'center',
        ...SHADOWS.light,
    },
    quickInfoIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.white + '10',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.xs,
    },
    quickInfoLabel: {
        fontSize: 11,
        color: COLORS.textSecondary,
        fontWeight: '500',
        marginBottom: 2,
    },
    quickInfoValue: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.text,
        textAlign: 'center',
    },
    section: {
        marginHorizontal: SPACING.lg,
        marginTop: SPACING.lg,
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        ...SHADOWS.light,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: SPACING.sm,
    },
    descriptionText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        lineHeight: 22,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    infoValue: {
        fontSize: 14,
        color: COLORS.text,
        fontWeight: '600',
    },
    chipsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    areaChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F0FE',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: BORDER_RADIUS.full,
        gap: 4,
    },
    areaChipText: {
        fontSize: 13,
        color: COLORS.primary,
        fontWeight: '600',
    },
    skillChip: {
        backgroundColor: '#F0E6FF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: BORDER_RADIUS.full,
    },
    skillText: {
        fontSize: 12,
        color: COLORS.secondary,
        fontWeight: '600',
    },
    rateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0E6FF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: BORDER_RADIUS.full,
        gap: 4,
        marginBottom: SPACING.sm,
    },
    rateButtonText: {
        fontSize: 13,
        color: COLORS.secondary,
        fontWeight: '600',
    },
    rateForm: {
        backgroundColor: COLORS.surfaceAlt,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        gap: SPACING.sm,
    },
    rateFormLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
    },
    rateInput: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.sm,
        fontSize: 14,
        color: COLORS.text,
        minHeight: 80,
        textAlignVertical: 'top',
        backgroundColor: COLORS.surface,
    },
    submitRateBtn: {
        backgroundColor: COLORS.secondary,
        paddingVertical: 12,
        borderRadius: BORDER_RADIUS.full,
        alignItems: 'center',
    },
    submitRateBtnText: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: '700',
    },
    reviewCard: {
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    reviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    reviewerAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#E8F0FE',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.sm,
    },
    reviewerInitial: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.primary,
    },
    reviewerInfo: {
        flex: 1,
    },
    reviewerName: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.text,
    },
    reviewDate: {
        fontSize: 11,
        color: COLORS.textSecondary,
    },
    reviewText: {
        fontSize: 13,
        color: COLORS.textSecondary,
        lineHeight: 20,
        marginLeft: 40,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        padding: SPACING.md,
        paddingBottom: SPACING.xl,
        gap: SPACING.sm,
        backgroundColor: COLORS.surface,
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
    bottomCallText: {
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
